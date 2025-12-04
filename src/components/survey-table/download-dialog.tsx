import { DownloadIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { supabase } from "@/lib/supabase";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Item, ItemContent, ItemMedia, ItemTitle } from "../ui/item";
import { generateTrackFiles } from "@/lib/utils";
import JSZip from "jszip";
import { Progress } from "../ui/progress";
import { User } from "@/lib/types";

const DownloadDialog = ({ currentUser }: { currentUser: User }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedTracks, setDownloadedTracks] = useState<number>(0);
  const [currentTrackName, setCurrentTrackName] = useState<string>("");
  const [totalTracks, setTotalTracks] = useState<number>(0);
  const [isDownloadComplete, setIsDownloadComplete] = useState(false);

  const downloadTracks = async () => {
    setIsDownloading(true);
    setDownloadedTracks(0);
    setIsDownloadComplete(false);
    setCurrentTrackName("");

    try {
      // Get managed user IDs if manager (cache this to avoid multiple queries)
      let managedUserIds: string[] = [];
      if (currentUser?.role) {
        const userRole = currentUser.role.toLowerCase();

        if (userRole === "manager" && currentUser.user_id) {
          const { data: managedUsers } = await supabase
            .from("users")
            .select("user_id")
            .eq("manager_id", currentUser.user_id);

          managedUserIds = managedUsers
            ? managedUsers.map((user) => user.user_id)
            : [];
          managedUserIds.push(currentUser.user_id);
        }
      }

      // Build base query with user filtering using foreign key relation
      let baseQuery = supabase
        .from("surveys")
        .select("gps_track_id")
        .not("gps_track_id", "is", null);

      // Apply user role-based filtering (same logic as action.ts)
      if (currentUser?.role) {
        const userRole = currentUser.role.toLowerCase();

        if (userRole === "manager" && managedUserIds.length > 0) {
          baseQuery = baseQuery.in("user_id", managedUserIds);
        } else if (userRole === "surveyor" && currentUser.user_id) {
          baseQuery = baseQuery.eq("user_id", currentUser.user_id);
        }
      }

      // Get all surveys to get unique track IDs
      const { data: allSurveys, error: countError } = await baseQuery;

      if (countError) {
        console.error("Error counting tracks:", countError);
        setIsDownloading(false);
        return;
      }

      // Get unique gps_track_ids
      const uniqueTrackIds = Array.from(
        new Set(
          (allSurveys || [])
            .map((s) => s.gps_track_id)
            .filter((id) => id !== null)
        )
      ) as string[];

      setTotalTracks(uniqueTrackIds.length);

      const batchSize = 100;
      let processedCount = 0;
      let batchNumber = 1;
      const dateStr = new Date().toISOString().split("T")[0];

      // Process tracks in batches
      for (let i = 0; i < uniqueTrackIds.length; i += batchSize) {
        const batchTrackIds = uniqueTrackIds.slice(i, i + batchSize);

        // Create a new JSZip instance for this batch
        const zip = new JSZip();
        const batchFolder = zip.folder("gps_tracks");

        if (!batchFolder) {
          console.error(`Failed to create zip folder for batch ${batchNumber}`);
          continue;
        }

        // Fetch tracks using foreign key relation through surveys
        // Get surveys that have these track IDs and apply user filtering
        let query = supabase
          .from("surveys")
          .select("gps_track_id, gps_tracks(id, name)")
          .in("gps_track_id", batchTrackIds);

        // Apply user role-based filtering (reuse managedUserIds from above)
        if (currentUser?.role) {
          const userRole = currentUser.role.toLowerCase();

          if (userRole === "manager" && managedUserIds.length > 0) {
            query = query.in("user_id", managedUserIds);
          } else if (userRole === "surveyor" && currentUser.user_id) {
            query = query.eq("user_id", currentUser.user_id);
          }
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching tracks batch:", error);
          continue;
        }

        if (!data || data.length === 0) {
          continue;
        }

        // Extract unique tracks from surveys (filter out nulls and duplicates)
        const uniqueTracks = new Map();
        for (const survey of data) {
          if (survey.gps_tracks && survey.gps_track_id) {
            // Handle both array and single object cases for foreign key relation
            const track = Array.isArray(survey.gps_tracks)
              ? survey.gps_tracks[0]
              : survey.gps_tracks;
            if (track && track.id && !uniqueTracks.has(track.id)) {
              uniqueTracks.set(track.id, track);
            }
          }
        }

        const tracks = Array.from(uniqueTracks.values());

        // Process each track in the current batch
        for (const track of tracks) {
          try {
            // Generate CSV and KML data for this track
            setCurrentTrackName(track.name);
            const trackFiles = await generateTrackFiles(track.id);

            if (trackFiles) {
              // Sanitize filename (remove invalid characters)
              const sanitizedName = trackFiles.name
                .replace(/[<>:"/\\|?*]/g, "_")
                .trim();

              // Add CSV file to batch folder
              batchFolder.file(`${sanitizedName}.csv`, trackFiles.csv);

              // Add KML file to batch folder
              batchFolder.file(`${sanitizedName}.kml`, trackFiles.kml);
            }

            processedCount++;
            setDownloadedTracks(processedCount);
          } catch (err) {
            console.error(`Error processing track ${track.id}:`, err);
            // Continue with other tracks even if one fails
            processedCount++;
            setDownloadedTracks(processedCount);
          }
        }

        // Generate and download zip file for this batch
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gps_tracks_batch_${batchNumber}_${dateStr}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        //   console.log(`Batch ${batchNumber} downloaded successfully!`);
        batchNumber++;
      }

      //  console.log("All batches downloaded successfully!");
      setIsDownloadComplete(true);
      setCurrentTrackName("");
    } catch (error) {
      console.error("Error downloading tracks:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <DownloadIcon size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {" "}
            {isDownloadComplete ? (
              <div className="flex items-center gap-2">
                <DownloadIcon size={30} className="text-green-500 font-bold" />
                <span className="font-bold text-green-500">
                  All tracks have been downloaded
                </span>
              </div>
            ) : currentTrackName ? (
              <div className="flex items-center gap-2">
                <DownloadIcon size={30} className="text-[#5587dc] font-bold" />
                <span className=" font-bold flex gap-2">
                  <p>Downloading</p>
                  <p className="text-[#5587dc]">"{currentTrackName}"</p>
                </span>
              </div>
            ) : (
              "Download All Tracks"
            )}
          </DialogTitle>
          <DialogDescription>
            {isDownloadComplete
              ? `Successfully downloaded ${totalTracks} track${
                  totalTracks !== 1 ? "s" : ""
                }. All zip files have been saved to your downloads folder.`
              : isDownloading
              ? "Please wait till the download is complete"
              : "This action will download all the tracks for your surveys."}
          </DialogDescription>
        </DialogHeader>

        {isDownloading ? (
          <div>
            <Progress
              value={(downloadedTracks / totalTracks) * 100}
              className="w-full"
              color="#5587dc"
            />
            <span>
              {totalTracks > 0 ? (
                <span className="text-gray-300 text-sm">
                  {((downloadedTracks / totalTracks) * 100).toFixed(2)}% tracks
                  processed
                </span>
              ) : (
                <span className="text-gray-300 text-sm">Starting download</span>
              )}
            </span>
          </div>
        ) : (
          <div>
            <Button onClick={downloadTracks}>Download Tracks</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDialog;
