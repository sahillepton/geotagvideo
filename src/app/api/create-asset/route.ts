import axios from "axios";
import { NextResponse } from "next/server";

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Missing videoUrl in request body" },
        { status: 400 }
      );
    }

    const url = `https://api.mux.com/video/v1/assets`;

    const headers = {
      Authorization:
        "Basic " +
        Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString("base64"),
      "Content-Type": "application/json",
    };

    // Create asset on Mux
    const createRes = await axios.post(
      url,
      {
        input: videoUrl,
        playback_policy: ["public"],
      },
      { headers }
    );

    const asset = createRes.data.data;

    const asset_id = asset.id;
    const playback_id = asset.playback_ids?.[0]?.id || null;

    return NextResponse.json({
      message: "Mux asset created successfully",
      asset_id,
      playback_id,
      playback_url: playback_id
        ? `https://stream.mux.com/${playback_id}.m3u8`
        : null,
    });
  } catch (error) {
    console.error("MUX ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create Mux asset" },
      { status: 500 }
    );
  }
}
