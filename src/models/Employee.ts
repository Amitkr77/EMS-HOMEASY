import mongoose, { Schema, models } from "mongoose";

const employeeSchema = new Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    phone: String,

    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    baseSalary: {
      type: Number,
      default: 0,
    },

    leaveBalance: {
      sick: { type: Number, default: 12 },
      casual: { type: Number, default: 12 },
      paid: { type: Number, default: 15 },
    },

    documents: [String],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default models.Employee || mongoose.model("Employee", employeeSchema);
