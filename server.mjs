import express from "express";
import errorHandler from "./middleware.mjs";
import { createUserRoutes } from "./routes/usersRoutes.mjs";
import { createBoardRoutes } from "./routes/boardsRoutes.mjs";
import { users, saveUsers, getNextUserId } from "./data/usersData.mjs";
import { boards, getNextBoardId } from "./data/boardsData.mjs";

const app = express();
const PORT = 8080;

app.use(express.json());

const userRoutes = createUserRoutes({
  users,
  saveUsers,
  getNextUserId,
});

const boardRoutes = createBoardRoutes({
  boards,
  getNextBoardId,
});

app.use("/users", userRoutes);
app.use("/boards", boardRoutes);

app.use(express.static("public"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
