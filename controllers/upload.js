import mongoose from 'mongoose';

import PacienteDatos from '../models/pacienteDatos.js';

export const UpdateSelectedFilesAtencion = async (req, res) => {
  const { id } = req.params;
  const value = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No paciente with id: ${id}`);

  try {
    const idAtencion = value.atencionId
    const archivos = req.files

    const paciente = await PacienteDatos.findById(id);
    let newAte = {}
    paciente.atenciones.forEach(ate => {
      if (ate.id === idAtencion) { newAte = ate }
    });
    if (newAte) {
      archivos.forEach(arc => {
        newAte.selectedFiles.push(arc.filename)
      })
      const newAtenciones = paciente.atenciones.map((ate) => ate.id === idAtencion ? newAte : ate)
      paciente.atenciones = newAtenciones
      const updatedPaciente = await PacienteDatos.findByIdAndUpdate(id, paciente, { new: true });
      res.status(200).json(updatedPaciente);
    } else {
      res.status(200).json(paciente);
    }

  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};
