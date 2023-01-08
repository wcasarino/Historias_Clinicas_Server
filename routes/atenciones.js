import express from "express";

import {
  getAnoAtenciones,
  getAtencionesBySearch,
  changeDiaPra,
  deleteDiaPra,
  arrayDiaPra,
  deleteFoto,
  addUserId,
} from "../controllers/atenciones.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/search", auth, getAtencionesBySearch);
router.get("/", getAnoAtenciones);
router.patch("/changeDiaPra", changeDiaPra);
router.patch("/deleteDiaPra", deleteDiaPra);
router.patch("/arrayDiaPra", arrayDiaPra);
router.patch("/deleteFoto", deleteFoto);
router.patch("/addUserId", addUserId);

export default router;
