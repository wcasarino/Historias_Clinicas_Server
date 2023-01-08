import fs from 'fs';

import PacienteDatos from '../models/pacienteDatos.js';

export const downloadFile = async (req, res) => {
  try {
    const { id, idAtencion, file } = req.params;

    if (fs.existsSync(`./uploads/${id}/${idAtencion}/${file}`)) {
      res.download(`./uploads/${id}/${idAtencion}/${file}`);
    } else {

      // Borro en selectedFiles el nombre del archivo
      const paciente = await PacienteDatos.findById(id);
      let newAte = {}
      paciente.atenciones.forEach(ate => {
        if (ate.id === idAtencion) { newAte = ate }
      });

      if (newAte) {
        newAte.selectedFiles = newAte.selectedFiles.filter((sfile) => sfile !== file)
        const newAtenciones = paciente.atenciones.map((ate) => ate.id === idAtencion ? newAte : ate)
        paciente.atenciones = newAtenciones
      }
      await PacienteDatos.findByIdAndUpdate(id, paciente, { new: true });
    }

  } catch (error) {
    res.status(403).json({ message: error });
  }
};
