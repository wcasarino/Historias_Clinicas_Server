import express from "express";

import {
  getPacientes,
  getPacientesBySearch,
  getPaciente,
  createPaciente,
  updatePaciente,
  AddAtencion,
  DeleteAtencion,
  UpdateAtencion,
  deletePaciente,
  resumenPaciente,
  domicilioPaciente,
  personaPaciente,
  afamiliaresPaciente,
  amedicosPaciente,
  aginecoPaciente,
  ahabitosPaciente,
  apsicosocialPaciente,
  DeleteFileAtencion,
  proximaAtencionPaciente,
  allPacientes,
} from "../controllers/pacientes.js";

const router = express.Router();
import auth from "../middleware/auth.js";

// Necesitan autorización
//router.delete('/:id', auth, deletePaciente);
//router.post('/', auth, createPaciente);

router.delete("/:id", auth, deletePaciente);
router.post("/", auth, createPaciente);

router.get("/exportar", auth, allPacientes);
router.get("/", auth, getPacientes);
router.get("/search", auth, getPacientesBySearch);
router.get("/:id", auth, getPaciente);
router.patch("/:id", auth, updatePaciente);

router.patch("/:id/DeleteAtencion", auth, DeleteAtencion);
router.patch("/:id/UpdateAtencion", auth, UpdateAtencion);
router.post("/:id/AddAtencion", auth, AddAtencion);

router.patch("/:id/DeleteFileAtencion", DeleteFileAtencion);

router.post("/:id/resumenPaciente", auth, resumenPaciente);
router.post("/:id/proximaAtencionPaciente", auth, proximaAtencionPaciente);
router.post("/:id/domicilioPaciente", auth, domicilioPaciente);
router.post("/:id/personaPaciente", auth, personaPaciente);
router.post("/:id/afamiliaresPaciente", auth, afamiliaresPaciente);
router.post("/:id/amedicosPaciente", auth, amedicosPaciente);
router.post("/:id/aginecoPaciente", auth, aginecoPaciente);
router.post("/:id/ahabitosPaciente", auth, ahabitosPaciente);
router.post("/:id/apsicosocialPaciente", auth, apsicosocialPaciente);

export default router;
