import mongoose from "mongoose";

const pacienteSchema = mongoose.Schema(
  {
    dni: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      default: "62c8a84bae4b730016889da2",
    },
    apellidos: {
      type: String,
      required: true,
      trim: true,
      default: "Desconocido",
    },
    nombres: String,
    tags: [String],
    resumen: {
      type: String,
      trim: true,
      default: "",
    },
    proximaAtencion: {
      type: Date,
      default: null,
    },
    persona: {
      cuit: String,
      sexo: String,
      fecha_nac: Date,
      estado_civil: String,
      obra_social: String,
      familograma: String,
    },
    domicilio: {
      calle: String,
      barrio: String,
      departamento: String,
      telefono: String,
      notas: String,
    },
    antecedentes: {
      familiares: {
        hta: Boolean,
        cardiaca: Boolean,
        dbt: Boolean,
        acv: Boolean,
        cancer: String,
        celiaca: Boolean,
        drogas: Boolean,
        alcohol: Boolean,
        depresion: Boolean,
        notas: String,
      },
      medicos: {
        app: String,
        alergias: String,
        alergias_medicamentos: String,
        internaciones: String,
        transfusiones: String,
        sexual: String,
        notas: String,
      },
      gineco: {
        fum: Date,
        menarca: String,
        irs: String,
        gestas: String,
        partos: String,
        cesareas: String,
        abortos: String,
        ciclos: String,
        menopuasia: String,
        anticoncepcion_q: Boolean,
        anticoncepcion_t: String,
        diu: Boolean,
        diu_t: String,
        implante: Boolean,
        fup: Date,
        fup_t: String,
        notas: String,
      },
      habitos: {
        tabaco: String,
        alcohol_habi: String,
        drogas: String,
        sedentarismo: Boolean,
        fisico: String,
        alimentacion: String,
        cinturon: String,
        notas: String,
      },
      psicosocial: {
        violencia: String,
        duelo: Boolean,
        separacion: Boolean,
        trabajo: Boolean,
        traslado: Boolean,
        nacimiento: Boolean,
        empleo: String,
        recurre: String,
        notas: String,
      },
    },
    atenciones: [
      {
        fecha: Date,
        notas: String,
        selectedFiles: [String],
        diaStr: String,
        anomesStr: String,
        //diagnostico: String,
        diagnosticos: [String],
        //practica: String,
        practicas: [String],
        userId: String,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

var PacienteDatos = mongoose.model("PacienteDatos", pacienteSchema);

export default PacienteDatos;
