import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { id } = req.params;
    const value = req.body;
    const idAtencion = value.atencionId;
    //Creando Carpeta de Paciente
    if (fs.existsSync(`./uploads/${id}/`)) {
      console.log("Existe el direcrorio ", `./uploads/${id}/`);
    } else {
      console.log("Creando", `./uploads/${id}/`);
      fs.mkdirSync(`./uploads/${id}/`, { recursive: true });
    }

    //Creando Carpeta de Atencion
    if (fs.existsSync(`./uploads/${id}/${idAtencion}/`)) {
      console.log("Existe el direcrorio ", `./uploads/${id}/${idAtencion}/`);
    } else {
      console.log("Creando", `./uploads/${id}/${idAtencion}/`);
      fs.mkdirSync(`./uploads/${id}/${idAtencion}/`, { recursive: true });
    }

    cb(null, `./uploads/${id}/${idAtencion}`);
    //cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

let upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { files: 3, fieldSize: 30 * 1024 * 1024 },
});

//export default upload.single('myFile')
export default upload.array("myFile");
