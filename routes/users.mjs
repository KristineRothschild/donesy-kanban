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
    const { email, password, acceptedTos, acceptedPrivacy } = req.body;

    if (!email || !password) {
      return next(new ValidationError([], "Email and password are required"));
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
      email: email.toLowerCase(),
      password: password,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers();

    res.status(201).json({
      user: {
        id: newUser.id,
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
