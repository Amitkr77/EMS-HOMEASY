import mongoose, { Schema, models } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    message: String,

    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default models.Message ||
  mongoose.model("Message", messageSchema);