import "dotenv/config";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 4178);
const distDir = path.join(__dirname, "dist");
const sessionFile = path.resolve(
  process.env.TELEGRAM_SESSION_FILE || path.join(__dirname, ".data", "telegram-session.txt")
);

let clientPromise = null;
let pendingLogin = null;

app.use(express.json({ limit: "1mb" }));

function apiCredentials() {
  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;

  if (!Number.isFinite(apiId) || !apiHash) {
    return null;
  }

  return { apiId, apiHash };
}

async function readSession() {
  try {
    return (await fs.readFile(sessionFile, "utf8")).trim();
  } catch {
    return "";
  }
}

async function saveSession(client) {
  await fs.mkdir(path.dirname(sessionFile), { recursive: true });
  await fs.writeFile(sessionFile, client.session.save(), "utf8");
}

async function removeSession() {
  await fs.rm(sessionFile, { force: true });
}

async function getClient() {
  const credentials = apiCredentials();

  if (!credentials) {
    const error = new Error("Telegram API credentials are not configured");
    error.status = 503;
    error.code = "SETUP_REQUIRED";
    throw error;
  }

  if (!clientPromise) {
    clientPromise = (async () => {
      const client = new TelegramClient(
        new StringSession(await readSession()),
        credentials.apiId,
        credentials.apiHash,
        { connectionRetries: 5 }
      );
      await client.connect();
      return client;
    })();
  }

  return clientPromise;
}

function userToJson(user) {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Telegram";

  return {
    id: String(user.id),
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    username: user.username || "",
    phone: user.phone || "",
    name
  };
}

async function authSnapshot() {
  if (!apiCredentials()) {
    return { configured: false, authorized: false, user: null };
  }

  const client = await getClient();
  const authorized = await client.isUserAuthorized().catch(() => false);

  if (!authorized) {
    return { configured: true, authorized: false, user: null };
  }

  const me = await client.getMe();
  return { configured: true, authorized: true, user: userToJson(me) };
}

function stableNumber(value) {
  let hash = 0;
  for (const char of String(value || "")) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function initials(title) {
  return (
    String(title || "TG")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "TG"
  );
}

function formatTime(unixTime) {
  if (!unixTime) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(Number(unixTime) * 1000));
}

function dialogTitle(dialog, entity) {
  return (
    dialog.title ||
    dialog.name ||
    entity.title ||
    [entity.firstName, entity.lastName].filter(Boolean).join(" ") ||
    entity.username ||
    "Telegram chat"
  );
}

function dialogKind(dialog) {
  if (dialog.isUser) return "private";
  if (dialog.isChannel) return "channel";
  if (dialog.isGroup) return "group";
  return "chat";
}

function participantsCount(dialog, entity, kind) {
  const direct =
    entity.participantsCount ??
    entity.participants_count ??
    entity.membersCount ??
    entity.members_count ??
    dialog.participantsCount;

  if (Number(direct) > 0) return Number(direct);
  if (kind === "private") return 1;
  return Math.max(1, Number(dialog.unreadCount || 0), Number(entity.unreadCount || 0));
}

function serializeDialog(dialog, index) {
  const entity = dialog.entity || {};
  const id = String(dialog.id ?? entity.id ?? `${index}`);
  const title = dialogTitle(dialog, entity);
  const kind = dialogKind(dialog);
  const hash = stableNumber(`${id}:${title}`);
  const palettes = ["violet", "teal", "blue", "red", "purple", "cyan", "slate", "amber"];
  const palette = palettes[hash % palettes.length];
  const preview = dialog.message?.message || "";

  return {
    id,
    title,
    kind,
    members: participantsCount(dialog, entity, kind),
    online: 0,
    unread: Number(dialog.unreadCount || 0),
    palette,
    x: 12 + (hash % 76),
    y: 15 + ((hash >> 8) % 66),
    handle: entity.username ? `@${entity.username}` : kind,
    pinned: dialog.pinned ? "Закрепленный чат Telegram" : "Реальный чат Telegram",
    preview,
    lastMessageTime: formatTime(dialog.message?.date),
    messages: [
      {
        author: title,
        avatar: initials(title),
        text: preview || "Последнее сообщение не содержит текста или еще не загружено.",
        time: formatTime(dialog.message?.date),
        accent: palette
      }
    ]
  };
}

app.get("/api/telegram/status", async (_req, res, next) => {
  try {
    res.json(await authSnapshot());
  } catch (error) {
    next(error);
  }
});

app.post("/api/telegram/send-code", async (req, res, next) => {
  try {
    const credentials = apiCredentials();
    const phoneNumber = String(req.body.phoneNumber || "").trim();

    if (!credentials) {
      return res.status(503).json({ error: "SETUP_REQUIRED", message: "Telegram API credentials are not configured" });
    }

    if (!phoneNumber) {
      return res.status(400).json({ error: "PHONE_REQUIRED", message: "Введите номер телефона" });
    }

    const client = await getClient();
    const result = await client.sendCode(credentials, phoneNumber);
    pendingLogin = {
      phoneNumber,
      phoneCodeHash: result.phoneCodeHash,
      isCodeViaApp: Boolean(result.isCodeViaApp)
    };

    res.json({ ok: true, isCodeViaApp: pendingLogin.isCodeViaApp });
  } catch (error) {
    next(error);
  }
});

app.post("/api/telegram/sign-in", async (req, res, next) => {
  try {
    const phoneNumber = String(req.body.phoneNumber || pendingLogin?.phoneNumber || "").trim();
    const code = String(req.body.code || "").trim().replace(/\s+/g, "");

    if (!pendingLogin || pendingLogin.phoneNumber !== phoneNumber) {
      return res.status(400).json({ error: "CODE_REQUEST_REQUIRED", message: "Сначала запросите код Telegram" });
    }

    if (!code) {
      return res.status(400).json({ error: "CODE_REQUIRED", message: "Введите код из Telegram" });
    }

    const client = await getClient();

    try {
      await client.invoke(
        new Api.auth.SignIn({
          phoneNumber,
          phoneCodeHash: pendingLogin.phoneCodeHash,
          phoneCode: code
        })
      );
      await saveSession(client);
      pendingLogin = null;
      res.json({ ok: true, ...(await authSnapshot()) });
    } catch (error) {
      if (String(error.errorMessage || error.message).includes("SESSION_PASSWORD_NEEDED")) {
        return res.json({ ok: false, needsPassword: true });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/telegram/password", async (req, res, next) => {
  try {
    const credentials = apiCredentials();
    const password = String(req.body.password || "");

    if (!credentials) {
      return res.status(503).json({ error: "SETUP_REQUIRED", message: "Telegram API credentials are not configured" });
    }

    if (!password) {
      return res.status(400).json({ error: "PASSWORD_REQUIRED", message: "Введите пароль 2FA" });
    }

    const client = await getClient();
    await client.signInWithPassword(credentials, {
      password: async () => password,
      onError: (error) => {
        throw error;
      }
    });
    await saveSession(client);
    pendingLogin = null;
    res.json({ ok: true, ...(await authSnapshot()) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/telegram/chats", async (req, res, next) => {
  try {
    const snapshot = await authSnapshot();

    if (!snapshot.authorized) {
      return res.status(401).json({ error: "AUTH_REQUIRED", message: "Аккаунт Telegram не подключен" });
    }

    const client = await getClient();
    const limit = Math.min(200, Math.max(10, Number(req.query.limit || 80)));
    const dialogs = await client.getDialogs({ limit });

    res.json({
      user: snapshot.user,
      chats: dialogs.map(serializeDialog)
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/telegram/logout", async (_req, res, next) => {
  try {
    if (clientPromise) {
      const client = await clientPromise;
      await client.invoke(new Api.auth.LogOut()).catch(() => {});
      await client.disconnect().catch(() => {});
    }
    clientPromise = null;
    pendingLogin = null;
    await removeSession();
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(distDir));

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(distDir, "index.html"));
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  const code = error.code || error.errorMessage || "SERVER_ERROR";
  res.status(status).json({
    error: code,
    message: error.message || "Unexpected server error"
  });
});

app.listen(port, () => {
  console.log(`cloud.xedoc.ru Telegram server listening on :${port}`);
});
