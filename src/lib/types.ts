export type User = {
  user_id: string;
  username: string;
  email: string;
  role: string;
};

export type SurveyData = {
  id: string;
  name: string;
  state: string | null;
  gps_track_id: string | null;
  gps_tracks: {
    id: string;
    name: string;
    duration: string;
    route_id: string | null;
    entity_id: string | null;
    timestamp: string | null;
    created_at: string | null;
    depth_data: string | null;
    location_data: any[];
  };
};
