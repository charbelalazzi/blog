const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagsSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Categories",
    },
  ],
});

module.exports = mongoose.model('Tags', tagsSchema);