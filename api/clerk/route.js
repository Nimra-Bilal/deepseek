// import { Webhook } from "svix";
// import connectDB from "@/config/db";
// import User from "@/models/User";
// import { headers } from "next/headers";
// import { NextResponse } from "next/server";
// export async function POST(req) {
//     const wh = new Webhook(process.env.SIGNING_SECRET)
//     const headerPayLoad = await headers()
//     const svixHeaders = {
//         "svix-id": headerPayLoad.get("svix-id"),
//         "svix-timestamp": headerPayLoad.get("svix-timestamp"),
//         "svix-signature": headerPayLoad.get("svix-signature"),
//     };

//     //get payload n verify it
//     const payload = await req.json();
//     const body = JSON.stringify(payload);
//     const {data,type} = await wh.verify(body, svixHeaders);


//     //prepare user data to be saved in database 
//     const userData = {
//         _id:data.id,
//         name:`${data.first_name}, ${data.last_name}`,
//         email:data.email_addresses[0].email_address,
//         image: data.image_url,
//     }

//     await connectDB();

//     switch (type) {
//         case 'user.created':
//             await User.create(userData)
//             break;

//              case 'user.updated':
//             await User.findByIdAndUpdate(data.id,userData)
//             break;

//              case 'user.deleted':
//             await User.findByIdAndDelete(data.id)
//             break;
    
//         default:
//             break;
//     }

//     return NextResponse.json({message:"event received"});
// console.log("✅ Webhook triggered");
// console.log("➡️ Webhook type:", type);
// console.log("👤 User data to save:", userData);

// }

import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req) {
  console.log("✅ Webhook triggered");

  const wh = new Webhook(process.env.SIGNING_SECRET);
  const headerPayload = await headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let data, type;
  try {
    const verified = await wh.verify(body, svixHeaders);
    data = verified.data;
    type = verified.type;
  } catch (err) {
    console.error("❌ Failed to verify webhook:", err);
    return NextResponse.json({ message: "verification failed" }, { status: 400 });
  }

  const userData = {
    _id: data.id,
    name: `${data.first_name} ${data.last_name}`,
    email: data.email_addresses[0].email_address,
    image: data.image_url,
  };

  console.log("➡️ Webhook type:", type);
  console.log("👤 User data to save:", userData);

  await connectDB();

  switch (type) {
    case "user.created":
      console.log("🟢 Creating user...");
      await User.create(userData);
      break;

    case "user.updated":
      console.log("🟡 Updating user...");
      await User.findByIdAndUpdate(data.id, userData);
      break;

    case "user.deleted":
      console.log("🔴 Deleting user...");
      await User.findByIdAndDelete(data.id);
      break;

    default:
      console.log("⚠️ Unknown event type");
      break;
  }

  return NextRequest.json({ message: "event received" });
}
