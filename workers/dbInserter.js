const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const User = require("../models/User");
const Agent = require("/home/malathi/Downloads/Mine/test-api/models/Agent.js");
const config = require("../config.json");

const url = config.mongoURL;

mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("mongodb connected successfully");
      //next();
    })
    .catch((err) => {
      console.log("Error while connecting to mongodb");
      //res.status(err.status || 401);
      //return res.send({ "Error": err });
    });

parentPort.on("message", (message) => {
  const { payload } = message;
  console.log("------------", payload.length);
  for (let i = 0; i < payload.length; i++) {
      
      Agent.findOne({ "agent_name": payload[i].agent.trim() })
        .then((result) => {
          if (result) {
            console.log("---------------", result);
          } else {
            let agent = new Agent({
              agent_name:payload[i].agent.trim()
            })
            agent.save(function (err, results) {
              if (err) {
                console.log("-----errorr----", err);
              } else {
                console.log("---agent saved successfully-----",results);
              }
            });
          }
        })
        .catch((err) => {
          console.log("err", err);
        });
    
  }
  parentPort.postMessage({ status: "done" });
});
