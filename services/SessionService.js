const { accessToken } = require("../models/index");

module.exports = {
  createSession: async (token, user) => {
    if (user === undefined) return;
    let sessionData = {
      access_token: token,
      device_id: user.device_id,
      userId: user.id,
    };

    /////////// temprary ///////////
    if (
      !sessionData.device_id ||
      sessionData.device_id === undefined ||
      sessionData.device_id === null
    )
      return;
    //////////// temprary//////////

    try {
      const existingSession = await accessToken.findOne({
        where: { device_id: sessionData.device_id },
      });

      if (existingSession) {
        await accessToken.update(sessionData, {
          where: { device_id: sessionData.device_id },
        });
      } else {
        await accessToken.create(sessionData);
      }
      // Check if session was successfully stored
    } catch (error) {
      console.error("Error creating session:", error.message);
    }
  },
  destroy: async (device_id) => {
    try {
      await accessToken.destroy({ where: { device_id: device_id } });
    } catch (error) {
      console.error("Error destroying session:", error.message);
    }
  },
};
