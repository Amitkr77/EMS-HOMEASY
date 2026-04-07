import mongoose, { Schema, models } from "mongoose";

const attendanceSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    checkIn: {
      time: Date,
      imageUrl: String,
      location: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: [Number], // [lng, lat]
      },
    },

    checkOut: {
      time: Date,
      imageUrl: String,
      location: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: [Number],
      },
    },

    hoursWorked: Number,

    status: {
      type: String,
      enum: ["present", "absent", "late", "half-day"],
      default: "present",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);