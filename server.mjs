import express from "express";
import fs from "fs";
import errorHandler, { NotFoundError, ValidationError } from "./middleware.mjs";
import { createUserRoutes } from "./routes/users.mjs";
import { createBoardRoutes } from "./routes/boards.mjs";

const app = express();
const PORT = 8080;
const USERS_FILE = "users.json";

app.use(express.json());

function loadUsers() {
  if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  }
  return [];
}

function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

const users = loadUsers();
let nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

const userRoutes = createUserRoutes({
  users,
  saveUsers,
  getNextUserId: () => nextUserId++,
});

const boards = [
  {
    id: 1,
    name: "Application Development 1",
    description: "Group project",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Application Development 2",
    description: "Individual project",
    createdAt: new Date().toISOString(),
  },
];
let nextBoardId = 3;

const boardRoutes = createBoardRoutes({
  boards,
  getNextBoardId: () => nextBoardId++,
});

app.use("/users", userRoutes);
app.use("/boards", boardRoutes);

app.use(express.static("public"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
