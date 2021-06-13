// const csv = require("csvtojson");
// const { json } = require("express");

// const row =
//   "agent,userType,policy_mode,producer,policy_number,premium_amount_written,premium_amount,policy_type,company_name,category_name,policy_start_date,policy_end_date,csr,account_name,email,gender,firstname,city,account_type,phone,address,state,zip,dob,primary,Applicant ID,agency_id,hasActive ClientPolicy";

// const lines = [
//   "John Snow,Active Client,6,Brice Delatorre,51RU6POUJZD8,,1102.58,Single,Nationwide Prop & Cas Ins Co_Copy,Personal Auto,2018-09-01,2019-03-01,Cara Mccoy,Gayle Laverty & Young Bird,rkobes@aol.com,Female,Gayle Laverty,Winston Salem,Personal,2421854652,981 Foxhall Dr,NC,27106-4431,1963-12-06,,,,",
//   "John Snow,Active Client,6,Leonardo Setser,2HWHGDL7B17X,,1102.58,Single,Nationwide Prop & Cas Ins Co_Copy,Personal Auto,2018-09-01,2019-03-01,Harley Kerr,Clifton Mack & Kara Fields,feamster@live.com,Female,Clifton Mack,Winston Salem,Personal,9183269357,981 Foxhall Dr,NC,27106-4431,1963-12-06,,,,",
// ];
// let data = [];
// const parse = async(lines) => {
//     for (var i = 0; i < lines.length; i++) {
//         await csv({ noheader: true, headers: row.split(",") })
//           .fromString(lines[i])
//           .subscribe((jsonObj) => {
//               data.push(jsonObj);
//             //parentPort.postMessage({ isFinal: message.isFinal, result: jsonObj });
//           });

//     }
//     console.log(data);
// }

// parse(lines);
// const Message = require("./models/Message");
// const Agenda = require("agenda");
// const mongoConnectionString = "mongodb+srv://newUser_677:malathi677@cluster0.es4ir.mongodb.net/insuredMine?retryWrites=true&w=majority";
// const mongoose = require('mongoose')
// mongoose.connect(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

// const agenda = new Agenda({ db: { address: mongoConnectionString} });

// agenda.define('test job', async job => {

//   const today = new Date();
//   const messageToStore = new Message({
//         message: "Testtt",
//         timeStamp:1623161866
//       });
//       console.log("--------------",new Date())
//       messageToStore
//         .save()
//         .then((result) => {
//           console.log("--------------------", result);
//           //res.send({ message: "Inserted" });
//         })
//         .catch((err) => {
//           console.log("-------",err);
//         });
// });

// (async function () {
//   console.log("-----caling---")
//   const returned= agenda.create('test job')
//   await agenda.start();
//   await returned.schedule(1623166740000).save()
// })();

const data = [{ name: "malathi", _id: "123" },{ name: "mal", _id: "312" }];

const name = data.find(record => record._id === "123");
console.log(name);