import express from "express";

const app = express();
const PORT = 8080;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
