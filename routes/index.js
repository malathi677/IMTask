const express = require("express");
const router = express.Router();
const multer = require("multer");

const csvStreamerMulter = require("../utils/csvStreamerMulter");

const storage = csvStreamerMulter();

const upload = multer({ storage: storage });

const controllers = require("../controllers");

router.post("/upload", upload.single("file"), (req, res) => {
  try {
    console.log("-----------")
    let file = req.file;
    file.message = 'File dumped successfully!!';
    delete file.results;
    return res.json(file);

  } catch (err) {

    console.error(err);
    return res.err(err);
  }
});


router.post("/postMessage", controllers.postMessage);
module.exports = router;
