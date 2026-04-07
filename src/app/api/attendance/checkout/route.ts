import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import cloudinary from "@/lib/cloudinary";
import { requireUser } from "@/lib/requireUser";

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    await connectDB();

    const { imageBase64, latitude, longitude } = await req.json();

    const today = new Date().toISOString().split("T")[0];

    const record = await Attendance.findOne({
      employeeId: session.user.id,
      date: today,
    });

    if (!record) {
      return Response.json(
        { error: "Check-in required first" },
        { status: 400 }
      );
    }

    if (record.checkOut?.time) {
      return Response.json(
        { error: "Already checked out" },
        { status: 400 }
      );
    }

    const upload = await cloudinary.uploader.upload(imageBase64, {
      folder: `ems/attendance/${session.user.id}`,
    });

    const checkOutTime = new Date();

    const hoursWorked =
      (checkOutTime.getTime() - record.checkIn.time.getTime()) /
      (1000 * 60 * 60);

    record.checkOut = {
      time: checkOutTime,
      imageUrl: upload.secure_url,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    };

    record.hoursWorked = parseFloat(hoursWorked.toFixed(2));

    await record.save();

    return Response.json(record);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}