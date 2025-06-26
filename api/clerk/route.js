import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { use } from "react";
import { NextRequest } from "next/server";
export async function POST(req) {
    const wh = new Webhook(process.env.SIGNING_SECRET)
    const headerPayLoad = await headers()
    const svixHeaders = {
        "svix-id": headerPayLoad.get("svix-id"),
        "svix-signature": headerPayLoad.get("svix-signature"),
    };

    //get payload n verify it
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const {data,type} = await wh.verify(body, svixHeaders);


    //prepare user data to be saved in database 
    const userData = {
        _id:data.id,
        name:`${data.first_name}, ${data.last_name}`,
        email:data.email_addresses[0].email_address,
        image: data.image_url,
    }

    await connectDB();

    switch (key) {
        case 'user.created':
            await User.create(userData)
            break;

             case 'user.updated':
            await User.findByIdAndUpdate(data.id,userData)
            break;

             case 'user.deleted':
            await User.findByIdAndDelete(data.id)
            break;
    
        default:
            break;
    }

    return NextRequest.json({message:"event received"});
    
}