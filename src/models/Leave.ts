import mongoose, { Schema, models } from "mongoose";

const leaveSchema = new Schema(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },

        leaveType: {
            type: String,
            enum: ["sick", "casual", "paid"],
            required: true,
        },

        startDate: Date,
        endDate: Date,

        daysRequested: Number,

        reason: String,

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        adminComment: String,

        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },
    },
    { timestamps: true }
);

export default models.Leave || mongoose.model("Leave", leaveSchema);