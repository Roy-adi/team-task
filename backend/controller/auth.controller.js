import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !fullName) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    let userData = {
      email,
      fullName,
      profilePic: randomAvatar,
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      userData.password = hashedPassword;
    }

    const user = new User(userData);
    await user.save();


    const payload = {
      id: user._id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("tokens", accessToken, {
      httpOnly: true,
      secure: true, // required on HTTPS
      sameSite: "none", // allow cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
        accessToken,
      },
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    let user = await User.findOne({ email });

    // If user not found and we have email + name (Firebase OAuth case)
    if (!user && fullName) {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
      const userData = {
        email,
        fullName,
        profilePic: randomAvatar,
      };

      user = new User(userData);
      await user.save();
    } else if (!user) {
      // User not found and no name provided (regular login case)
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // If password exists in request, it's a normal login
    if (password) {
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: "This account uses OAuth login. Please use Google sign-in.",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }
    }

    const payload = {
      id: user._id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.lastLogin = new Date();
    await user.save();

    res.cookie("tokens", accessToken, {
      httpOnly: true,
      secure: true, // required on HTTPS
      sameSite: "none", // allow cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: user.isNew
        ? "User created and logged in successfully"
        : "Logged in successfully",
      user: {
        ...user.toObject(),
        password: undefined,
        accessToken,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("tokens");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const searchUsersByEmail = async (req, res) => {
  try {
    const {keyword} = req.body;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please search by user email",
      });
    }

    // Build a case-insensitive regex to match anywhere in email
    const emailRegex = new RegExp(keyword.trim(), "i");

    const MAX_RESULTS = 50;

    const users = await User.find({ email: { $regex: emailRegex } })
      .select("_id fullName email profilePic") // only fetch safe fields
      .limit(MAX_RESULTS)
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    console.error("Error in searchUsersByEmail:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while searching users",
    });
  }
};

