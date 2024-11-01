import User from "../Models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendEmail from "../Utills/mailer.js";
import { randomBytes } from "crypto";

// Register User
export const registerUser = async (req, res) => {
  try {
    /* Get data from user request and hash password store it in the database */
    const { name, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashPassword,
    });
    await newUser.save();
    res.status(200).json({
      message: "User Registered Successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    /* Get email and password from request. Verify user a registered user or not
    if valid user generate jwt token and store it in the DB and send it to user through response
    */
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    user.token = token;
    await user.save();
    res.status(200).json({
      message: "User Logged In Successfully",
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forget Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password");
    
    if (!user) {
      return res.status(200).json({
        message: "If this email is registered, you will receive a password reset link.",
      });
    }

    /* Generate Random string using crypto module for more security */
    const resetToken = randomBytes(32).toString('hex');
    /* Time in milliseconds since 1970 jan 1 */
    const resetTokenExpiration = Date.now() + 1800000; //Expiration time in milliseconds

    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;
    await user.save();

    // Email details and content
    const subject = "Password Reset Link";
    const text = `You recently requested to reset the password for your account.\n
    Click the link below to proceed:\n
    https://password-reset-project-reactjs.netlify.app/reset-password/${user._id}/${resetToken}\n
    This link is valid for 30 minutes. If you did not request a password reset, please ignore this email.`;

    // Send reset password link
    try {
      await sendEmail(email, subject, text); 
      return res.status(200).json({ message: "Email sent successfully" });
    } catch (emailError) {
      console.error("Error sending email:", emailError); 
      return res.status(500).json({ message: "Failed to send password reset email. Please try again later." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { id, resetToken } = req.params;
    const { password } = req.body;

    const user = await User.findById(id);

    /* Check if user a valid user and token is valid. Also token not expired */
    if (!user || resetToken !== user.resetToken || Date.now() > user.resetTokenExpiration) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    /* After verification hash updated password store it in the database */
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    /* Reset the resetToken and token expiration time */
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    /* Save all of the in db */
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
