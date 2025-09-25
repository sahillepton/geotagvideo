import axios from "axios";
import { NextResponse } from "next/server";

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;


export async function GET(
    request: Request,
    
  ) {

    try {
      const url = `https://api.mux.com/data/v1/errors`;
  
  
      const headers = {
        Authorization:
          "Basic " + Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString("base64"),
        "Content-Type": "application/json",
      };
  
      const errorsRes = await axios.get(url, { headers });
    
      const errorsData = errorsRes.data;
  
      console.log(errorsData, "errorsData");
  
      return NextResponse.json({
        message: "Mux errors fetched",
        errorsData,
      });
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { error: "Failed to fetch errors" },
        { status: 500 }
      );
    }
  }
  