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

export const dynamic = "force-dynamic";

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

  // console.log(surveyData);

  // Parse location data if it's a JSON string
  const parsedLocationData = (() => {
    if (!surveyData?.gps_tracks?.location_data) return [];

    try {
      let parsed: any[] = [];
      
      if (typeof surveyData.gps_tracks.location_data === "string") {
        parsed = JSON.parse(surveyData.gps_tracks.location_data);
      } else if (Array.isArray(surveyData.gps_tracks.location_data)) {
        parsed = surveyData.gps_tracks.location_data;
      } else {
        return [];
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [];
      }

      // Normalize timestamps: convert milliseconds to relative seconds
      // Handle both "timeStamp" and "Timestamp" property names
      const timestampKey = parsed[0].timeStamp !== undefined ? "timeStamp" : 
                          parsed[0].Timestamp !== undefined ? "Timestamp" : null;

      if (!timestampKey) {
        return parsed; // Return as-is if no timestamp field found
      }

      // Check if timestamps are in milliseconds (large numbers > 1000000)
      const firstTimestamp = parseFloat(parsed[0][timestampKey]);
      const isMilliseconds = firstTimestamp > 1000000;

      if (isMilliseconds) {
        // Find minimum timestamp
        const minTimestamp = Math.min(
          ...parsed.map((item) => parseFloat(item[timestampKey]))
        );

        // Normalize: subtract min and convert to seconds
        const normalized = parsed.map((item) => {
          const timestamp = parseFloat(item[timestampKey]);
          const normalizedSeconds = (timestamp - minTimestamp) / 1000;
          
          // Create new object with normalized timestamp
          const normalizedItem = { ...item };
          // Use lowercase "timeStamp" for consistency
          delete normalizedItem[timestampKey];
          normalizedItem.timeStamp = normalizedSeconds.toString();
          
          return normalizedItem;
        });

        return normalized;
      }

      // If already in seconds format, ensure consistent property name
      if (timestampKey === "Timestamp") {
        return parsed.map((item) => {
          const normalizedItem = { ...item };
          normalizedItem.timeStamp = item.Timestamp;
          delete normalizedItem.Timestamp;
          return normalizedItem;
        });
      }

      return parsed;
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
