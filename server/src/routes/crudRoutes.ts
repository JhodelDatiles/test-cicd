import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controller/userController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/users", verifyToken, authorizeRoles("admin"), getUsers);
router.get("/users/:id", verifyToken, getUserById);
router.patch("/users/:id", verifyToken, updateUser);
router.delete("/users/:id", verifyToken, authorizeRoles("admin"), deleteUser);

export default router;
