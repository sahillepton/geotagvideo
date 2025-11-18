import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";
import Papa from "papaparse";

// Tailwind class merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------- */
/*                               GEOJSON HELPERS                               */
/* -------------------------------------------------------------------------- */

interface TrackPoint {
  Latitude: number;
  Longitude: number;
  Accuracy?: number;
  Timestamp?: string | number;
}

const convertToGeoJSON = (points: TrackPoint[]) => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: points.map((p) => [p.Longitude, p.Latitude]),
      },
      properties: {},
    },
  ],
});

/* ----------------------------- KML CONVERSION ------------------------------ */

function geojsonToKml(geojson: any) {
  const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>`;

  const kmlFooter = `</Document></kml>`;

  const convertCoords = (coords: any) => coords.join(",");

  const convertGeometry = (geometry: any) => {
    switch (geometry.type) {
      case "LineString":
        return `<LineString><coordinates>${geometry.coordinates
          .map(convertCoords)
          .join(" ")}</coordinates></LineString>`;

      case "Point":
        return `<Point><coordinates>${convertCoords(
          geometry.coordinates
        )}</coordinates></Point>`;

      default:
        return "";
    }
  };

  // GeoJSON may contain single Feature or FeatureCollection
  const features = (geojson.features || [geojson])
    .map((f: any) => {
      const name = f.properties?.name ?? "Track";
      const geometry = convertGeometry(f.geometry);
      return `
<Placemark>
  <name>${name}</name>
  ${geometry}
</Placemark>`;
    })
    .join("\n");

  return `${kmlHeader}${features}${kmlFooter}`;
}

/* ----------------------------- FILE DOWNLOADS ------------------------------ */

const downloadBlob = (blob: Blob, filename: string) => {
  console.log(blob, "blob");
  console.log(filename, "filename");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 500);
};

/* ------------------------------ DOWNLOAD CSV ------------------------------- */

const downloadCSV = (points: TrackPoint[], name: string) => {
  const csv = Papa.unparse(points);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${name}.csv`);
};

/* ------------------------------ DOWNLOAD KML ------------------------------- */

const downloadKML = (kml: string, name: string) => {
  const blob = new Blob([kml], {
    type: "application/vnd.google-earth.kml+xml",
  });
  downloadBlob(blob, `${name}.kml`);
};

/* ------------------------------ PUBLIC EXPORT ------------------------------ */

export const handleDownloadGeoJSON = async (gpsTrackId: string) => {
  try {
    const { data, error } = await supabase
      .from("gps_tracks")
      .select("location_data, name")
      .eq("id", gpsTrackId)
      .single();

    if (error) {
      console.error("Error fetching GPS track:", error);
      return;
    }

    const points: TrackPoint[] = data.location_data;

    const geoJSON = convertToGeoJSON(points);
    const kml = geojsonToKml(geoJSON);

    // CSV download uses original points array (not GeoJSON)
    downloadCSV(points, data.name);
    downloadKML(kml, data.name);

    console.log("Files downloaded:", data.name);
  } catch (err) {
    console.error("Error downloading GPS data:", err);
  }
};

/* -------------------------------------------------------------------------- */
/*                               VIDEO DOWNLOAD                                */
/* -------------------------------------------------------------------------- */

export const handleDownloadVideo = async (surveyId: string) => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .select("url, name")
      .eq("survey_id", surveyId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching video:", error);
      return;
    }

    if (!data?.url) {
      console.error("No video URL found");
      return;
    }

    const response = await fetch(data.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    console.log(data.url);

    const blob = await response.blob();

    // infer extension
    const mime = blob.type || "video/mp4";
    let extension = "mp4";

    if (mime.includes("webm")) extension = "webm";
    else if (mime.includes("ogg")) extension = "ogg";
    else if (mime.includes("mov") || mime.includes("quicktime"))
      extension = "mov";
    else if (mime.includes("avi")) extension = "avi";

    const base = data.name?.replace(/\.[^/.]+$/, "") || `video_${surveyId}`;

    downloadBlob(blob, `${base}.${extension}`);
  } catch (err) {
    console.error("Error downloading video:", err);
  }
};
