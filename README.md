# Workshop Booking System

Система управления бронированием мастер-классов. Пользователи просматривают мастер-классы и записываются на них, администраторы управляют каталогом.

## Стек

**Backend**
- NestJS + TypeScript
- TypeORM + SQLite (better-sqlite3)
- JWT-аутентификация (passport-jwt)
- bcrypt, class-validator, class-transformer

**Frontend**
- Next.js 16 + TypeScript
- Tailwind CSS

**Инфраструктура**
- Docker + docker-compose

## Запуск

```bash
docker-compose up --build
```

API доступен на `http://localhost:3000`, клиент — `http://localhost:3001`.

<details>
<summary>Запуск без Docker (если что-то пошло не так)</summary>

```bash
# Backend (порт 3000)
npm install
npm run start:dev

# Frontend (порт 3001)
cd client
npm install
npm run dev
```

</details>

## Функционал

**Для всех**
- Просмотр списка мастер-классов с количеством свободных мест
- Детальная страница мастер-класса

**Для авторизованных пользователей**
- Запись на мастер-класс
- Просмотр своих броней (`/my-bookings`)
- Отмена брони

**Для администратора**
- Создание, редактирование, удаление мастер-классов (`/admin/workshops`)

## API

| Метод | Путь | Доступ |
|-------|------|--------|
| POST | /api/auth/register | Публичный |
| POST | /api/auth/login | Публичный |
| GET | /api/workshops | Публичный |
| GET | /api/workshops/:id | Публичный |
| POST | /api/workshops | Admin |
| PUT | /api/workshops/:id | Admin |
| DELETE | /api/workshops/:id | Admin |
| POST | /api/bookings | Авторизованный |
| GET | /api/bookings/my | Авторизованный |
| DELETE | /api/bookings/:id | Авторизованный |

## Учётные данные администратора

```
Email:    admin@test.com
Password: secret123
```

> Роль администратора устанавливается вручную через БД:
> ```sql
> UPDATE users SET role='admin' WHERE email='your@email.com';
> ```
