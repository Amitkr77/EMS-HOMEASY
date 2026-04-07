import { connectDB } from "@/lib/db";
import Notice from "@/models/Notice";
import Employee from "@/models/Employee";
import { transporter } from "@/lib/mailer";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "admin") {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { title, message, sendEmail } = await req.json();

        const notice = await Notice.create({
            title,
            message,
            createdBy: session.user.id,
            sendEmail,
        });

        // 📧 Send Email to all employees
        if (sendEmail) {
            const employees = await Employee.find({ role: "employee" });

            const emails = employees.map((e) => e.email);

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: emails,
                subject: title,
                html: `<h3>${title}</h3><p>${message}</p>`,
            });
        }

        return Response.json(notice);
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}