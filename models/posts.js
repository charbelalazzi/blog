const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    categorie: {
      type: Schema.Types.ObjectId,
      ref: "Categories",
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tags",
      },
    ],
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // fileAttached: {
    //   required: false,
    // },
    // geoLocation: {
    //   type: Geolocation,
    //   required: false,
    // },
    // creator: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User",
    // },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    upVotes: {
      type: Number,
      required: true,
    },
    downVotes: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
