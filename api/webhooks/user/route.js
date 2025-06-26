
import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  const wh = new Webhook(process.env.SIGNING_SECRET);
  const headerPayload = headers();

  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  try {
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const { data, type } = await wh.verify(body, svixHeaders);

    const userData = {
      _id: data.id,
      name: `${data.first_name} ${data.last_name}`, // no comma
      email: data.email_addresses[0].email_address,
      image: data.image_url,
    };

    await connectDB();

    if (type === "user.created" || type === "user.updated") {
      await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
      console.log(`✅ ${type} processed for`, userData.email);
    } else if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
      console.log(`🗑️ Deleted user`, data.id);
    } else {
      console.log("ℹ️ Unhandled event type:", type);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
