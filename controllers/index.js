const Agenda = require("agenda");
const config = require("../config.json");
const ObjectId = require("mongoose").Types.ObjectId;
const { validateDate } = require("../utils/validateDate");
const { validateTime } = require("../utils/validateTime");
const { getTimeStamp } = require("../utils/getTimeStamp");
const Message = require("../models/Message");
const MessageBackup = require("../models/MessageBackup");
const Policy = require("../models/PolicyInfo");
const Category = require("../models/PolicyCategory");
const Carrier = require("../models/PolicyCarrier");
const Agent = require("../models/Agent");
const User = require("../models/User");

const controllers = {};

const getUserInfo = async (user) => {
  const userInfo = await User.findOne(
    { firstName: user },
    { _id: 1, agentId: 1 }
  ).lean(true);

  return userInfo;
};

const getPolicyInfo = async (userInfo) => {
  const policyInfo = await Policy.find({ userId: ObjectId(userInfo._id) }).lean(
    true
  );
  return policyInfo;
};

const getCategoryInfo = async (catId) => {
  const categoryInfo = await Category.findOne({ _id: ObjectId(catId) }).lean(
    true
  );
  return categoryInfo;
};

const getAccountInfo = async (companyId) => {
  const carrierInfo = await Carrier.findOne({ _id: ObjectId(companyId) }).lean(
    true
  );
  return carrierInfo;
};

const scheduleJob = (data) => {
  const agenda = new Agenda({
    db: { address: config.mongoURL, collection: "jobs" },
  });

  agenda.define("TransferMessageJob", async (job) => {
    const backUpMessage = new MessageBackup({
      message: job.attrs.data.message,
      timeStamp: job.attrs.data.timeStamp,
    });

    backUpMessage
      .save()
      .then((result) => {
        console.log(
          "Successfully transfered the data from messages collection",
          result
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
    const returned = agenda.create("TransferMessageJob", {
      message: data.message,
      timeStamp: data.timeStamp,
    });
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

controllers.searchPolicy = async (req, res) => {
  if (req.body.userName) {
    let user = req.body.userName.trim().toLowerCase();

    const userInfo = await getUserInfo(user).catch((err) => {
      return res
        .status(400)
        .send({ Error: "Error occured while fetching the policy info." });
    });

    const policyInfo = await getPolicyInfo(userInfo).catch((err) => {
      return res
        .status(400)
        .send({ Error: "Error occured while fetching the policy info." });
    });

    if (policyInfo && policyInfo.length > 0) {
      for (let i = 0; i < policyInfo.length; i++) {
        const categoryInfo = await getCategoryInfo(
          policyInfo[i].policyCategoryId
        ).catch((err) => {
          return res
            .status(400)
            .send({ Error: "Error occured while fetching the category info." });
        });

        const accountInfo = await getAccountInfo(policyInfo[i].companyId).catch(
          (err) => {
            return res.status(400).send({
              Error: "Error occured while fetching the account info.",
            });
          }
        );

        

        preparePolicy(policyInfo[i], categoryInfo, accountInfo);
      }
      res.send(policyInfo);
    } else {
      return res.send({ message: "No policies found for the user" });
    }
  } else {
    return res.status(400).send({ Error: "user name is required." });
  }
};

module.exports = controllers;
