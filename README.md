# Donesy-kanban

A Kanban board designed for students to manage tasks. It can be shared with others through an invitation link, allowing the owner to provide viewing or editing permissions for collaborative projects and assignments.

## Feature map

https://miro.com/app/live-embed/uXjVGQe8ojA=/?embedMode=view_only_without_ui&moveToViewport=-1777%2C-741%2C5897%2C1591&embedId=149657881517

## Project Management

https://trello.com/invite/b/69810d39c9aa178b16e37ab6/ATTI4b8ac8845409de085458b31a788ae69e825324F0/pm-donesy-kanban-app

---

## API Documentation

### Boards API

- `GET /boards` - Get all boards
- `GET /boards/:id` - Get a specific board
- `POST /boards` - Create a new board
- `PUT /boards/:id` - Update a board
- `DELETE /boards/:id` - Delete a board

### Users API

- `GET /users` - Get all users
- `GET /users/:id` - Get a specific user
- `POST /users` - Create a new user
- `POST /users/login` - Login
- `DELETE /users/:id` - Delete a user

### Testing

The API can be tested with HTTPie. Exported test setup can be found in `httpie-space-donesy-kanban.json`.
