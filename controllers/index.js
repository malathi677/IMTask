const Agenda = require("agenda");
const config = require("../config.json");
const { validateDate } = require("../utils/validateDate");
const { validateTime } = require("../utils/validateTime");
const { getTimeStamp } = require("../utils/getTimeStamp");
const Message = require("../models/Message");
const MessageBackup = require("../models/MessageBackup");
const controllers = {};

const scheduleJob = (data) => {
  const agenda = new Agenda({ db: { address: config.mongoURL,collection:'jobs' } });

  agenda.define("TransferMessageJob", async (job) => {
    const backUpMessage = new MessageBackup({
      message: job.attrs.data.message,
      timeStamp: job.attrs.data.timeStamp,
    });

    backUpMessage
      .save()
      .then((result) => {
        console.log(
          "Successfully transfered the data from messages collection",result
        );
        //await agenda.cancel({ name: "TransferMessageJob" });
      })
      .catch((err) => {
        console.log(
          "Error while transferring the data from messages collection"
        );
      });
  });

  (async function () {
    console.log("---Starting job-----");
    const returned = agenda.create("TransferMessageJob", {message:data.message,timeStamp:data.timeStamp});
    await agenda.start();
    const agendRes = await returned.schedule(data.timeStamp).save();
    console.log("-------agendra res------", agendRes);
  })();
};
//Assumed the date format dd/mm/yyyy and the time is 24 hours format
controllers.postMessage = (req, res) => {
  if (req.body.date && req.body.time && req.body.message) {
    const { date, time, message } = req.body;

    const isValidDate = validateDate(date);
    const isValidTime = validateTime(time);

    if (isValidDate && isValidTime) {
      const timeStamp = getTimeStamp(date, time);
      if (timeStamp > new Date().getTime()) {
        const messageToStore = new Message({
          message: message,
          timeStamp,
        });
        messageToStore
          .save()
          .then((result) => {
            console.log("--------------------", result);
            scheduleJob(result);
            res.send({ message: "Inserted" });
          })
          .catch((err) => {});
      } else {
        return res
          .status(400)
          .send({ Error: "Date and time should not be past ones." });
      }

      //console.log("------------------", timeStamp, new Date().getTime());
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
};

module.exports = controllers;
