# Donesy-kanban

A Kanban board designed for students to manage tasks. It can be shared with others through an invitation link, allowing the owner to provide viewing or editing permissions for collaborative projects and assignments.

## Feature map

https://miro.com/app/live-embed/uXjVGQe8ojA=/?embedMode=view_only_without_ui&moveToViewport=-1777%2C-741%2C5897%2C1591&embedId=149657881517

## Project Management

https://trello.com/invite/b/69810d39c9aa178b16e37ab6/ATTI4b8ac8845409de085458b31a788ae69e825324F0/pm-donesy-kanban-app

---

## API Documentation

Authentication uses **cookies** via `express-session`. Call `POST /users/login` or `POST /users` (register) first; the response sets a session cookie.

Protected routes require a logged-in session (boards, tasks, `GET /users/me`, updating/deleting your own user).

For local development, log in again if the server restarts because sessions are stored in memory.

**Environment:** In production, set `SESSION_SECRET` to a long random string. Session cookies use `Secure` automatically on HTTPS hosts, and the app enables `trust proxy` in production.

### Boards API

- `GET /boards` - Boards the user owns or is a member of
- `GET /boards/:id` - One board (must have access)
- `POST /boards` - Create board (body: `name`, optional `description`, optional `visibility`: `private` | `shared`)
- `PUT /boards/:id` - Update board (owner only)
- `DELETE /boards/:id` - Delete board (owner only)
- `GET /boards/:boardId/columns` - List Kanban columns for a board

### Tasks API

- `GET /boards/:boardId/tasks` - List tasks on a board
- `POST /boards/:boardId/tasks` - Create task (owner or editor; body: `title`, optional `description`, `columnId`, `dueDate`, `assigneeUserId`)
- `PUT /tasks/:taskId` - Update task (owner or editor; can set `columnId` to move)
- `DELETE /tasks/:taskId` - Delete task (owner or editor)

### Users API

- `GET /users/me` - Current user (requires session; `401` if not logged in)
- `POST /users/logout` - Log out (clears session)
- `GET /users` - Get all users
- `GET /users/:id` - Get a specific user
- `POST /users` - Register (creates a session for the new user)
- `POST /users/login` - Login (creates a session)
- `PUT /users/:id` - Update user (session user id must match `:id`)
- `DELETE /users/:id` - Delete user (session user id must match `:id`; session destroyed)

### Testing

The API is tested with HTTPie. The exported test setup can be found in `httpie-space-donesy-kanban.json`.

## Live Service URL

https://donesy-kanban.onrender.com

## PostgreSQL Setup (Users + Boards)

This project stores users, boards, columns, tasks, and sharing tables in PostgreSQL with raw SQL using `pg`.

1. Run migration:
   - `npm run migrate`
2. Start server:
   - `npm run dev` or `npm start`

Migration files are in `db/migrations`:

- `001_create_users_table.sql`
- `002_create_boards_table.sql`
- `003_alter_boards_owner_visibility.sql`
- `004_create_board_columns.sql`
- `005_create_tasks.sql`
- `006_create_board_members_and_invites.sql`
