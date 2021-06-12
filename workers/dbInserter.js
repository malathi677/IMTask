const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const User = require("../models/User");
const Agent = require("../models/Agent");
const Account = require("../models/UserAccount");
const Category = require("../models/PolicyCategory");
const Carrier = require("../models/PolicyCarrier");
const Policy = require("../models/PolicyInfo");
const config = require("../config.json");

const url = config.mongoURL;

const agentNameIdsMap = {};
const userNamesMap = {};
const accountsMap = {};
const categoriesMap = {};
const carriersMap = {};
const policiesMap = {};

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("mongodb connected successfully");
  })
  .catch((err) => {
    console.log("Error while connecting to mongodb");
  });

parentPort.on("message", async (message) => {
  const { payload } = message;
  const newAgents = await getNewAgentsAndUpdateAgentNameMap(payload);
  const agentBulkP = bulkCreateAgents(newAgents).catch((err) => {
    console.log(err);
  });
  const newUsers = await getNewUsersAndUpdateUserNamesMap(payload);

  const userBulkP = bulkCreateUsers(newUsers).catch((err) => {
    console.log(err);
  });

  const newAccounts = await getNewAccountsAndUpdateAccountMap(payload);

  const accountsBulkP = bulkCreateAccounts(newAccounts).catch((err) => {
    console.log(err);
  });

  const newCategories = await getNewCategoryAndUpdateCategoryMap(payload);
  const categoriesBulkP = bulkCreateCategories(newCategories).catch((err) => {
    console.log(err);
  });
  
  const newCarriers = await getNewCarriersAndUpdateCarrierMap(payload);
  const carriersBulkP = bulkCreateCarriers(newCarriers).catch((err) => {
    console.log(err);
  });


  const newPolicies = await getNewPolicyAndUpdatePoliciesMap(payload);
  const policiesBulkP = bulkCreatePolicies(newPolicies).catch((err) => {
    console.log(err);
  });


  await Promise.all([agentBulkP, userBulkP,accountsBulkP,categoriesBulkP,carriersBulkP,policiesBulkP])
    .then(() => {
      parentPort.postMessage({ status: "done" });
    })
    .catch((err) => {
      parentPort.postMessage({ status: "error", error: err });
    });
});

async function bulkCreateAgents(newAgents) {
  if (!newAgents || !newAgents.length) {
    return;
  }
  const result = await Agent.create(newAgents);
  return result;
}

async function bulkCreateUsers(newUsers) {
  if (!newUsers || !newUsers.length) {
    return;
  }
  const result = await User.create(newUsers);
  return result;
}

async function bulkCreateAccounts(newAccounts) {
  if (!newAccounts || !newAccounts.length) {
    return;
  }
  const result = await Account.create(newAccounts);
  return result;
}

async function bulkCreateCategories(newCategories) {
  if (!newCategories || !newCategories.length) {
    return;
  }
  const result = await Category.create(newCategories);
  return result;
}

async function bulkCreateCarriers(newCarriers) {
  if (!newCarriers || !newCarriers.length) {
    return;
  }
  const result = await Carrier.create(newCarriers);
  return result;
}


async function bulkCreatePolicies(newPolicies) {
  if (!newPolicies || !newPolicies.length) {
    return;
  }
  const result = await Policy.create(newPolicies);
  return result;
}


function prepareUser(data) {
  let obj = {};
  obj["firstName"] = data.firstname.trim().toLowerCase();
  obj["dob"] = data.dob.trim();
  obj["address"] = data.address.trim();
  obj["phone"] = data.phone.trim();
  obj["state"] = data.state.trim();
  obj["zip"] = data.zip.trim();
  obj["email"] = data.email.trim().toLowerCase();
  obj["gender"] = data.gender.trim();
  obj["userType"] = data.userType.trim();
  obj["policyNumber"] = data.policy_number.trim();
  return obj;
}


function preparePolicy(data) {
  let obj = {};
  obj["policyNumber"] = data.policy_number.trim();
  obj["policyStartDate"] = data.policy_start_date.trim();
  obj["policyEndDate"] = data.policy_end_date.trim();
  return obj;
}


async function getNewAgentsAndUpdateAgentNameMap(payload) {
  const agentNames = [];
  for (let i = 0; i < payload.length; i++) {
    const record = payload[i];
    const agentName = record.agent.trim().toLowerCase();
    if (!agentNameIdsMap[agentName]) {
      agentNameIdsMap[agentName] = false;
      agentNames.push(agentName);
    }
  }

  const agents = await Agent.find(
    {
      agentName: {
        $in: agentNames,
      },
    },
    { agentName: 1, _id: 1 }
  ).lean(true);

  (agents || []).forEach((agent) => {
    agentNameIdsMap[agent.agentName] = agent._id;
  });

  let newAgents = [];
  for (let j = 0; j < agentNames.length; j++) {
    let agentId = agentNameIdsMap[agentNames[j]];
    if (agentId) {
      continue;
    }
    agentId = mongoose.Types.ObjectId();
    agentNameIdsMap[agentNames[j]] = agentId;
    let obj = {
      _id: agentId,
      agentName: agentNames[j],
    };
    newAgents.push(obj);
  }
  return newAgents;
}
async function getNewUsersAndUpdateUserNamesMap(payload) {
  const users = [];
  for (let i = 0; i < payload.length; i++) {
    const record = payload[i];

    const agentName = record.agent.trim().toLowerCase();
    const user = prepareUser(record);
    const { firstName } = user;

    if (!userNamesMap[firstName]) {
      userNamesMap[firstName] = false;
      user.agentId = agentNameIdsMap[agentName];
      users.push(user);
    }
  }

  const userNames = users.map((user) => user.firstName);

  const usersInDB = await User.find(
    {
      firstName: {
        $in: userNames,
      },
    },
    { firstName: 1, _id: 1 }
  ).lean(true);

  (usersInDB || []).forEach((user) => {
    userNamesMap[user.firstName] = user._id;
  });

  let newUsers = [];
  for (let j = 0; j < users.length; j++) {
    let userId = userNamesMap[users[j].firstName];
    if (userId) {
      continue;
    }
    userId = mongoose.Types.ObjectId();

    userNamesMap[users[j].firstName] = userId;
    users[j]._id = userId;
    newUsers.push(users[j]);
  }
  return newUsers;
}

async function getNewAccountsAndUpdateAccountMap(payload) {
  let accountNames = [];
  for (let i = 0; i < payload.length; i++) {
    let accountName = payload[i].account_name.trim().toLowerCase();

    if (!accountsMap[accountName]) {
      accountsMap[accountName] = false;
      accountNames.push(accountName);
    }
  }

  let accountsInDB = await Account.find(
    {
      accountName: { $in: accountNames },
    },
    { accountName: 1, _id: 1 }
  ).lean(true);

  (accountsInDB || []).forEach((account) => {
    accountsMap[account.accountName] = account._id;
  });

  let newAccounts = [];
  for (let j = 0; j < accountNames.length; j++) {
    let accountId = accountsMap[accountNames[j]];
    if (accountId) {
      continue;
    }

    accountId = mongoose.Types.ObjectId();
    accountsMap[accountNames[j]] = accountId;

    let obj = {
      _id: accountId,
      accountName: accountNames[j],
    };

    newAccounts.push(obj);
  }
  return newAccounts;
}


async function getNewCategoryAndUpdateCategoryMap(payload) {
  let categoryNames = [];
  for (let i = 0; i < payload.length; i++) {
    let categoryName = payload[i].category_name.trim().toLowerCase();

    if (!categoriesMap[categoryName]) {
      categoriesMap[categoryName] = false;
      categoryNames.push(categoryName);
    }
  }

  let categoriesInDB = await Category.find(
    {
      categoryName: { $in: categoryNames },
    },
    { categoryName: 1, _id: 1 }
  ).lean(true);

  (categoriesInDB || []).forEach((category) => {
    categoriesMap[category.categoryName] = category._id;
  });

  let newCategories = [];
  for (let j = 0; j < categoryNames.length; j++) {
    let categoryId = categoriesMap[categoryNames[j]];
    if (categoryId) {
      continue;
    }

    categoryId = mongoose.Types.ObjectId();
    categoriesMap[categoryNames[j]] = categoryId;

    let obj = {
      _id: categoryId,
      categoryName: categoryNames[j],
    };

    newCategories.push(obj);
  }
  return newCategories;
}


async function getNewCarriersAndUpdateCarrierMap(payload) {
  let carriersNames = [];
  for (let i = 0; i < payload.length; i++) {
    let carrierName = payload[i].company_name.trim().toLowerCase();
    

    if (!carriersMap[carrierName]) {
      carriersMap[carrierName] = false;
      carriersNames.push(carrierName);
    }
  }

  let carriersInDB = await Carrier.find(
    {
      companyName: { $in: carriersNames },
    },
    { companyName: 1, _id: 1 }
  ).lean(true);

  (carriersInDB || []).forEach((carrier) => {
    carriersMap[carrier.companyName] = carrier._id;
  });

  let newCarriers = [];
  for (let j = 0; j < carriersNames.length; j++) {
    let carrierId = carriersMap[carriersNames[j]];
    if (carrierId) {
      continue;
    }

    carrierId = mongoose.Types.ObjectId();
    carriersMap[carriersNames[j]] = carrierId;

    let obj = {
      _id: carrierId,
      companyName: carriersNames[j],
    };

    newCarriers.push(obj);
  }
  return newCarriers;
}


async function getNewPolicyAndUpdatePoliciesMap(payload) {
  const policies = [];
  for (let i = 0; i < payload.length; i++) {
    const record = payload[i];

    const firstName = record.firstname.trim().toLowerCase();
    const categoryName = record.category_name.trim().toLowerCase();
    const companyName = record.company_name.trim().toLowerCase();

    const policy = preparePolicy(record);
    const { policyNumber } = policy;

    if (!policiesMap[policyNumber]) {
      policiesMap[policyNumber] = false;
      policy.userId = userNamesMap[firstName];
      policy.policyCategoryId = categoriesMap[categoryName];
      policy.companyId = carriersMap[companyName];
      policies.push(policy);
    }
  }

  const policyNumbers = policies.map((policy) => policy.policyNumber);

  const policiesInDB = await Policy.find(
    {
      policyNumber: {
        $in: policyNumbers,
      },
    },
    { policyNumber: 1, _id: 1 }
  ).lean(true);

  (policiesInDB || []).forEach((policy) => {
    policiesMap[policy.policyNumber] = policy._id;
  });

  let newPolicies = [];
  for (let j = 0; j < policies.length; j++) {
    let policyId = policiesMap[policies[j].policyNumber];
    if (policyId) {
      continue;
    }
    policyId = mongoose.Types.ObjectId();

    policiesMap[policies[j].policyNumber] = policyId;
    policies[j]._id = policyId;
    newPolicies.push(policies[j]);
  }
  return newPolicies;
}