const { default: mongoose } = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    id: Number,
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ["Private", "Public"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postId: String,
    category: {
      val: String,
      date: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    postcreated_at: {
      type: String,
    },
    date: String,
    imageUrl: String,
    resizeMode: String,
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
