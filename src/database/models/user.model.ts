import mongoose from "mongoose";
import { IUserDocument } from "../interfaces/user.interface";
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add user name"],
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    role: {
      type: String,
      enum: ["agent", "admin", "client"],
      default: "client",
    },
    roleData: {
      admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
      client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
      agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
      },
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    profilePhoto: {
      type: String,
      default: "no-photo.jpg",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// // Create ClassStandard slug from the name
// ClassStandardSchema.pre("save", function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// // Reverse populate with virtuals
// ClassStandardSchema.virtual("subjects", {
//   ref: "Subject",
//   localField: "_id",
//   foreignField: "classStandard",
//   justOne: false,
// });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: any) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model<IUserDocument>("User", UserSchema);

export default User;
