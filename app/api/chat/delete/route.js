import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const {userId} = getAuth(req);
        const {chatId} = await req.json();
 if (!userId) {
return NextResponse.json({
    success:false ,
     message:"user not authenticated",})
        }

        //connect to db and del chat
        const db = await connectDB();
        await Chat.deleteOne({_id:chatId , userId});
    return NextResponse.json({success:true,message:"chat deleted"});

        
    } catch (error) {
        return NextResponse.json({success:false,error:error.message});
        
    }
    
}