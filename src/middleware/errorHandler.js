const _ = require("lodash");
module.exports = (err, req, res, next) => {
  const errorMessage = err.response ? err.response.data : err.message;
  return res.status(500).json({
    message: errorMessage,
  });
};
