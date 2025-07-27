const jwt = require("jsonwebtoken");
const Common = require("../utility/common");
const { UsersModel, accessToken } = require("../models/index");
const SessionService = require("../services/SessionService");

const authenticateAdmin = async (req, res, next) => {
  try {
    const ip = req.headers["cf-connecting-ip"] || req.connection.remoteAddress;

    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({
        ack: 0,
        msg: "You are not authorized admin, please login again",
      });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(
      token,
      Common.base64DecodeString(process.env.TOKEN)
    );

    if (!["admin", "subadmin"].includes(decodedToken.role)) {
      return res.status(401).json({
        ack: 0,
        msg: "You are not authorized user, please login again",
      });
    }

    if (decodedToken.device_id) {
      let storedToken;

      if (!storedToken) {
        const tokenRecord = await accessToken.findOne({
          where: {
            access_token: token,
            userId: decodedToken.id,
            device_id: decodedToken.device_id,
          },
        });

        if (!tokenRecord) {
          return res.status(401).json({
            ack: 0,
            msg: "You are not authorized user, please login again",
          });
        } else {
          const user = await UsersModel.findOne({
            where: { id: decodedToken.id },
          });
          user.device_id = decodedToken.device_id;
          await SessionService.createSession(token, user);
        }
      }
    }

    req.auth_data = decodedToken;
    next();
  } catch (error) {
    logger.error("Error in authenticateAdmin:", error);
    return res.status(401).json({
      ack: 0,
      msg: "You are not authorized user, please login again",
    });
  }
};

module.exports = authenticateAdmin;
