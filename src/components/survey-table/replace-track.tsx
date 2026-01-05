import {
  DownloadIcon,
  FileIcon,
  RefreshCcwIcon,
  UploadIcon,
  CheckIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useRef, useState } from "react";
import { Badge } from "../ui/badge";
import JSZip from "jszip";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "../ui/item";
import TrackPreview from "./track-preview";
import ErrorDialog from "./error-dialog";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Spinner } from "../ui/spinner";

const ReplaceTrack = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<{ filename: string; content: Blob }[]>([]);
  const [errors, setErrors] = useState<{ filename: string; error: string }[]>(
    []
  );
  const [successes, setSuccesses] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrors([]);
      setSuccesses([]);
      setFiles([]);
      const zip = await JSZip.loadAsync(file);
      Object.keys(zip.files).forEach(async (filename) => {
        const zippedFile = zip.files[filename];

        if (!zippedFile.dir) {
          const content = await zippedFile.async("blob");

          if (
            filename.endsWith(".txt") ||
            filename.endsWith(".json") ||
            filename.endsWith(".geojson")
          ) {
            setFiles((prev) => [...prev, { filename, content }]);
          }
        }
      });
    }
  };

  const handleReplaceTracks = async () => {
    setIsUploading(true);
    setErrors([]);
    setSuccesses([]);
    for (const file of files) {
      try {
        const text = await file.content.text();

        // Parse JSON first - if this fails, we don't proceed to Supabase
        let jsonText;
        try {
          jsonText = JSON.parse(text);
        } catch (parseError) {
          setErrors((prev) => [
            ...prev,
            {
              filename: file.filename,
              error:
                parseError instanceof Error
                  ? `Invalid JSON format: ${parseError.message}`
                  : "Invalid JSON format",
            },
          ]);
          continue; // Skip Supabase operations if parsing fails
        }

        // Validate JSON structure - must be an array of objects with required properties
        if (!Array.isArray(jsonText)) {
          setErrors((prev) => [
            ...prev,
            {
              filename: file.filename,
              error: "JSON must be an array of objects",
            },
          ]);
          continue; // Skip Supabase operations if structure is invalid
        }

        // Validate each object in the array has required properties
        const requiredProperties = [
          "Accuracy",
          "Latitude",
          "Longitude",
          "timeStamp",
        ];
        const invalidIndex = jsonText.findIndex((item) => {
          if (typeof item !== "object" || item === null) {
            return true;
          }
          return !requiredProperties.every((prop) => prop in item);
        });

        if (invalidIndex !== -1) {
          setErrors((prev) => [
            ...prev,
            {
              filename: file.filename,
              error: `Invalid structure at index ${invalidIndex}. Each object must have: Accuracy, Latitude, Longitude, timeStamp`,
            },
          ]);
          continue; // Skip Supabase operations if structure is invalid
        }

        // Only proceed to Supabase if JSON parsing and validation succeeded
        // Extract surveyId by removing file extension (.txt, .json, or .geojson)
        const surveyId = file.filename.replace(/\.(txt|json|geojson)$/i, "");
        const { data: surveyData, error: surveyError } = await supabase
          .from("surveys")
          .select("gps_track_id")
          .eq("id", surveyId)
          .single();

        if (surveyError) {
          throw surveyError;
        }
        const { error: updateError } = await supabase
          .from("gps_tracks")
          .update({ location_data: jsonText })
          .eq("id", surveyData.gps_track_id);

        if (updateError) {
          throw updateError;
        }

        // Track successful upload
        setSuccesses((prev) => [...prev, file.filename]);
      } catch (error) {
        setErrors((prev) => [
          ...prev,
          {
            filename: file.filename,
            error:
              error instanceof Error
                ? error.message
                : "An error occurred while processing the file",
          },
        ]);
        continue;
      }
    }
    setIsUploading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <RefreshCcwIcon size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-bold">Replace Tracks</DialogTitle>
          <DialogDescription asChild>
            <ol className="list-decimal list-inside font-extrabold">
              <li>
                File containing new track info should be .txt, .json, or
                .geojson file
              </li>
              <li>
                File name should be "surveyid.txt", "surveyid.json", or
                "surveyid.geojson"
              </li>
              <li>
                Place all files in the same folder and upload a zip of the
                folder
              </li>
            </ol>
          </DialogDescription>
        </DialogHeader>
        <div
          onClick={handleFileSelect}
          className={`w-full ${
            selectedFile ? "h-20" : "h-30"
          } flex flex-col items-center justify-center border-6 border-dashed ${
            selectedFile ? "border-blue-300" : ""
          } rounded-lg bg-[#f8fafb] p-2 hover:bg-[#f1f3f4] cursor-pointer transition-all duration-300`}
        >
          {selectedFile ? (
            <div>
              <Badge
                className="text-lg flex items-center gap-2"
                variant="secondary"
              >
                <FileIcon className="text-[#717370]" size={24} />
                {selectedFile.name}
              </Badge>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <UploadIcon className="text-[#717370]" size={30} />
              <p className="font-semibold">Select file to replace tracks</p>
            </div>
          )}

          <input
            type="file"
            ref={fileRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="flex flex-col overflow-y-auto max-h-[300px]">
          {files.map((file) => {
            const fileError = errors.find(
              (err) => err.filename === file.filename
            );
            const isSuccess = successes.includes(file.filename);
            return (
              <div
                key={file.filename}
                className="flex items-center justify-between mt-1 rounded-md p-2 bg-muted text-[#717370]"
              >
                <p>{file.filename}</p>
                <div className="flex items-center gap-2">
                  {fileError && (
                    <ErrorDialog
                      filename={fileError.filename}
                      error={fileError.error}
                    />
                  )}
                  {isSuccess && (
                    <CheckIcon size={14} className="text-green-600" />
                  )}
                  <TrackPreview content={file.content} />
                </div>
              </div>
            );
          })}
        </div>
        {files.length > 0 && (
          <DialogFooter>
            <Button
              onClick={handleReplaceTracks}
              size="sm"
              className="bg-black text-white"
              disabled={isUploading}
            >
              {isUploading ? <Spinner /> : "Replace Tracks"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReplaceTrack;
