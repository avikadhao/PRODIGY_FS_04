const router = require("express").Router();
const authMiddlewares = require("./../middlewares/authMiddlewares");
const User = require("./../models/user");

router.get("/loggeduser", authMiddlewares, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });

    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/alloggeduser", authMiddlewares, async (req, res) => {
  try {
    const allUsers = await User.find({
      _id: { $ne: req.user._id },
    }).select("-password");

    res.status(200).json({
      success: true,
      data: allUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
