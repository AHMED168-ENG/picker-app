require("dotenv").config();
const Common = require("../utility/common");
const checkApiKey = (req, res, next) => {
  // console.log(`[API_KEY_CHECK] Middleware invoked for: ${req.method} ${req.originalUrl}`);

  const apiKey = req.headers["x-api-key"];
  if (apiKey === Common.base64DecodeString(process.env.API_KEY)) {
    //req.auth_data = data;
    return next();
  } else {
    res.status(401).json({
      ack: 0,
      msg: "authentication fail",
    });
  }
};

module.exports = checkApiKey;
