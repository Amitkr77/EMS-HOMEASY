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

    const existing = await Attendance.findOne({
      employeeId: session.user.id,
      date: today,
    });

    if (existing) {
      return Response.json(
        { error: "Already checked in today" },
        { status: 400 },
      );
    }

    // Upload to Cloudinary
    const upload = await cloudinary.uploader.upload(imageBase64, {
      folder: `ems/attendance/${session.user.id}`,
    });

    const attendance = await Attendance.create({
      employeeId: session.user.id,
      date: today,
      checkIn: {
        time: new Date(),
        imageUrl: upload.secure_url,
        // imageUrl: imageBase64,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
    });

    return Response.json(attendance);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
