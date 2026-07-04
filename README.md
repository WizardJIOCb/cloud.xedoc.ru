# cloud.xedoc.ru

Альтернативный Telegram Web-like клиент с облаком чатов вместо стандартного списка.

Интерфейс вдохновлен Telegram Web: широкий левый rail, верхний поиск, компактные controls, правая панель чата, pinned-message зона, сообщения и composer. Центральная область заменяет список чатов на орбитальное облако: размер каждого круга считается от количества участников.

## Запуск

```bash
npm install
npm run dev
```

## Backend с реальным Telegram

Для реальных диалогов используется MTProto через GramJS. Telegram Login Widget не подходит для этой задачи, потому что он подтверждает личность пользователя, но не дает доступ к списку чатов.

1. Получите `api_id` и `api_hash` на `my.telegram.org` в разделе API development tools.
2. Скопируйте `.env.example` в `.env`.
3. Заполните:

```env
PORT=4178
TELEGRAM_API_ID=
TELEGRAM_API_HASH=
TELEGRAM_SESSION_FILE=.data/telegram-session.txt
```

4. Соберите фронт и запустите сервер:

```bash
npm run build
npm start
```

После первого входа сессия Telegram сохраняется в `.data/telegram-session.txt`.

## Что уже есть

- облако чатов с размерами по `members`;
- поиск по названию и handle;
- сортировка по участникам и активности;
- авторизация Telegram по номеру, коду и 2FA;
- загрузка реальных диалогов аккаунта через backend;
- адаптивный layout для десктопа и мобильного.
