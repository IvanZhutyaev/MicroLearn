# MicroLearn - Платформа микро-обучения

Fullstack платформа для создания и прохождения образовательных курсов с системой мотивации и отслеживания прогресса.

## Технологический стек

### Frontend
- Next.js 14+ с TypeScript
- Tailwind CSS
- Redux Toolkit
- React Query
- Framer Motion

### Backend
- NestJS с TypeScript
- PostgreSQL + Prisma ORM
- Redis (для кэширования)
- JWT аутентификация
- Stripe для платежей

## Установка и запуск

### Предварительные требования
- Node.js 18+
- Docker и Docker Compose
- PostgreSQL (или используйте Docker)
- Redis (или используйте Docker)

### Быстрый старт с Docker

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd MicroLearn
```

2. Настройте переменные окружения:
```bash
# Backend
cp backend/.env.example backend/.env
# Отредактируйте backend/.env с вашими настройками

# Frontend
cp frontend/.env.example frontend/.env.local
# Отредактируйте frontend/.env.local
```

3. Запустите с Docker Compose:
```bash
docker-compose up -d
```

### Ручная установка

#### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Структура проекта

```
MicroLearn/
├── backend/              # NestJS приложение
│   ├── src/
│   │   ├── auth/        # Модуль аутентификации
│   │   ├── users/       # Модуль пользователей
│   │   ├── courses/     # Модуль курсов
│   │   ├── progress/    # Модуль прогресса
│   │   ├── achievements/# Модуль достижений
│   │   └── payments/    # Модуль платежей
│   └── prisma/          # Prisma схема
├── frontend/            # Next.js приложение
│   ├── src/
│   │   ├── app/         # Страницы Next.js
│   │   ├── components/  # React компоненты
│   │   ├── lib/         # Утилиты и API
│   │   └── store/       # Redux store
└── docker-compose.yml   # Docker конфигурация
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/verify-email` - Подтверждение email
- `POST /api/auth/refresh` - Обновление токена

### Курсы
- `GET /api/courses` - Список курсов
- `GET /api/courses/:id` - Детали курса
- `POST /api/courses` - Создание курса (teacher)
- `PUT /api/courses/:id` - Обновление курса
- `DELETE /api/courses/:id` - Удаление курса
- `POST /api/courses/:id/publish` - Публикация курса

### Прогресс
- `GET /api/progress/courses/:id` - Прогресс по курсу
- `POST /api/progress/lessons/:id` - Отметить урок пройденным
- `PUT /api/progress/lessons/:id` - Обновить прогресс урока
- `GET /api/progress/statistics` - Общая статистика

### Платежи
- `POST /api/payments/create-intent` - Создать платежное намерение
- `POST /api/payments/confirm` - Подтвердить платеж
- `GET /api/payments/history` - История платежей
- `POST /api/payments/refund/:id` - Запрос возврата

## Функциональность

### Реализовано
- ✅ Регистрация и авторизация с JWT
- ✅ Подтверждение email
- ✅ CRUD операции для курсов
- ✅ Структура курса (модули, уроки, контент)
- ✅ Отслеживание прогресса обучения
- ✅ Система достижений
- ✅ Интеграция Stripe для платежей
- ✅ Поиск и фильтрация курсов

### В разработке
- ⏳ OAuth2 (Google/GitHub)
- ⏳ Загрузка файлов на AWS S3
- ⏳ Система рейтингов
- ⏳ Ежедневные задания
- ⏳ Лидерборды

## Тестирование

```bash
# Backend тесты
cd backend
npm run test

# E2E тесты
npm run test:e2e
```

## Деплой

### Backend (Railway/Render)
1. Подключите репозиторий
2. Настройте переменные окружения
3. Запустите миграции: `npx prisma migrate deploy`

### Frontend (Vercel)
1. Подключите репозиторий
2. Настройте переменные окружения
3. Деплой автоматический

## Лицензия

MIT

## Автор

Жутяев Иван
