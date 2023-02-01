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
    date: String,
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
