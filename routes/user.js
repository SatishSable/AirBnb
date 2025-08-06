const express = require("express");
const router = express.Router({ mergeParams: true });
router.get("/singup", (req, res) => {
  res.render("user/signup");
});

module.exports = router;