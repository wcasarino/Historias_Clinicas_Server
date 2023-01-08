import PacienteDatos from "../models/pacienteDatos.js";

export const getAtencionesBySearch = async (req, res) => {
  console.log("Entro a getAtencionesBySearch");
  const {
    searchQuery,
    tags,
    vista,
    page,
    anomesStr,
    fechaAte1,
    diagnosticos,
    practicas,
  } = req.query;
  const userId = req.userId;
  let Ates = [];
  let resultFinal = [];
  console.log(req.query);

  try {
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

    switch (vista) {
      case "anomes":
        if (anomesStr !== "null") {
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
          });
        }

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
        });

        break;

      case "todos":
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
                },
              },
            },
          ],
        });

        break;

      default:
        break;
    }

    console.log(pacientes.length);

    if (pacientes) {
      pacientes.forEach((pac) => {
        pac.atenciones.forEach((ate) => {
          switch (vista) {
            case "anomes":
              if (ate.anomesStr === anomesStr) {
                Ates.push({
                  apellidos: pac.apellidos,
                  nombres: pac.nombres,
                  dni: pac.dni,
                  tags: pac.tags,
                  diagnosticos: ate.diagnosticos,
                  practicas: ate.practicas,
                  fecha: ate.fecha,
                  notas: ate.notas,
                  idPac: pac._id,
                  diaIni: false,
                  archivos: ate.selectedFiles?.length || 0,
                  idAte: ate._id,
                });
              }
              break;

            case "dia":
              if (ate.diaStr === fechaAte1) {
                Ates.push({
                  apellidos: pac.apellidos,
                  nombres: pac.nombres,
                  dni: pac.dni,
                  tags: pac.tags,
                  diagnosticos: ate.diagnosticos,
                  practicas: ate.practicas,
                  fecha: ate.fecha,
                  notas: ate.notas,
                  idPac: pac._id,
                  diaIni: false,
                  archivos: ate.selectedFiles?.length || 0,
                  idAte: ate._id,
                });
              }
              break;

            case "todos":
              Ates.push({
                apellidos: pac.apellidos,
                nombres: pac.nombres,
                dni: pac.dni,
                tags: pac.tags,
                diagnosticos: ate.diagnosticos,
                practicas: ate.practicas,
                fecha: ate.fecha,
                notas: ate.notas,
                idPac: pac._id,
                diaIni: false,
                archivos: ate.selectedFiles?.length || 0,
                idAte: ate._id,
              });
              break;

            default:
              break;
          }
        });
      });

      let resultDx = [];

      if (diagnosticos.length > 0) {
        const arrDx = diagnosticos.split(",");
        Ates.forEach((valor) => {
          const ateDx = valor.diagnosticos.filter((dx1) => {
            return arrDx.find((a) => {
              return dx1 === a;
            });
          });
          if (ateDx.length > 0) {
            resultDx.push(valor);
          }
        });
      } else {
        resultDx = Ates;
      }

      if (practicas.length > 0) {
        const arrPra = practicas.split(",");
        resultDx.forEach((valor) => {
          const atePra = valor.practicas.filter((pra1) => {
            return arrPra.find((a) => {
              return pra1 === a;
            });
          });
          if (atePra.length > 0) {
            resultFinal.push(valor);
          }
        });
      } else {
        resultFinal = resultDx;
      }
    }

    res.status(201).json({ data: resultFinal, message: "", error: false });
  } catch (error) {
    console.log(error);
    res
      .status(200)
      .json({ data: resultFinal, message: error.message, error: true });
  }
};

export const getAnoAtenciones = async (req, res) => {
  console.log("Entro a getAnoAtenciones");
  //const userId = req.userId;
  let Ates = [];
  //let ano = ''
  try {
    const anomes1 = await PacienteDatos.distinct("atenciones.anomesStr");
    Ates = anomes1.map((am) => {
      return am.substring(0, 4);
    });

    const conjunto = new Set(Ates);
    Ates = [...conjunto];
    if (Ates?.length > 0) {
      Ates.sort(function (a, b) {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      });
    }

    res.status(201).json({ data: Ates, message: "", error: false });
  } catch (error) {
    console.log(error);
    res.status(200).json({ data: Ates, message: error.message, error: true });
  }
};

export const changeDiaPra = async (req, res) => {
  console.log("Entro a changeDiaPra");
  try {
    const pacientes = await PacienteDatos.find();

    pacientes.forEach(async (pac) => {
      const newAtenciones = pac.atenciones.map((ate) => {
        ate.diagnostico !== "" &&
          ate.diagnosticos.push(ate.diagnostico.toLowerCase());
        ate.practica !== "" && ate.practicas.push(ate.practica.toLowerCase());
        return ate;
      });
      pac.atenciones = newAtenciones;
      await PacienteDatos.findByIdAndUpdate(pac._id, pac, { new: true });
    });

    res.status(201).json({ message: "Todo bien", error: false });
  } catch (error) {
    console.log(error);
    res.status(200).json({ data: Ates, message: error.message, error: true });
  }
};

export const deleteDiaPra = async (req, res) => {
  console.log("Entro a deleteDiaPra");
  try {
    const pacientes = await PacienteDatos.find();

    pacientes.forEach(async (pac) => {
      const newAtenciones = pac.atenciones.map((ate) => {
        return ate;
      });
      pac.atenciones = newAtenciones;
      await PacienteDatos.findByIdAndUpdate(pac._id, pac, { new: true });
    });

    res.status(201).json({ message: "Todo bien", error: false });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: error.message, error: true });
  }
};

export const arrayDiaPra = async (req, res) => {
  console.log("Entro a arrayDiaPra");
  //const id = '61d9855b311a7f43ac529a82'
  try {
    const pacientes = await PacienteDatos.find();

    pacientes.forEach(async (pac) => {
      const newAtenciones = pac.atenciones.map((ate) => {
        ate.diagnosticos[0] === null
          ? (ate.diagnosticos = [])
          : (ate.diagnosticos[0] = ate.diagnosticos[0]);
        ate.practicas[0] === null
          ? (ate.practicas = [])
          : (ate.practicas[0] = ate.practicas[0]);
        return ate;
      });
      pac.atenciones = newAtenciones;
      await PacienteDatos.findByIdAndUpdate(pac._id, pac, { new: true });
    });
    res.status(201).json({ message: "Todo bien array", error: false });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: error.message, error: true });
  }
};

export const deleteFoto = async (req, res) => {
  console.log("Entro a deleteFoto");
  try {
    const pacientes = await PacienteDatos.find();

    const newPac = pacientes.map((pac) => {
      return pac;
    });

    newPac.forEach(async (npac) => {
      await PacienteDatos.findByIdAndUpdate(npac._id, npac, { new: true });
    });

    res.status(201).json({ message: "Todo bien", error: false });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: error.message, error: true });
  }
};

export const addUserId = async (req, res) => {
  console.log("Entro a addUserId");

  try {
    const pacientes = await PacienteDatos.find();

    const newPac = pacientes.map((pac) => {
      return { ...pac, userId: "62a110d29ee09224384878da" };
    });

    //const newPac = { ...pacientes, userId: "62a110d29ee09224384878da" };

    newPac.forEach(async (npac) => {
      await PacienteDatos.findByIdAndUpdate(npac._id, npac, { new: true });
    });

    PacienteDatos.updateMany(
      {},
      { $set: { userId: "62c8a84bae4b730016889da2" } }
    );

    res.status(201).json({
      message: "Todo bien addUserId",
      error: false,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: error.message, error: true });
  }
};
