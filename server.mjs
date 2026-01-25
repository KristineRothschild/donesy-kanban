import express from "express";
import errorHandler, { NotFoundError, ValidationError } from "./middleware.mjs";

const app = express();
const PORT = 8080;

app.use(express.json());

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

app.get("/boards", (req, res) => {
  res.json({ boards });
});

app.use(express.static("public"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
