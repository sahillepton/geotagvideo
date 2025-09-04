
import { createClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";




export async function POST(req: NextRequest) {
  const body = await req.text(); 

    const supabase = await createClient();

  const event = JSON.parse(body);

  switch (event.type) {
    case "video.asset.ready":
        const assetId = event.data.id;
        const playbackId = event.data.playback_ids?.[0]?.id;

        const {data, error} = await supabase.from("assets").select("*").eq("id", assetId).single();
        if (error) {
          console.error("❌ Error fetching asset:", error);
          return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
          break;
        }
        const videoId = data.video_id;
        const {error: videoError} = await supabase.from("videos").update({mux_playback_id: `https://stream.mux.com/${playbackId}/.m3u8`}).eq("id", videoId);
        if (videoError) {
          console.error("❌ Error updating video:", videoError);
          return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }
        return NextResponse.json({ message: "Video updated successfully" }, { status: 200 });
      break;
    case "video.asset.errored":
      console.error("❌ Asset errored:", event.data.id, event.data.errors);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      break;
    default:
      console.log("ℹMux event:", event.type);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
