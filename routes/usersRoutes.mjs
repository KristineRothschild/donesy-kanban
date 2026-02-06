import { Router } from "express";
import { NotFoundError, ValidationError } from "../middleware.mjs";

export function createUserRoutes({ users, saveUsers, getNextUserId }) {
  const router = Router();

  router.get("/", (req, res) => {
    res.json({ users });
  });

  router.get("/:id", (req, res, next) => {
    const userId = parseInt(req.params.id);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return next(new NotFoundError("User", userId));
    }

    res.json({ user });
  });

  router.post("/", (req, res, next) => {
    const { name, email, password, acceptedTos, acceptedPrivacy } = req.body;

    if (!name || !email || !password) {
      return next(new ValidationError([], "Name, email and password are required"));
    }

    if (!acceptedTos || !acceptedPrivacy) {
      return next(
        new ValidationError(
          [],
          "You must accept Terms of Service and Privacy Policy",
        ),
      );
    }

    const existingUser = users.find((u) => u.email === email.toLowerCase());
    if (existingUser) {
      return next(new ValidationError([], "Email is already registered"));
    }

    const newUser = {
      id: getNextUserId(),
      name: name,
      email: email.toLowerCase(),
      password: password,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers();

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  });

  router.post("/login", (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError([], "Email and password are required"));
    }

    const user = users.find((u) => u.email === email.toLowerCase());

    if (!user || user.password !== password) {
      return next(new ValidationError([], "Invalid email or password"));
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  });

  router.put("/:id", (req, res, next) => {
    const userId = parseInt(req.params.id);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return next(new NotFoundError("User", userId));
    }

    const { name } = req.body;

    if (name) {
      user.name = name;
    }

    saveUsers();

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  });

  router.delete("/:id", (req, res, next) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return next(new NotFoundError("User", userId));
    }

    users.splice(userIndex, 1);
    saveUsers();

    res.status(204).send();
  });

  return router;
}
