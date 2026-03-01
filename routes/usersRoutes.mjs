import { Router } from "express";

export function createUserRoutes({ usersService }) {
  const router = Router();

  router.get("/", (req, res) => {
    const users = usersService.getAllUsers();
    res.json({ users });
  });

  router.get("/:id", (req, res, next) => {
    try {
      const user = usersService.getUserById(parseInt(req.params.id));
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", (req, res, next) => {
    try {
      const user = usersService.createUser(req.body);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", (req, res, next) => {
    try {
      const user = usersService.loginUser(req.body.email, req.body.password);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", (req, res, next) => {
    try {
      const user = usersService.updateUser(parseInt(req.params.id), req.body);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", (req, res, next) => {
    try {
      usersService.deleteUser(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
