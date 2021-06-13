const { validateDate } = require("../utils/validateDate");
const { validateTime } = require("../utils/validateTime");
module.exports = (req, res, next) => {
    if (req.body.date && req.body.time && req.body.message) {
        const { date, time, message } = req.body;
    
        const isValidDate = validateDate(date);
        const isValidTime = validateTime(time);
    
        if (isValidDate && isValidTime) {
            next();
        } else if (!isValidDate) {
          return res
            .status(400)
            .send({ Eror: "Please provide date (dd/mm/yyyy) format" });
        } else if (!isValidTime) {
          return res
            .status(400)
            .send({ Eror: "Please provide time (24 hrs) format" });
        } else {
          return res.status(400).send({
            Eror: "Please provide date (dd/mm/yyyy) and time (24 hrs) format",
          });
        }
      } else {
        return res.status(400).send({
          Error: "Missing information. Please provide with date,time and message",
        });
      }
}
