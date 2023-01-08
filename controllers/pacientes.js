import mongoose from "mongoose";
import fs from "fs";

import PacienteDatos from "../models/pacienteDatos.js";

export const allPacientes = async (req, res) => {
  console.log("Entro a allPacientes");
  const userId = req.userId;
  try {
    const data = await PacienteDatos.find({ userId }).sort({
      apellidos: 1,
      nombres: 1,
    });
    res.status(200).json({ data, message: "", error: false });
  } catch (error) {
    res.status(200).json({
      data: null,
      message: "no se puede obtener los pacientes",
      error: true,
    });
  }
};

export const getPacientes = async (req, res) => {
  const { page } = req.query;
  const userId = req.userId;
  console.log("Entro a getPacientes");

  try {
    const LIMIT = 13;
    const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    const total = await PacienteDatos.countDocuments({ userId });
    const pacientes = await PacienteDatos.find({ userId })
      .sort({ proximaAtencion: -1 })
      .limit(LIMIT)
      .skip(startIndex);
    res.status(201).json({
      data: pacientes,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
      documentos: total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPaciente = async (req, res) => {
  console.log("Entro a createPaciente");
  const paciente = req.body;
  const newPacienteDatos = new PacienteDatos({
    ...paciente,
    userId: req.userId,
  });
  try {
    const pacienteDNI = await PacienteDatos.findOne({
      $and: [
        {
          dni: newPacienteDatos.dni,
          userId: newPacienteDatos.userId,
        },
      ],
    });
    if (pacienteDNI) {
      res.status(201).json({ data: pacienteDNI, dniDuplicado: true });
    } else {
      await newPacienteDatos.save();
      res.status(201).json({ data: newPacienteDatos, dniDuplicado: false });
    }
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const getPacientesBySearch = async (req, res) => {
  const {
    searchQuery,
    tags,
    vista,
    page,
    fechaAte1,
    anomesStr,
    diagnosticos,
    practicas,
  } = req.query;
  const userId = req.userId;
  console.log("Entro a getPacientesBySearch", page);
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const LIMIT = 13;
    const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page

    let newSearch = "";
    searchQuery === "9a69dc7e834f617"
      ? (newSearch = "")
      : (newSearch = searchQuery);
    const dni = new RegExp(newSearch, "i");
    const apellidos = new RegExp(newSearch, "i");
    const nombres = new RegExp(newSearch, "i");

    let busDx = { $exists: false };
    let busDx2 = { $exists: true };
    let busPra = { $exists: false };
    let busPra2 = { $exists: true };
    let busTags2 = { $exists: true };

    if (diagnosticos.length > 0) {
      busDx = { $in: diagnosticos.split(",") };
      busDx2 = { $in: diagnosticos.split(",") };
    }

    if (practicas.length > 0) {
      busPra = { $in: practicas.split(",") };
      busPra2 = { $in: practicas.split(",") };
    }

    if (tags.length > 0) {
      busTags2 = { $in: tags.split(",") };
    }

    let pacientes = [];
    let total = 1;

    switch (vista) {
      case "anomes":
        pacientes = await PacienteDatos.find({
          $and: [
            { $or: [{ dni }, { apellidos }, { nombres }] },
            { userId },
            { tags: busTags2 },
            {
              atenciones: {
                $elemMatch: {
                  diagnosticos: busDx2,
                  practicas: busPra2,
                  anomesStr: { $eq: anomesStr },
                },
              },
            },
          ],
        })
          .sort({ proximaAtencion: -1 })
          .limit(LIMIT)
          .skip(startIndex);
        total = await PacienteDatos.countDocuments({
          $and: [
            { $or: [{ dni }, { apellidos }, { nombres }] },
            { userId },
            { tags: busTags2 },
            {
              atenciones: {
                $elemMatch: {
                  diagnosticos: busDx2,
                  practicas: busPra2,
                  anomesStr: { $eq: anomesStr },
                },
              },
            },
          ],
        });

        break;

      case "dia":
        pacientes = await PacienteDatos.find({
          $and: [
            { $or: [{ dni }, { apellidos }, { nombres }] },
            { userId },
            { tags: busTags2 },
            {
              atenciones: {
                $elemMatch: {
                  diagnosticos: busDx2,
                  practicas: busPra2,
                  diaStr: { $eq: fechaAte1 },
                },
              },
            },
          ],
        })
          .sort({ proximaAtencion: -1 })
          .limit(LIMIT)
          .skip(startIndex);
        total = await PacienteDatos.countDocuments({
          $and: [
            { $or: [{ dni }, { apellidos }, { nombres }] },
            { userId },
            { tags: busTags2 },
            {
              atenciones: {
                $elemMatch: {
                  diagnosticos: busDx2,
                  practicas: busPra2,
                  diaStr: { $eq: fechaAte1 },
                },
              },
            },
          ],
        });

        break;

      case "proxima":
        pacientes = await PacienteDatos.find({
          $and: [
            { $or: [{ dni }, { apellidos }, { nombres }] },
            { userId },
            { tags: busTags2 },
            {
              $or: [
                { "atenciones.diagnosticos": busDx },
                { "atenciones.diagnosticos": busDx2 },
              ],
            },
            {
              $or: [
                { "atenciones.practicas": busPra },
                { "atenciones.practicas": busPra2 },
              ],
            },
            { proximaAtencion: { $gte: today } },
          ],
        })
          .sort({ proximaAtencion: 1 })
          .limit(LIMIT)
          .skip(startIndex);
        total = await PacienteDatos.countDocuments({
          $and: [
            { $or: [{ dni }, { apellidos }, { nombres }] },
            { userId },
            { tags: busTags2 },
            {
              $or: [
                { "atenciones.diagnosticos": busDx },
                { "atenciones.diagnosticos": busDx2 },
              ],
            },
            {
              $or: [
                { "atenciones.practicas": busPra },
                { "atenciones.practicas": busPra2 },
              ],
            },
            { proximaAtencion: { $gte: today } },
          ],
        });

        break;

      case "todos":
        pacientes = await PacienteDatos.find({
          $and: [
            { $or: [{ dni }, { apellidos }, { nombres }] },
            { userId },
            { tags: busTags2 },
            {
              $or: [
                { "atenciones.diagnosticos": busDx },
                { "atenciones.diagnosticos": busDx2 },
              ],
            },
            {
              $or: [
                { "atenciones.practicas": busPra },
                { "atenciones.practicas": busPra2 },
              ],
            },
          ],
        })
          .sort({ proximaAtencion: -1 })
          .limit(LIMIT)
          .skip(startIndex);
        total = await PacienteDatos.countDocuments({
          $and: [
            { $or: [{ dni }, { apellidos }, { nombres }] },
            { userId },
            { tags: busTags2 },
            {
              $or: [
                { "atenciones.diagnosticos": busDx },
                { "atenciones.diagnosticos": busDx2 },
              ],
            },
            {
              $or: [
                { "atenciones.practicas": busPra },
                { "atenciones.practicas": busPra2 },
              ],
            },
          ],
        });

        break;

      default:
        break;
    }

    res.status(201).json({
      data: pacientes,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
      documentos: total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPaciente = async (req, res) => {
  console.log("Entro a getPaciente");
  const { id } = req.params;

  try {
    const paciente = await PacienteDatos.findById(id);
    res.status(200).json(paciente);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deletePaciente = async (req, res) => {
  console.log("Entro a deletePaciente");
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No paciente with id: ${id}`);

  try {
    await PacienteDatos.findByIdAndRemove(id);
    res.status(200).json({ message: "Paciente deleted successfully." });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const AddAtencion = async (req, res) => {
  console.log("Entro a AddAtencion");
  const { id } = req.params;
  const { value } = req.body;

  try {
    const paciente = await PacienteDatos.findById(id);
    paciente.atenciones.push(value);
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json(updatedPaciente);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const DeleteAtencion = async (req, res) => {
  console.log("Entro a DeleteAtencion");
  const { id } = req.params;
  const { value } = req.body;

  try {
    const paciente = await PacienteDatos.findById(id);
    paciente.atenciones = paciente.atenciones.filter((ate) => ate.id !== value);
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    //Borro Carpeta
    if (fs.existsSync(`./uploads/${id}/${value}`)) {
      fs.rm(`./uploads/${id}/${value}`, { recursive: true }, (err) => {
        if (err) {
          // File deletion failed
          console.error(err.message);
        }
      });
    } else {
      console.log("el directorio no existe ", `./uploads/${id}/${value}`);
    }

    res.status(200).json(updatedPaciente);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const DeleteFileAtencion = async (req, res) => {
  console.log("Entro a DeleteFileAtencion");

  try {
    const { id } = req.params;
    const { value } = req.body;
    const idAtencion = value._id;
    const sFile = value.selectedFile;

    //Borro Archivo
    if (fs.existsSync(`./uploads/${id}/${idAtencion}/${sFile}`)) {
      fs.rm(
        `./uploads/${id}/${idAtencion}/${sFile}`,
        { recursive: true },
        (err) => {
          if (err) {
            // File deletion failed
            console.error(err.message);
          }
        }
      );
    } else {
      console.log(
        "el Archivo no existe ",
        `./uploads/${id}/${idAtencion}/${sFile}`
      );
    }

    // Borro en selectedFiles el nombre del archivo
    const paciente = await PacienteDatos.findById(id);
    let newAte = {};
    paciente.atenciones.forEach((ate) => {
      if (ate.id === idAtencion) {
        newAte = ate;
      }
    });

    if (newAte) {
      newAte.selectedFiles = newAte.selectedFiles.filter(
        (file) => file !== sFile
      );
      const newAtenciones = paciente.atenciones.map((ate) =>
        ate.id === idAtencion ? newAte : ate
      );
      paciente.atenciones = newAtenciones;
    }
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json(updatedPaciente);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const UpdateAtencion = async (req, res) => {
  console.log("Entro a UpdateAtencion");
  const { id } = req.params;
  const { value } = req.body;
  const idAtencion = value._id;

  try {
    const paciente = await PacienteDatos.findById(id);
    const newAtenciones = paciente.atenciones.map((ate) =>
      ate.id === idAtencion ? value : ate
    );
    paciente.atenciones = newAtenciones;
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json(updatedPaciente);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const updatePaciente = async (req, res) => {
  console.log("Entro a updatePaciente");
  const { id } = req.params;
  const paciente = req.body;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No paciente with id: ${id}`);

  try {
    const updatedPaciente = { ...paciente, _id: id };
    const pacienteId = await PacienteDatos.findById(id);
    if (pacienteId) {
      if (pacienteId.dni === paciente.dni) {
        await PacienteDatos.findByIdAndUpdate(id, updatedPaciente, {
          new: true,
        });
        res
          .status(200)
          .json({ data: updatedPaciente, message: "", error: false });
      } else {
        const pacienteDNI = await PacienteDatos.findOne({ dni: paciente.dni });
        if (!pacienteDNI) {
          console.log("no existe DNI");
          await PacienteDatos.findByIdAndUpdate(id, updatedPaciente, {
            new: true,
          });
          res
            .status(200)
            .json({ data: updatedPaciente, message: "", error: false });
        } else {
          console.log("Existe DNI");
          res.status(200).json({
            data: pacienteId,
            message: "Ya existe un Paciente con ese DNI",
            error: true,
          });
        }
      }
    } else {
      res.status(200).json({
        data: updatedPaciente,
        message: "No se encontró el Paciente",
        error: true,
      });
    }
  } catch (error) {
    res
      .status(200)
      .json({ message: "no se pudo actualizar el Paciente", error: true });
  }
};

export const resumenPaciente = async (req, res) => {
  console.log("Entro a resumenPaciente");
  const { id } = req.params;
  const { value } = req.body;

  try {
    const paciente = await PacienteDatos.findById(id);
    paciente.resumen = value;
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json({ data: updatedPaciente, message: "", error: false });
  } catch (error) {
    res
      .status(200)
      .json({ message: "no se pudo actualizar el Paciente", error: true });
  }
};

export const proximaAtencionPaciente = async (req, res) => {
  console.log("Entro a proximaAtencionPaciente");
  const { id } = req.params;
  const { value } = req.body;

  try {
    const paciente = await PacienteDatos.findById(id);
    paciente.proximaAtencion = value;
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json({ data: updatedPaciente, message: "", error: false });
  } catch (error) {
    res.status(200).json({
      message: "no se pudo actualizar la próxima Atención",
      error: true,
    });
  }
};

export const domicilioPaciente = async (req, res) => {
  console.log("Entro a domicilioPaciente");
  const { id } = req.params;
  const { value } = req.body;

  try {
    const paciente = await PacienteDatos.findById(id);
    paciente.domicilio = value;
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json({ data: updatedPaciente, message: "", error: false });
  } catch (error) {
    res
      .status(200)
      .json({ message: "no se pudo actualizar el Domicilio", error: true });
  }
};

export const personaPaciente = async (req, res) => {
  console.log("Entro a personaPaciente");
  const { id } = req.params;
  const { value } = req.body;
  try {
    const paciente = await PacienteDatos.findById(id);
    paciente.persona = value;
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json({ data: updatedPaciente, message: "", error: false });
  } catch (error) {
    res.status(200).json({
      message: "no se pudo actualizar los Datos Personales",
      error: true,
    });
  }
};

export const afamiliaresPaciente = async (req, res) => {
  console.log("Entro a afamiliaresPaciente");
  const { id } = req.params;
  const { value } = req.body;

  try {
    const paciente = await PacienteDatos.findById(id);
    paciente.antecedentes.familiares = value;
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json({ data: updatedPaciente, message: "", error: false });
  } catch (error) {
    res.status(200).json({
      message: "no se pudo actualizar los Antecedentes Familiares",
      error: true,
    });
  }
};

export const amedicosPaciente = async (req, res) => {
  console.log("Entro a amedicosPaciente");
  const { id } = req.params;
  const { value } = req.body;

  try {
    const paciente = await PacienteDatos.findById(id);
    paciente.antecedentes.medicos = value;
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json({ data: updatedPaciente, message: "", error: false });
  } catch (error) {
    res.status(200).json({
      message: "no se pudo actualizar los Antecedentes Médicos",
      error: true,
    });
  }
};

export const aginecoPaciente = async (req, res) => {
  console.log("Entro a aginecoPaciente");
  const { id } = req.params;
  const { value } = req.body;

  try {
    const paciente = await PacienteDatos.findById(id);
    paciente.antecedentes.gineco = value;
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json({ data: updatedPaciente, message: "", error: false });
  } catch (error) {
    res.status(200).json({
      message: "no se pudo actualizar los Antecedentes Gineco-Obstétricos",
      error: true,
    });
    console.log("Error en Gineco", error);
  }
};

export const ahabitosPaciente = async (req, res) => {
  console.log("Entro a ahabitosPaciente");
  const { id } = req.params;
  const { value } = req.body;

  try {
    const paciente = await PacienteDatos.findById(id);
    paciente.antecedentes.habitos = value;
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json({ data: updatedPaciente, message: "", error: false });
  } catch (error) {
    res
      .status(200)
      .json({ message: "no se pudo actualizar los Hábitos", error: true });
  }
};

export const apsicosocialPaciente = async (req, res) => {
  console.log("Entro a apsicosocialPaciente");
  const { id } = req.params;
  const { value } = req.body;

  try {
    const paciente = await PacienteDatos.findById(id);
    paciente.antecedentes.psicosocial = value;
    const updatedPaciente = await PacienteDatos.findByIdAndUpdate(
      id,
      paciente,
      { new: true }
    );
    res.status(200).json({ data: updatedPaciente, message: "", error: false });
  } catch (error) {
    res.status(200).json({
      message: "no se pudo actualizar la situación Psico-Social",
      error: true,
    });
  }
};
