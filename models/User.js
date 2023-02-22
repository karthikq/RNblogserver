const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema(
  {
    id: Number,
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    userImage: String,
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    usercreated_at: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    phone: String,
    date: String,
    resetToken: String,
    resetTokenExpirationDate: String,
    deviceToken: String,
    userNetwork: String,
    userCountry: {},
    isSubscriber: false,
    notifications: [
      {
        message: String,
        date: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],
    following: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    followers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    favArticles: [
      {
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (userPassword, cb) {
  const user = this;
  bcrypt.compare(userPassword, user.password, (err, result) => {
    if (err) {
      return cb(err);
    }

    cb(null, result);
  });
};
const User = mongoose.model("User", UserSchema);

module.exports = User;
