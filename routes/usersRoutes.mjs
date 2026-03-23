import { Router } from "express";
import { getSessionUserId } from "../auth.mjs";
import { ForbiddenError } from "../middleware.mjs";

export function createUserRoutes({ usersService }) {
  const router = Router();

  router.get("/me", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const user = await usersService.getUserById(userId);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.post("/logout", async (req, res, next) => {
    try {
      req.session.destroy(function (err) {
        if (err) {
          next(err);
          return;
        }
        res.clearCookie("connect.sid");
        res.status(204).send();
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/", async (req, res, next) => {
    try {
      const users = await usersService.getAllUsers();
      res.json({ users });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const user = await usersService.createUser(req.body);
      req.session.userId = user.id;
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const user = await usersService.loginUser(req.body.email, req.body.password);
      req.session.userId = user.id;
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const user = await usersService.getUserById(parseInt(req.params.id, 10));
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const sessionUserId = getSessionUserId(req);
      const id = parseInt(req.params.id, 10);
      if (sessionUserId !== id) {
        throw new ForbiddenError("You can only update your own account");
      }
      const user = await usersService.updateUser(id, req.body);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const sessionUserId = getSessionUserId(req);
      const id = parseInt(req.params.id, 10);
      if (sessionUserId !== id) {
        throw new ForbiddenError("You can only delete your own account");
      }
      await usersService.deleteUser(id);
      req.session.destroy(function (err) {
        if (err) {
          next(err);
          return;
        }
        res.clearCookie("connect.sid");
        res.status(204).send();
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
