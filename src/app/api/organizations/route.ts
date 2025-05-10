import { db } from "@/db";
import { OrganizationsTable } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        const organization = await db.select().from(OrganizationsTable)
         return NextResponse.json( organization , { status: 200 });
    } catch (error) {
        console.log(error);
        
    }
   

}