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

const DownloadDialog = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedTracks, setDownloadedTracks] = useState<number>(0);
  const [currentTrackName, setCurrentTrackName] = useState<string>("");
  const [totalTracks, setTotalTracks] = useState<number>(0);

  const downloadTracks = async () => {
    setIsDownloading(true);
    setDownloadedTracks(0);

    try {
      const { count, error } = await supabase
        .from("gps_tracks")
        .select("id", { count: "exact", head: true });

      if (error) {
        console.error("Error counting tracks:", error);
        setIsDownloading(false);
        return;
      }

      setTotalTracks(count || 0);

      const batchSize = 100;
      let processedCount = 0;
      let offset = 0;
      let hasMore = true;
      let batchNumber = 1;
      const dateStr = new Date().toISOString().split("T")[0];

      // Process tracks in batches of 100
      while (hasMore) {
        // Create a new JSZip instance for this batch
        const zip = new JSZip();
        const batchFolder = zip.folder("gps_tracks");

        if (!batchFolder) {
          console.error(`Failed to create zip folder for batch ${batchNumber}`);
          break;
        }

        // Fetch batch of tracks sorted by created_at
        const { data, error } = await supabase
          .from("gps_tracks")
          .select("id, name")
          .order("created_at", { ascending: false })
          .range(offset, offset + batchSize - 1);

        if (error) {
          console.error("Error fetching tracks batch:", error);
          break;
        }

        if (!data || data.length === 0) {
          hasMore = false;
          break;
        }

        // Process each track in the current batch
        for (const track of data) {
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

        console.log(`Batch ${batchNumber} downloaded successfully!`);

        // If we got less than batchSize, we're done
        if (data.length < batchSize) {
          hasMore = false;
        } else {
          offset += batchSize;
          batchNumber++;
        }
      }

      console.log("All batches downloaded successfully!");
    } catch (error) {
      console.error("Error downloading tracks:", error);
    } finally {
      setIsDownloading(false);
      setDownloadedTracks(0);
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
            {currentTrackName ? (
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
            {isDownloading
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
