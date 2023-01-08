import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRouter from "./routes/user.js";
import pacienteRoutes from "./routes/pacientes.js";
import uploadRouter from "./routes/uploads.js";
import downloadRouter from "./routes/download.js";
import atencionesRouter from "./routes/atenciones.js";
import calendarioRouter from "./routes/calendario.js";

const app = express();
dotenv.config();

app.use(express.static("./public"));
app.use("/uploads", express.static("uploads"));

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

//app.use(cors());

var allowedOrigins = ["https://historia-clinica.netlify.app"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use("/user", userRouter);
app.use("/pacientes", pacienteRoutes);
app.use("/upload", uploadRouter);
app.use("/download", downloadRouter);
app.use("/atenciones", atencionesRouter);
app.use("/calendario", calendarioRouter);

app.use("/", (req, res) => {
  res.send("APP IS RUNNIG. ahora");
});

const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server Running on Port: ${PORT}`))
  )
  .catch((error) => console.log(`${error} did not connect`));

mongoose.set("useFindAndModify", false);
