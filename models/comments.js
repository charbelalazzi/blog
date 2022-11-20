const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  //   user: {
  //     type: Schema.Types.ObjectId,
  //     ref: "User",
  //   },
  upVotes: {
    type: Number,
    required: true,
  },
  downVotes: {
    type: Number,
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  edited: {
    type: Boolean
  }
});

module.exports = mongoose.model("Comments", commentSchema);
