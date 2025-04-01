const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddlewares");
const Chat = require("./../models/chat");

router.post("/newchat", authMiddleware, async (req, res) => {
  try {
    const chat = new Chat(req.body);
    const savedChat = await chat.save();

    res.status(201).send({
      message: "Chat created successfully",
      success: true,
      data: savedChat,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
});

router.get("/allchat", authMiddleware, async (req, res) => {
  try {
    const allchat = await Chat.find({
      members: { $in: req.body.userId },
    })
      .populate("members", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).send({
      message: "Chats fetched successfully",
      success: true,
      data: allchat,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = router;
