import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";
import Papa from "papaparse";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const handleDownloadGeoJSON = async (gpsTrackId: string) => {
  try {
    const { data, error } = await supabase
      .from("gps_tracks")
      .select("location_data, name")
      .eq("id", gpsTrackId)
      .single();
    if (error) {
      console.error("Error downloading GPS data as CSV:", error);
      //toast.error("Failed to download location data");
      return;
    }
    const csv = Papa.unparse(data.location_data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    //  toast.success(`${data.name} downloaded successfully`);
  } catch (error) {
    console.error("Error downloading GPS data as CSV:", error);
    //toast.error("Failed to download location data");
  }
};
