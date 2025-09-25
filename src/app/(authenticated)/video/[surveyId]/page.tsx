import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VideoWithMap from "@/components/video-player";
import VideoWithMapClient from "@/components/video-player-client";
import { createClient } from "@/lib/supabase-server";
import { ArrowLeftIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const VideoPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ surveyId: string }>;
  searchParams: Promise<{ x?: string; y?: string }>;
}) => {
  const { surveyId } = await params;
  const { x, y } = await searchParams;

  const user = (await cookies()).get("user");

  if (!user) {
    redirect(`/preview/${surveyId}?x=${x}&y=${y}`);
  }

  const supabase = await createClient();
  const [videoResult, surveyResult] = await Promise.all([
    supabase.from("videos").select("*").eq("survey_id", surveyId).single(),
    supabase
      .from("surveys")
      .select(
        `
        id,
        state,
        gps_track_id,
        gps_tracks(*)
      `
      )
      .eq("id", surveyId)
      .single(),
  ]);

  const { data: videoData, error: videoError } = videoResult;
  const { data: surveyData, error: surveyError } = surveyResult;

  if (!videoData?.url) {
    // console.log("no video found for this survey");
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Badge
          variant="destructive"
          className="text-2xl font-bold bg-red-500 text-white animate-pulse border-red-700 shadow-lg"
        >
          No video found for this survey
        </Badge>
        <Link
          href="/geotaggedvideos"
          className="text-red-500 hover:text-red-700 underline text-sm"
        >
          Go back to surveys?
        </Link>
      </div>
    );
  }

  if (!videoData.mux_playback_id) {
    //  console.log("video is still processing");
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-2xl font-bold">Video is still processing</h1>
        <Link
          href="/geotaggedvideos"
          className="text-gray-800 hover:text-gray-600 underline text-sm"
        >
          Go back to surveys?
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 ">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Link
              href="/geotaggedvideos"
              className="flex items-center gap-2 w-fit h-fit"
            >
              <ArrowLeftIcon size={16} />
              Back
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-balance text-[#262626] dark:text-white">
          {videoData.name}
        </h1>
      </div>
      <div className=" mt-4">
        <VideoWithMapClient
          videoUrl={
            videoData.mux_playback_id.includes(".m3u8")
              ? videoData.mux_playback_id
              : `https://stream.mux.com/${videoData.mux_playback_id}.m3u8`
          }
          locationData={surveyData?.gps_tracks?.location_data}
          initialX={x}
          initialY={y}
          createdAt={videoData.created_at}
          state={surveyData?.state}
        />
      </div>
    </div>
  );
};
export default VideoPage;
