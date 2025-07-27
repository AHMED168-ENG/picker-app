const jwt = require("jsonwebtoken");
const Common = require("../utility/common");
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader;

  if (token == null) {
    res.status(401).json({
      ack: 0,
      msg: "You are not authorized user, please login again",
    });
  } else {
    let TokenArray = token.split(" ");
    jwt.verify(
      TokenArray[1],
      Common.base64DecodeString(process.env.TOKEN),
      (err, data) => {
        if (err || data.role !== "picker") {
          res.status(401).json({
            ack: 0,
            msg: "You are not authorized user,please login again",
          });
        } else {
          req.auth_data = data;
          next();
        }
      }
    );
  }
};

module.exports = authenticateUser;
