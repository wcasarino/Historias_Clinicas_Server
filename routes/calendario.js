import express from "express";

import {
  getCalendarioTodo,
  getCalendarioProximo,
} from "../controllers/calendario.js";

import auth from "../middleware/auth.js";

const router = express.Router();
router.get("/search", auth, getCalendarioTodo);
router.get("/proximo", auth, getCalendarioProximo);
export default router;
