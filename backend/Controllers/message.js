const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddlewares");
const Chat = require("../models/chat");
const Message = require("../models/message");
const mongoose = require("mongoose"); 

router.post("/newmessage", authMiddleware, async (req, res) => {
  try {
    const { chatId, text } = req.body;

    // Validate request body
    if (!chatId || !text) {
      return res.status(400).json({
        success: false,
        message: "Missing chatId or text in request body",
      });
    }

    // Verify chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Check authorization
    const isMember = chat.members.some(
      (member) => member.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages in this chat",
      });
    }

    // Create and save message
    const newMessage = new Message({
      text,
      chatId,
      sender: req.user._id,
    });

    const savedMessage = await newMessage.save();

    // Update chat's last message
    await Chat.findByIdAndUpdate(
      chatId,
      {
        lastMessage: savedMessage._id,
        $inc: { unreadMessageCount: 1 },
      },
      { new: true }
    );

    // Populate sender info
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "firstname lastname profilePic")
      .lean();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Message send error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/:chatId/messages", authMiddleware, async (req, res) => {
  try {
    const chatId = req.params.chatId;

    // Validate chat ID
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID format",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Check authorization
    const isMember = chat.members.some(
      (member) => member.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these messages",
      });
    }

    // Get messages
    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .populate("sender", "firstname lastname profilePic")
      .lean();

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
