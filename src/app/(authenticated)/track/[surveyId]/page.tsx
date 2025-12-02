//@ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase-server";
import { ArrowLeftIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Map from "@/components/map";

export const experimental_ppr = true;

const TrackPage = async ({
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
  const [surveyResult] = await Promise.all([
    supabase
      .from("surveys")
      .select(
        `
        id,
        name,
        state,
        gps_track_id,
        gps_tracks(*)
      `
      )
      .eq("id", surveyId)
      .single(),
  ]);
  const { data: surveyData, error: surveyError } = surveyResult;

  // Parse location data if it's a JSON string
  const parsedLocationData = (() => {
    if (!surveyData?.gps_tracks?.location_data) return [];

    try {
      // If locationData is a string, parse it
      if (typeof surveyData.gps_tracks.location_data === "string") {
        const parsed = JSON.parse(surveyData.gps_tracks.location_data);
        return Array.isArray(parsed) ? parsed : [];
      }

      // If it's already an array, return it
      if (Array.isArray(surveyData.gps_tracks.location_data)) {
        return surveyData.gps_tracks.location_data;
      }

      return [];
    } catch (error) {
      console.error("Error parsing location data:", error);
      return [];
    }
  })();

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
          {surveyData.name}
        </h1>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col justify-center items-center h-screen">
            <Badge
              variant={"secondary"}
              className="
    text-2xl 
    font-bold 
    bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 
    animate-pulse 
    border-2 border-yellow-500 
    text-yellow-800
    shadow-lg
    "
            >
              Fetching video and GPS tracks
            </Badge>
          </div>
        }
      >
        <Map
          data={parsedLocationData}
          createdAt={
            surveyData?.gps_tracks?.created_at || new Date().toISOString()
          }
          state={surveyData?.state || ""}
        />
      </Suspense>
    </div>
  );
};
export default TrackPage;
