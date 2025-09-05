"use server"

import axios from "axios";
import { cookies } from "next/headers";

export async function postData(url = "", data = {}) {
    const cookieStore = await cookies();
    const userDetails = cookieStore.get("user");
    const user = JSON.parse(userDetails?.value || "{}");

     const formattedUrl = url.startsWith('/') ? url : `/${url}`;
     const res = await axios.post(
       `${process.env.NEXT_PUBLIC_API}${formattedUrl}`,
       data,
       {
         headers: {
           "Content-Type": "application/json",
           "UserId": user?.User_id,
         },
       }
     );
     return res.data;
   }