import PacienteDatos from "../models/pacienteDatos.js";

export const getCalendarioTodo = async (req, res) => {
  console.log("Entro a getCalendarioTodo");
  const { searchQuery, tags, diagnosticos, practicas } = req.query;
  const userId = req.userId;
  let Ates = [];
  let resultFinal = [];
  let today = new Date();
  today.setHours(0, 0, 0, 0);

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

    const pacientesAte = await PacienteDatos.find({
      $and: [
        { $or: [{ dni }, { apellidos }, { nombres }] },
        { userId },
        { tags: busTags2 },
        { atenciones: { $exists: true } },
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

    if (pacientesAte) {
      pacientesAte.forEach((pac) => {
        pac.atenciones.forEach((ate) => {
          Ates.push({
            apellidos: pac.apellidos,
            diagnosticos: ate.diagnosticos,
            practicas: ate.practicas,
            fecha: ate.fecha,
            idPac: pac._id,
            idAte: ate._id,
            prox: false,
          });
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

    // Busqueda de Proximos
    const pacientesProx = await PacienteDatos.find({
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

    if (pacientesProx) {
      pacientesProx.forEach((pac) => {
        resultFinal.push({
          apellidos: pac.apellidos,
          diagnosticos: "",
          practicas: "",
          fecha: pac.proximaAtencion,
          idPac: pac._id,
          idAte: "",
          prox: true,
        });
      });
    }

    res.status(201).json({ data: resultFinal, message: "", error: false });
  } catch (error) {
    console.log(error);
    res
      .status(200)
      .json({ data: resultFinal, message: error.message, error: true });
  }
};

export const getCalendarioProximo = async (req, res) => {
  console.log("Entro a getCalendarioProximo");
  const userId = req.userId;
  let resultFinal = [];
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const pacientesProx = await PacienteDatos.find(
      {
        $and: [{ userId }, { proximaAtencion: { $gte: today } }],
      },
      { apellidos: 1, proximaAtencion: 1 }
    );

    if (pacientesProx) {
      pacientesProx.forEach((pac) => {
        resultFinal.push({
          apellidos: pac.apellidos,
          fecha: pac.proximaAtencion,
          idPac: pac._id,
          prox: true,
        });
      });
    }
    // console.log(pacientesProx);
    // console.log(resultFinal);

    res.status(201).json({ data: resultFinal, message: "", error: false });
  } catch (error) {
    console.log(error);
    res
      .status(200)
      .json({ data: resultFinal, message: error.message, error: true });
  }
};
