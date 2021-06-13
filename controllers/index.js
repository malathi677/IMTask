const Agenda = require("agenda");
const _ = require("lodash");
const config = require("../config.json");
const ObjectId = require("mongoose").Types.ObjectId;

const { getTimeStamp } = require("../utils/getTimeStamp");
const Message = require("../models/Message");
const MessageBackup = require("../models/MessageBackup");
const Policy = require("../models/PolicyInfo");
const Category = require("../models/PolicyCategory");
const Carrier = require("../models/PolicyCarrier");
const Agent = require("../models/Agent");
const User = require("../models/User");

const controllers = {};

const scheduleJob = (data) => {
  let jobId = "";
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
        agenda
          .cancel({ _id: job.attrs._id })
          .then((res) => {
            console.log("-------job removed------", res);
          })
          .catch((err) => {
            console.log(
              "-------Error occured while removing the job------",
              err
            );
          });
      })
      .catch((err) => {
        console.log(
          "Error while transferring the data from messages collection"
        );
      });
  });

  (async function () {
    const returned = agenda.create("TransferMessageJob", {
      message: data.message,
      timeStamp: data.timeStamp,
    });
    await agenda.start();
    await returned.schedule(data.timeStamp).save();
  })();
};
//Assumed the date format dd/mm/yyyy and the time is 24 hours format
controllers.postMessage = (req, res) => {
  const { date, time, message } = req.body;
  const timeStamp = getTimeStamp(date, time);
  if (timeStamp > new Date().getTime()) {
    const messageToStore = new Message({
      message: message,
      timeStamp,
    });
    messageToStore
      .save()
      .then((result) => {
        scheduleJob(result);
        res.send({ message: "Inserted" });
      })
      .catch((err) => {});
  } else {
    return res
      .status(400)
      .send({ Error: "Date and time should not be past ones." });
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

    console.log("-------------------------", userInfo);
    const policyInfo = await getPolicyInfo(userInfo).catch((err) => {
      return res
        .status(400)
        .send({ Error: "Error occured while fetching the policy info." });
    });

    if (policyInfo && policyInfo.length > 0) {
      const categories = await getCategories(policyInfo);
      const carriers = await getCarriers(policyInfo);

      const policies = await preparePolicyInfo(
        policyInfo,
        categories,
        carriers
      );
      userInfo["policies"] = policies;
      res.send(userInfo);
    } else {
      return res.send({ message: "No policies found for the user" });
    }
  } else {
    return res.status(400).send({ Error: "user name is required." });
  }
};

controllers.getPolicies = async (req, res) => {
  Policy.aggregate([
    {
      $lookup: {
        from: "carriers",
        localField: "companyId",
        foreignField: "_id",
        as: "companyDetails",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            {
              $arrayElemAt: ["$companyDetails", 0],
            },
            "$$ROOT",
          ],
        },
      },
    },
    {
      $project: {
        companyDetails: 0,
      },
    },
    {
      $lookup: {
        from: "lobs",
        localField: "policyCategoryId",
        foreignField: "_id",
        as: "PolicyCategoryDetails",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            {
              $arrayElemAt: ["$PolicyCategoryDetails", 0],
            },
            "$$ROOT",
          ],
        },
      },
    },
    {
      $project: {
        PolicyCategoryDetails: 0,
      },
    },
    {
      $group: {
        _id: "$userId",
        policies: {
          $push: "$$ROOT",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            {
              $arrayElemAt: ["$userDetails", 0],
            },
            "$$ROOT",
          ],
        },
      },
    },
    {
      $project: {
        userDetails: 0,
      },
    },
    // {
    //    "$match":{
    //       "policies":{
    //          "$size":2
    //       }
    //    }
    // }
  ]).exec((err, policies) => {
    if (err) res.send(err);
    return res.send(policies);
  });
};

async function getUserInfo(user) {
  const userInfo = await User.findOne({ firstName: user }).lean(true);

  return userInfo;
}

async function getPolicyInfo(userInfo) {
  const policyInfo = await Policy.find({ userId: ObjectId(userInfo._id) }).lean(
    true
  );
  return policyInfo;
}

async function getCategories(policyInfo) {
  let categoryIds = [];
  for (let i = 0; i < policyInfo.length; i++) {
    const record = policyInfo[i];
    const categoryId = ObjectId(record.policyCategoryId);
    categoryIds.push(categoryId);

    const categories = await Category.find({
      _id: {
        $in: categoryIds,
      },
    }).lean(true);
    return categories;
  }
}

async function getCarriers(policyInfo) {
  let carrierIds = [];
  for (let i = 0; i < policyInfo.length; i++) {
    const record = policyInfo[i];
    const carrierId = ObjectId(record.companyId);
    carrierIds.push(carrierId);

    const carriers = await Carrier.find({
      _id: {
        $in: carrierIds,
      },
    }).lean(true);

    return carriers;
  }
}

async function preparePolicyInfo(policyInfo, categories, carriers) {
  let policies = [];
  for (let i = 0; i < policyInfo.length; i++) {
    let obj = {};
    const categoryId = policyInfo[i].policyCategoryId;
    const carrierId = policyInfo[i].companyId;

    const {
      policyNumber,
      policyStartDate,
      policyEndDate,
      policyCategoryId,
      companyId,
    } = policyInfo[i];
    obj = {
      policyNumber,
      policyStartDate,
      policyEndDate,
      policyCategoryId,
      companyId,
    };

    for (let j = 0; j < categories.length; j++) {
      if (_.isEqual(categories[j]._id, categoryId)) {
        obj["categoryName"] = categories[j].categoryName;
      }
    }
    for (let j = 0; j < carriers.length; j++) {
      if (_.isEqual(carriers[j]._id, carrierId)) {
        obj["companyName"] = carriers[j].companyName;
      }
    }

    policies.push(obj);
  }

  return policies;
}

module.exports = controllers;
