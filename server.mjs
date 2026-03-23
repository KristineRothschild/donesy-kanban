import express from "express";
import session from "express-session";
import errorHandler from "./middleware.mjs";
import { getLanguage } from "./locales/i18n.mjs";
import { createUserRoutes } from "./routes/usersRoutes.mjs";
import { createBoardRoutes } from "./routes/boardsRoutes.mjs";
import { createTaskRoutes } from "./routes/tasksRoutes.mjs";
import { createUsersService } from "./services/usersService.mjs";
import { createBoardsService } from "./services/boardsService.mjs";
import { createTasksService } from "./services/tasksService.mjs";
import db from "./db/db.mjs";

const app = express();
const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret-change-me",
    resave: false,
    saveUninitialized: false,
    proxy: process.env.NODE_ENV === "production",
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: "auto",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(express.json());

app.use((req, res, next) => {
  req.lang = getLanguage(req.headers["accept-language"]);
  next();
});

const usersService = createUsersService({ db });

const boardsService = createBoardsService({ db });
const tasksService = createTasksService({ db, boardsService });

const userRoutes = createUserRoutes({ usersService });
const boardRoutes = createBoardRoutes({ boardsService, tasksService });
const taskRoutes = createTaskRoutes({ tasksService });

app.use("/users", userRoutes);
app.use("/boards", boardRoutes);
app.use("/tasks", taskRoutes);

app.use(express.static("public"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
