const express = require("express");
const router = express.Router();
const test = require("../utils/Test");

router.get("/test", (req, res) => {
  console.log(req);
  const response = test();
  res.send({
    success: "Your api is running",
    fromComp: response,
  });
});

module.exports = router;
