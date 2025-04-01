const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstname, lastname} = req.body;

    if (!email || !password || !firstname || !lastname) {
      return res.status(400).send({
        message: "All fields are required",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        message: "User already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
     
    });

    await newUser.save();

    res.status(201).send({
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).send({
      message: error.message || "Internal server error",
      success: false,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
module.exports = router;
