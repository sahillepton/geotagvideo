import axios from "axios";
import { NextResponse } from "next/server";

type Params = {
  "playback-id": string;
};

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;
export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  const { "playback-id": playbackId } = await params;

  try {
    const url = `https://api.mux.com/video/v1/playback-ids/${playbackId}`;


    const headers = {
      Authorization:
        "Basic " + Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString("base64"),
      "Content-Type": "application/json",
    };

    const playbackRes = await axios.get(url, { headers });
  
    const playbackData = playbackRes.data;
  
    const asset_id = playbackData.data.object.id;
  
    const asset_url = `https://api.mux.com/video/v1/assets/${asset_id}`;
    const assetRes = await axios.get(asset_url, { headers });
  
    const asset_data = assetRes.data;
  
    return NextResponse.json({
      message: "Mux status fetched",
      asset_id,
      status: asset_data.data.status,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch playback ID" },
      { status: 500 }
    );
  }
}
