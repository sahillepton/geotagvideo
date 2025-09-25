import { Card, CardContent } from "../ui/card";
import { Clock, Crosshair, MapPin, Ruler } from "lucide-react";
import { TooltipProvider } from "../ui/tooltip";
import { formatTime } from "@/lib/utils";
const MapComponent = ({
  mapRef,
  timestamp,
  coords,
  distance,
  createdAt,
  state,
  accuracy,
  hoverInfo,
  mousePosition,
  locationData,
}: {
  mapRef: React.RefObject<HTMLDivElement | null>;
  timestamp: number;
  coords: { lat: number; lng: number };
  distance: number;
  createdAt: string;
  state: string;
  accuracy: number;
  hoverInfo: { timestamp: string; lat: string; lng: string } | null;
  mousePosition: { x: number; y: number };
  locationData: any[];
}) => {
  if (typeof window === "undefined") {
    return <div>Loading map...</div>;
  }

  if (!locationData || locationData.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <div>No GPS data available</div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Card className="z-[9999] absolute top-2 left-2 shadow-lg rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-md">
        <CardContent className="pl-2 pr-2 pt-0 pb-0 text-sm text-neutral-700">
          {/* Time */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-500" />
            <span className="truncate">{formatTime(timestamp)}</span>
          </div>

          {/* Lat / Lng */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />
            <span className="truncate">
              {coords.lat}, {coords.lng}
            </span>
          </div>

          {/* Distance */}
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-blue-500" />
            <span>{distance} m</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-500" />
            <span className="truncate">
              {new Date(createdAt).toISOString().split("T")[0]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-500" />
            <span className="truncate">
              {new Date(createdAt).toISOString().split("T")[1].slice(0, 5)}
            </span>
          </div>

          {/* Accuracy */}
          {state?.toLowerCase() === "madhya pradesh" && (
            <div className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-green-500" />
              <span>{accuracy} m</span>
            </div>
          )}
        </CardContent>
      </Card>

      {hoverInfo && (
        <div
          className="absolute z-[10000] pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            transform: "translate(0, -100%)",
          }}
        >
          <TooltipProvider>
            <div className="bg-popover text-popover-foreground rounded-md border px-3 py-2 text-sm shadow-md animate-in fade-in-0 zoom-in-95">
              <div className="font-semibold text-foreground mb-2 pb-1 border-b">
                Route Info
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-muted-foreground">Time:</span>
                  <span className="text-xs font-semibold text-green-600">
                    {hoverInfo.timestamp}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-muted-foreground">Lat:</span>
                  <span className="text-xs font-mono text-red-600">
                    {hoverInfo.lat}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-muted-foreground">Lng:</span>
                  <span className="text-xs font-mono text-red-600">
                    {hoverInfo.lng}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center mt-2 pt-1 border-t">
                Click to seek to this point
              </div>
            </div>
          </TooltipProvider>
        </div>
      )}

      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "400px",
          backgroundColor: "#f0f0f0",
        }}
      />
    </div>
  );
};

export default MapComponent;
