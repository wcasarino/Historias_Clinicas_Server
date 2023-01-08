import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const auth = async (req, res, next) => {
  dotenv.config();
  const secret = process.env.SECRET;
  try {
    if (!req?.headers?.authorization) {
      throw new Error("Authorization header is required");
    } else {
      const token = req?.headers?.authorization?.split(" ")[1];
      const isCustomAuth = token.length < 500;
      let decodedData;
      if (token && isCustomAuth) {
        decodedData = jwt.verify(token, secret);
        req.userId = decodedData?.id;
      } else {
        decodedData = jwt.decode(token);
        req.userId = decodedData?.sub;
      }
      next();
    }
  } catch (error) {
    console.log("Entro a Autorizar, con error");
    console.error(error);
  }
};

export default auth;
