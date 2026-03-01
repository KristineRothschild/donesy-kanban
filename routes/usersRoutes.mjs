import { Router } from "express";

export function createUserRoutes({ usersService }) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const users = await usersService.getAllUsers();
      res.json({ users });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const user = await usersService.getUserById(parseInt(req.params.id));
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const user = await usersService.createUser(req.body);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const user = await usersService.loginUser(req.body.email, req.body.password);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const user = await usersService.updateUser(parseInt(req.params.id), req.body);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      await usersService.deleteUser(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
