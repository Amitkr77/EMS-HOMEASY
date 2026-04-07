import mongoose, { Schema, models } from "mongoose";

const noticeSchema = new Schema(
    {
        title: String,
        message: String,

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },

        sendEmail: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default models.Notice ||
    mongoose.model("Notice", noticeSchema);