import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Archive,
  Bell,
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  ChevronsRight,
  CirclePlus,
  Cloud,
  Contact,
  Expand,
  FileText,
  Folder,
  Heart,
  Info,
  Menu,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Plane,
  Search,
  Settings,
  Smile,
  Star,
  Users,
  X
} from "lucide-react";
import "./styles.css";

const chats = [
  {
    id: "ai-devs",
    title: "AI Devs",
    icon: Bot,
    members: 12430,
    online: 1480,
    unread: 18,
    palette: "violet",
    x: 36,
    y: 28,
    tone: "more than 5000",
    handle: "@ai_devs",
    pinned: "Правила, roadmap и полезные ссылки",
    messages: [
      { author: "Мария К.", avatar: "МК", text: "Всем привет! Как прошел релиз? Делимся впечатлениями.", time: "10:15", accent: "teal" },
      { author: "Игорь", avatar: "И", text: "Все прошло гладко, спасибо команде! Отчет приложу ниже.", time: "10:17", accent: "blue", file: "release-report.pdf" },
      { author: "Алексей", avatar: "А", text: "Отличная работа! Следующая цель - оптимизация производительности.", time: "10:21", accent: "green", reactions: ["👍 15", "🔥 6"] },
      { author: "Ольга", avatar: "О", text: "Поддерживаю! Уже есть идеи 💡", time: "10:23", accent: "purple" }
    ]
  },
  {
    id: "general",
    title: "Общий чат",
    icon: MessageCircle,
    members: 5421,
    online: 512,
    unread: 7,
    palette: "teal",
    x: 63,
    y: 51,
    tone: "more than 5000",
    handle: "@cloud_general",
    pinned: "Правила чата и полезные ссылки",
    messages: [
      { author: "Мария К.", avatar: "МК", text: "Всем привет! 👋 Как прошел релиз? Делимся впечатлениями.", time: "10:15", accent: "teal" },
      { author: "Игорь", avatar: "И", text: "Все прошло гладко, спасибо команде! Отчет приложу ниже.", time: "10:17", accent: "blue", file: "release-report.pdf" },
      { author: "Алексей", avatar: "А", text: "Отличная работа! 🚀 Следующая цель - оптимизация производительности.", time: "10:21", accent: "green", reactions: ["👍 15", "🔥 6"] },
      { author: "Ольга", avatar: "О", text: "Поддерживаю! Уже есть идеи 💡", time: "10:23", accent: "purple" }
    ]
  },
  {
    id: "news",
    title: "Новости",
    icon: Cloud,
    members: 8920,
    online: 940,
    unread: 2,
    palette: "blue",
    x: 72,
    y: 25,
    tone: "more than 5000",
    handle: "@news",
    pinned: "Главные обновления продукта и инфраструктуры",
    messages: [
      { author: "Редакция", avatar: "Р", text: "Новый дайджест уже в канале. Коротко: облако чатов стало основной навигацией.", time: "09:42", accent: "blue" },
      { author: "Редакция", avatar: "Р", text: "Появился режим сортировки по активности.", time: "09:58", accent: "blue" },
      { author: "Редакция", avatar: "Р", text: "Вечером выкатим мобильную адаптацию.", time: "10:08", accent: "blue" }
    ]
  },
  {
    id: "crimson",
    title: "Crimson Wars",
    icon: X,
    members: 2310,
    online: 173,
    unread: 0,
    palette: "red",
    x: 28,
    y: 62,
    tone: "1000 - 5000",
    handle: "@crimsonwars",
    pinned: "Патчноуты, матчи и баланс",
    messages: [
      { author: "Lead", avatar: "L", text: "Проверяем новый билд на арене.", time: "14:01", accent: "red" },
      { author: "Nika", avatar: "N", text: "Визуальный эффект удара стал гораздо чище.", time: "14:06", accent: "purple" },
      { author: "You", avatar: "Y", text: "Отлично, оставляем и гоняем нагрузку.", time: "14:11", accent: "green" }
    ]
  },
  {
    id: "memes",
    title: "Memes",
    emoji: "😅",
    members: 701,
    online: 84,
    unread: 11,
    palette: "purple",
    x: 47,
    y: 74,
    tone: "100 - 1000",
    handle: "@cloud_memes",
    pinned: "Легкий шум разрешен, токсичный - нет",
    messages: [
      { author: "Sasha", avatar: "S", text: "Нужен стикер с пузырем чата, который слишком популярен.", time: "13:18", accent: "purple" },
      { author: "Kate", avatar: "K", text: "И маленький чат рядом: 'я тоже важный'.", time: "13:20", accent: "teal" },
      { author: "You", avatar: "Y", text: "Это уже продуктовая философия.", time: "13:21", accent: "green" }
    ]
  },
  {
    id: "work",
    title: "Работа",
    icon: BriefcaseBusiness,
    members: 53,
    online: 12,
    unread: 1,
    palette: "slate",
    x: 20,
    y: 20,
    tone: "less than 100",
    handle: "private",
    pinned: "Дейлики, релизы, приоритеты",
    messages: [
      { author: "Dima", avatar: "D", text: "Созвон перенесли на 16:30.", time: "11:03", accent: "blue" },
      { author: "Lena", avatar: "L", text: "Я обновила список задач.", time: "11:12", accent: "teal" },
      { author: "You", avatar: "Y", text: "Вижу, после деплоя пройдусь по UI.", time: "11:20", accent: "green" }
    ]
  },
  {
    id: "friends",
    title: "Друзья",
    icon: Users,
    members: 28,
    online: 9,
    unread: 0,
    palette: "cyan",
    x: 21,
    y: 42,
    tone: "less than 100",
    handle: "private",
    pinned: "Планы на выходные",
    messages: [
      { author: "Anna", avatar: "A", text: "Кофе или кино?", time: "15:01", accent: "teal" },
      { author: "Misha", avatar: "M", text: "Кино, но потом кофе.", time: "15:07", accent: "blue" },
      { author: "You", avatar: "Y", text: "Дипломатично и правильно.", time: "15:08", accent: "green" }
    ]
  },
  {
    id: "travel",
    title: "Travel Buddies",
    emoji: "✈️",
    members: 126,
    online: 30,
    unread: 4,
    palette: "blue",
    x: 82,
    y: 63,
    tone: "100 - 1000",
    handle: "@travel",
    pinned: "Маршруты и билеты",
    messages: [
      { author: "Ilya", avatar: "I", text: "Поймал хорошие цены на сентябрь.", time: "12:18", accent: "blue" },
      { author: "Nina", avatar: "N", text: "Кидай, пока они не исчезли.", time: "12:21", accent: "purple" },
      { author: "You", avatar: "Y", text: "Сохранил варианты в избранное.", time: "12:24", accent: "green" }
    ]
  },
  {
    id: "crypto",
    title: "Крипто Трейдеры",
    emoji: "📈",
    members: 312,
    online: 64,
    unread: 0,
    palette: "teal",
    x: 12,
    y: 61,
    tone: "100 - 1000",
    handle: "@crypto",
    pinned: "Без финансовых советов",
    messages: [
      { author: "Max", avatar: "M", text: "Рынок снова делает вид, что все под контролем.", time: "08:14", accent: "teal" },
      { author: "Eva", avatar: "E", text: "Мой контроль - это лимитки и чай.", time: "08:19", accent: "purple" },
      { author: "You", avatar: "Y", text: "Мудро.", time: "08:20", accent: "green" }
    ]
  },
  {
    id: "xedoc",
    title: "Проект Xedoc",
    icon: Folder,
    members: 14,
    online: 5,
    unread: 0,
    palette: "teal",
    x: 55,
    y: 15,
    tone: "less than 100",
    handle: "private",
    pinned: "Задачи сайта и инфраструктуры",
    messages: [
      { author: "Rodion", avatar: "R", text: "Нужно сделать cloud.xedoc.ru живым.", time: "18:30", accent: "green" },
      { author: "Codex", avatar: "C", text: "Собираю интерфейс под Telegram Web.", time: "18:36", accent: "blue" },
      { author: "Rodion", avatar: "R", text: "И сразу деплой.", time: "18:37", accent: "green" }
    ]
  },
  {
    id: "family",
    title: "Семья",
    icon: Heart,
    members: 7,
    online: 3,
    unread: 0,
    palette: "slate",
    x: 58,
    y: 31,
    tone: "less than 100",
    handle: "private",
    pinned: "Домашние планы",
    messages: [
      { author: "Mom", avatar: "M", text: "Посылку кто-нибудь заберет?", time: "16:09", accent: "purple" },
      { author: "You", avatar: "Y", text: "Я заберу по дороге.", time: "16:13", accent: "green" },
      { author: "Dad", avatar: "D", text: "Тогда ужин на мне.", time: "16:18", accent: "blue" }
    ]
  },
  {
    id: "design",
    title: "Дизайн Команда",
    icon: Folder,
    members: 19,
    online: 6,
    unread: 0,
    palette: "amber",
    x: 84,
    y: 41,
    tone: "less than 100",
    handle: "@design_team",
    pinned: "Макеты, токены и компоненты",
    messages: [
      { author: "Nika", avatar: "N", text: "Нужен вариант ближе к Telegram.", time: "17:32", accent: "purple" },
      { author: "Ilya", avatar: "I", text: "Темный WebK, стекло, круглые аватары, компактные controls.", time: "17:41", accent: "blue" },
      { author: "You", avatar: "Y", text: "Берем.", time: "17:47", accent: "green" }
    ]
  },
  {
    id: "cinema",
    title: "Киночат",
    emoji: "🎬",
    members: 42,
    online: 11,
    unread: 0,
    palette: "teal",
    x: 66,
    y: 78,
    tone: "less than 100",
    handle: "@cinema",
    pinned: "Список фильмов недели",
    messages: [
      { author: "Sasha", avatar: "S", text: "Сегодня нуар или космос?", time: "15:04", accent: "blue" },
      { author: "Kate", avatar: "K", text: "Космос, но с хорошей музыкой.", time: "15:11", accent: "purple" },
      { author: "You", avatar: "Y", text: "Ставлю голосование.", time: "15:22", accent: "green" }
    ]
  }
];

const navItems = [
  ["Облако", Cloud, true],
  ["Поиск", Search],
  ["Контакты", Contact],
  ["Уведомления", Bell, false, 3],
  ["Избранное", Star],
  ["Настройки", Settings]
];

const legendItems = [
  ["более 5 000", "violet"],
  ["1 000 - 5 000", "blue"],
  ["100 - 1 000", "red"],
  ["менее 100", "teal"]
];

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function bubbleSize(members) {
  const min = Math.log10(2);
  const max = Math.log10(14000);
  const normalized = (Math.log10(members + 2) - min) / (max - min);
  return Math.round(72 + normalized * 260);
}

function App() {
  const [selectedId, setSelectedId] = useState("general");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("members");
  const selected = chats.find((chat) => chat.id === selectedId) ?? chats[0];

  const filteredChats = useMemo(() => {
    const term = query.trim().toLowerCase();
    const visible = chats.filter((chat) => {
      return (
        !term ||
        chat.title.toLowerCase().includes(term) ||
        chat.handle.toLowerCase().includes(term)
      );
    });

    return [...visible].sort((a, b) => {
      if (sortMode === "activity") return b.unread + b.online / 100 - (a.unread + a.online / 100);
      return b.members - a.members;
    });
  }, [query, sortMode]);

  return (
    <main className="telegram-shell">
      <aside className="tg-sidebar">
        <div className="cloud-logo" aria-label="CloudChat">
          <Cloud size={28} />
        </div>

        <nav className="tg-nav" aria-label="Навигация">
          {navItems.map(([label, Icon, active, badge]) => (
            <button className={active ? "tg-nav-item active" : "tg-nav-item"} key={label}>
              <span>
                <Icon size={25} strokeWidth={1.8} />
                {badge && <b>{badge}</b>}
              </span>
              <small>{label}</small>
            </button>
          ))}
        </nav>

        <div className="account">
          <div className="account-avatar">А</div>
          <i />
          <span>Алексей</span>
          <ChevronDown size={14} />
        </div>
        <button className="more-button" aria-label="Еще">
          <MoreVertical size={22} />
        </button>
      </aside>

      <section className="cloud-page">
        <header className="tg-topbar">
          <div className="title-select">
            <h1>Облако чатов</h1>
            <ChevronDown size={18} />
          </div>

          <label className="tg-search">
            <Search size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск чатов и людей..."
            />
            <kbd>⌘ K</kbd>
          </label>

          <div className="segmented">
            <button
              className={sortMode === "members" ? "active" : ""}
              onClick={() => setSortMode("members")}
            >
              по участникам
            </button>
            <button
              className={sortMode === "activity" ? "active" : ""}
              onClick={() => setSortMode("activity")}
            >
              по активности
            </button>
          </div>

          <div className="size-hint">
            <Info size={18} />
            <span>Размер круга зависит<br />от количества участников</span>
          </div>
          <ChevronsRight className="double-chevron" size={22} />
        </header>

        <section className="star-map" aria-label="Карта чатов">
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="orbit orbit-c" />
          <div className="orbit orbit-d" />
          <button className="add-chat" aria-label="Добавить чат">
            <CirclePlus size={30} />
          </button>

          {filteredChats.map((chat, index) => {
            const Icon = chat.icon;
            const size = bubbleSize(chat.members);
            const titleSize = Math.max(12, Math.min(32, Math.round(size * 0.1)));
            const countSize = Math.max(11, Math.min(25, Math.round(size * 0.078)));
            const iconSize = Math.max(26, Math.min(74, Math.round(size * 0.24)));
            return (
              <button
                className={`planet planet-${chat.palette} ${selected.id === chat.id ? "selected" : ""}`}
                key={chat.id}
                style={{
                  "--size": `${size}px`,
                  "--title-size": `${titleSize}px`,
                  "--count-size": `${countSize}px`,
                  "--icon-size": `${iconSize}px`,
                  "--x": `${chat.x}%`,
                  "--y": `${chat.y}%`,
                  "--delay": `${index * 0.06}s`
                }}
                onClick={() => setSelectedId(chat.id)}
                aria-label={`${chat.title}, ${chat.members} участников`}
              >
                <span className="planet-icon">
                  {Icon ? <Icon size={34} strokeWidth={1.8} /> : chat.emoji}
                </span>
                <strong>{chat.title}</strong>
                <em>{formatNumber(chat.members)}</em>
                {chat.unread > 0 && <b>{chat.unread}</b>}
              </button>
            );
          })}

          <div className="face-dot dot-one">А</div>
          <div className="face-dot dot-two">И</div>
          <div className="face-dot dot-three">О</div>

          <div className="legend">
            <h2>Легенда</h2>
            {legendItems.map(([label, tone]) => (
              <span key={label}>
                <i className={`legend-${tone}`} />
                {label}
              </span>
            ))}
          </div>

          <div className="zoom-panel">
            <button aria-label="Уменьшить">−</button>
            <span>100%</span>
            <button aria-label="Увеличить">+</button>
            <i />
            <button aria-label="На весь экран">
              <Expand size={22} />
            </button>
          </div>
        </section>
      </section>

      <aside className="chat-pane">
        <header className="chat-head">
          <div className={`chat-avatar avatar-${selected.palette}`}>
            {selected.icon ? <selected.icon size={28} /> : selected.emoji}
          </div>
          <div>
            <h2>{selected.title}</h2>
            <p>{formatNumber(selected.members)} участник, {formatNumber(selected.online)} онлайн</p>
          </div>
          <div className="chat-actions">
            <button aria-label="Поиск">
              <Search size={23} />
            </button>
            <button aria-label="Закрепить">
              <Star size={22} />
            </button>
            <button aria-label="Меню">
              <MoreVertical size={23} />
            </button>
          </div>
        </header>

        <section className="pinned">
          <div>
            <strong>Закреплённое сообщение</strong>
            <span>{selected.pinned}</span>
          </div>
          <Star size={20} />
        </section>

        <div className="day-divider">
          <span>Сегодня</span>
        </div>

        <section className="messages">
          {selected.messages.map((message) => (
            <article className="message-row" key={`${selected.id}-${message.author}-${message.time}`}>
              <div className={`userpic userpic-${message.accent}`}>{message.avatar}</div>
              <div className="bubble">
                <div className="meta">
                  <strong>{message.author}</strong>
                  <time>{message.time}</time>
                </div>
                <p>{message.text}</p>
                {message.file && (
                  <div className="file-card">
                    <FileText size={25} />
                    <div>
                      <strong>{message.file}</strong>
                      <span>2.4 MB</span>
                    </div>
                  </div>
                )}
                {message.reactions && (
                  <div className="reactions">
                    {message.reactions.map((reaction) => (
                      <span key={reaction}>{reaction}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

        <footer className="composer">
          <button aria-label="Прикрепить">
            <Paperclip size={25} />
          </button>
          <label>
            <input placeholder="Напишите сообщение..." />
            <Smile size={23} />
          </label>
          <button className="send" aria-label="Отправить">
            <Plane size={23} fill="currentColor" />
          </button>
          <small>••• {formatNumber(selected.online)} пользователей печатают...</small>
        </footer>
      </aside>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
