import express from "express";
import errorHandler from "./middleware.mjs";
import { getLanguage } from "./locales/i18n.mjs";
import { createUserRoutes } from "./routes/usersRoutes.mjs";
import { createBoardRoutes } from "./routes/boardsRoutes.mjs";
import { createUsersService } from "./services/usersService.mjs";
import { createBoardsService } from "./services/boardsService.mjs";
import db from "./db/db.mjs";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use((req, res, next) => {
  req.lang = getLanguage(req.headers["accept-language"]);
  next();
});

const usersService = createUsersService({ db });

const boardsService = createBoardsService({ db });

const userRoutes = createUserRoutes({ usersService });
const boardRoutes = createBoardRoutes({ boardsService });

app.use("/users", userRoutes);
app.use("/boards", boardRoutes);

app.use(express.static("public"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
