import mongoose, { Schema, models } from "mongoose";

const taskSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    title: String,
    description: String,

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  { timestamps: true }
);

export default models.Task || mongoose.model("Task", taskSchema);