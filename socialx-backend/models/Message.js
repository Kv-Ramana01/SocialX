const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast conversation lookup
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ receiver: 1, sender: 1 });

module.exports = mongoose.model("Message", MessageSchema);