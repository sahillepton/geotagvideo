# Geo Tagged Videos - Technical Documentation

## 1. Project Overview

### Purpose

Geo Tagged Videos is a web application for managing, viewing, and analyzing geotagged video content with synchronized GPS tracking data. The platform enables users to upload videos, associate GPS tracks, and visualize location data on interactive maps.

### Key Features

- Video playback with HLS streaming (Mux integration)
- Interactive video-map synchronization
- GPS track replacement and validation
- Multi-format data export (KML, CSV, JSON, GeoJSON)
- Role-based access control
- Search and filter capabilities
- 360° video support with VR capabilities

---

## 2. Architecture

### System Architecture

The application follows a **Next.js App Router** architecture with server and client components:

```
┌─────────────────────────────────────────────────┐
│           Next.js Application (SSR/SSG)          │
├─────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                   │
│  ├── Server Components (Data Fetching)           │
│  ├── Client Components (Interactivity)           │
│  └── API Routes (Server Actions)                 │
├─────────────────────────────────────────────────┤
│  State Management                                │
│  ├── Zustand (Video/Map State)                  │
│  ├── React Query (Server State)                 │
│  └── React Context (Theme)                      │
├─────────────────────────────────────────────────┤
│  External Services                               │
│  ├── Supabase (Database + Auth)                  │
│  ├── Mux (Video Streaming)                      │
│  └── Google Maps API                            │
└─────────────────────────────────────────────────┘
```

### Frontend / Backend Breakdown

**Frontend:**

- Next.js 16 with App Router
- React 19 with Server/Client Components
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn components

**Backend:**

- Next.js API Routes (serverless functions)
- Supabase for database and authentication
- Server Actions for form submissions

**Services:**

- **Mux**: Video transcoding and HLS streaming
- **Google Maps**: Map rendering and geocoding
- **Supabase**: PostgreSQL database with real-time capabilities

### Data Flow

1. **Video Upload Flow:**

   - Handled via https://survey-video-manager.vercel.app/
   - User uploads a video associated with a survey
   - Video is uploaded using multipart upload to Cloudflare R2 storage
     -Initial video file URL is stored in the videos database table
     -A database trigger / background job is invoked after the upload
     -The trigger uploads the video from R2 to Mux
     -Mux processes the video and generates a playback URL
     -The videos table is updated with the Mux playback URL
     -All subsequent video playback uses the Mux playback URL

2. **GPS Track Flow:**

   -User logs in to the Geo-Tag Survey Application
   -User starts a new survey session
   -User records a 360° video during the survey
   -Simultaneously, the application captures geo-location data (latitude, longitude, accuracy, timestamp)
   -Location points are continuously recorded to form a track
   -After completing the recording, the user reviews the captured data
   -User uploads the 360° video to the backend
   -User uploads the location track data to the database
   -Video and geo-track are linked to the same survey record
   -Uploaded data becomes available for further processing and visualization

3. **Authentication Flow:**
   - User logs in → Server action validates credentials
   - User data stored in HTTP-only cookie
   - Middleware checks authentication on protected routes

---

## 3. Tech Stack

### Core Technologies

- **Next.js 16.0.8**: React framework with App Router, SSR, and API routes
- **React 19.2.1**: UI library with Server Components
- **TypeScript 5.9.3**: Type-safe JavaScript
- **Tailwind CSS 4**: Utility-first CSS framework

### State Management

- **Zustand 5.0.8**: Lightweight state management for video/map state
- **TanStack Query 5.85.5**: Server state management and caching

### UI Components

- **Shad CN**: Accessible component primitives
- **Lucide React**: Icon library

### Video & Media

- **Mux**: Video streaming platform
- **HLS.js 1.6.10**: HLS video playback
- **@react-three/fiber**: 3D rendering for 360° videos
- **@react-three/xr**: VR support

### Maps & Geospatial

- **Google Maps API**: Map rendering and geocoding

### Database & Backend

- **Supabase**: PostgreSQL database with real-time subscriptions
- **@supabase/ssr**: Server-side rendering support
- **@supabase/supabase-js**: Client library

### Data Processing

- **PapaParse 5.5.3**: CSV parsing
- **JSZip 3.10.1**: ZIP file handling
- **Axios 1.11.0**: HTTP client

## 4. Folder & File Structure

```
geotag/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (authenticated)/          # Protected route group
│   │   │   ├── geotaggedvideos/      # Main survey listing page
│   │   │   ├── video/[surveyId]/     # Video playback page
│   │   │   ├── track/[surveyId]/     # GPS track map view
│   │   │   ├── user-management/      # User management page
│   │   │   └── layout.tsx            # Authenticated layout (sidebar)
│   │   ├── api/                      # API routes
│   │   │   ├── create-asset/         # Mux asset creation
│   │   │   ├── mux-webhook/          # Mux event handler
│   │   │   └── mux-status/           # Mux status check
│   │   ├── login/                    # Login page
│   │   ├── preview/[surveyId]/        # Public preview page
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Home/landing page
│   ├── components/                    # React components
│   │   ├── map/                      # Google Maps component
│   │   ├── sidebar/                  # Navigation sidebar
│   │   ├── survey-table/             # Survey data table
│   │   ├── user-table/               # User management table
│   │   ├── video-player/             # Video playback components
│   │   ├── table/                    # Reusable table components
│   │   └── ui/                       # UI primitives (Radix)
│   ├── lib/                          # Utilities and helpers
│   │   ├── supabase.ts               # Client Supabase instance
│   │   ├── supabase-server.ts        # Server Supabase instance
│   │   ├── video-store.ts            # Zustand video state
│   │   ├── utils.ts                  # Utility functions
│   │   └── types.ts                  # TypeScript types
│   ├── hooks/                        # Custom React hooks
│   └── react-query/                  # React Query provider
├── public/                           # Static assets
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies and scripts
└── Dockerfile                        # Docker configuration
```

### Key Directories

**`src/app/`**: Next.js App Router pages and layouts

- Route groups `(authenticated)` for protected routes
- Dynamic routes `[surveyId]` for parameterized pages
- API routes in `api/` directory

**`src/components/`**: Reusable React components

- Organized by feature (map, video-player, survey-table)
- `ui/` contains base components from Radix UI

**`src/lib/`**: Core business logic

- Database clients (Supabase)
- State management (Zustand stores)
- Utility functions

---

## 5. Core Modules & Components

### Video Player Module (`src/components/video-player/`)

**Purpose**: Handles video playback with GPS synchronization

**Key Components:**

- `VideoPlayer.tsx`: Main video player with controls
- `VideoWithMap.tsx`: Split-panel view (video + map)
- `VideoControls.tsx`: Playback controls
- `VideoSphere.tsx`: 360° video rendering
- `ProgressBar.tsx`: Video progress indicator

**Key Responsibilities:**

- HLS video playback using hls.js
- GPS track synchronization with video time
- Volume and quality controls
- Fullscreen and VR mode support

**Public APIs:**

```typescript
<VideoPlayer
  url: string
  initialTimestamp?: number
  locationData?: any[]
  createdAt?: string
/>
```

**Internal Logic:**

- Uses `useEffect` to sync video `currentTime` with GPS data
- Interpolates GPS coordinates between timestamps
- Updates Zustand store with current location

### Map Component (`src/components/map/index.tsx`)

**Purpose**: Renders GPS tracks on Google Maps

**Key Responsibilities:**

- Initialize Google Maps instance
- Render GPS track polyline
- Display moving marker synchronized with video
- Show covered/remaining route segments
- Handle map interactions (hover, click)

**Internal Logic:**

- Uses `useRef` to store map instance
- `requestAnimationFrame` for smooth marker animation
- Interpolates position based on video timestamp
- Calculates distance using Google Maps geometry library

### Survey Table (`src/components/survey-table/`)

**Purpose**: Displays and manages survey data

**Key Components:**

- `index.tsx`: Main table component
- `survey-columns.tsx`: Column definitions
- `download-dialog.tsx`: Export functionality
- `replace-track.tsx`: GPS track replacement
- `search-bar.tsx`: Search and filters

**Key Responsibilities:**

- Fetch and display surveys from Supabase
- Filter by location, date, user role
- Export GPS tracks (KML, CSV, JSON)
- Replace GPS tracks with validation

**Data Flow:**

1. Fetch surveys using `getVideoList()` from `action.ts`
2. Apply filters (role-based, location, date)
3. Render using TanStack Table
4. Handle actions (download, replace, view)

### State Management (`src/lib/video-store.ts`)

**Purpose**: Centralized state for video and map

**State Categories:**

- **Video State**: playback, time, duration, volume
- **Location State**: coordinates, distance, accuracy, timestamp
- **UI State**: fullscreen, controls visibility
- **Map State**: hover info, mouse position

**Hooks:**

```typescript
useVideo(); // Video element
usePlayback(); // Playback state
useLocation(); // GPS coordinates
useRotation(); // Rotation angle
useMapState(); // Map interactions
```

**Usage Pattern:**

- Components subscribe to specific state slices
- Updates trigger re-renders only for subscribed components
- Server state (surveys) managed by React Query

### API Routes (`src/app/api/`)

**`create-asset/route.ts`**: Creates Mux video asset

- Accepts video file upload
- Creates Mux asset via API
- Stores asset_id in database
- Returns playback URL

**`mux-webhook/route.ts`**: Handles Mux events

- Listens for `video.asset.ready` events
- Updates `videos` table with playback URL
- Handles error events

**`mux-status/[playback-id]/route.ts`**: Checks Mux status

- Queries Mux API for asset status
- Returns processing state

---

## 6. State Management & Data Handling

### State Flow

**Client State (Zustand):**

```
VideoStore (Zustand)
├── Video playback state
├── GPS location state
└── UI state
```

**Server State (React Query):**

```
React Query Cache
├── ["videos", page, filters] → Survey list
├── ["users-management"] → User list
└── ["routes", filters] → Route list
```

### API Calls

**Pattern:**

- Server Actions in `src/components/sidebar/action.ts`
- Client queries using `useQuery` hook
- Server components use `createClient()` from Supabase

**Example:**

```typescript
// Server Action
export async function getVideoList(filters, page, pageSize) {
  const supabase = await createClient();
  // Query logic
}

// Client Usage
const { data } = useQuery({
  queryKey: ["videos", page, filters],
  queryFn: () => getVideoList(filters, page, pageSize),
});
```

## 7. Configuration & Environment

### Environment Variables

Required environment variables (`.env.local`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Mux (if used)
MUX_TOKEN_ID=your-token-id
MUX_TOKEN_SECRET=your-token-secret
```

### Configuration Files

**`next.config.ts`**: Next.js configuration

- Currently minimal configuration
- Can add image domains, redirects, etc.

**`tsconfig.json`**: TypeScript configuration

- Path aliases: `@/*` → `./src/*`
- Typia transformer for runtime type checking
- Strict mode enabled

**`components.json`**: Component configuration (shadcn/ui)

### Secrets Handling

- Environment variables stored in `.env.local` (not committed)
- Public variables prefixed with `NEXT_PUBLIC_`
- Server-side variables accessed via `process.env`
- Supabase keys are public (anon key) and private (service role)

---

## 8. Setup & Installation

### Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **Yarn**: Package manager
- **Supabase Account**: Database and auth
- **Google Cloud Account**: Maps API key
- **Mux Account**: Video streaming (optional)

### Installation Steps

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd geotag
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your keys
   ```

4. **Run development server**

   ```bash
   yarn dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

### Build & Production

**Build:**

```bash
yarn build
```

**Start production server:**

```bash
yarn start
```

**Docker (if configured):**

```bash
docker-compose up
```

---

## 9. Scripts & Commands

### Available Scripts

**`yarn dev`**: Start development server

- Runs Next.js dev server on port 3000
- Hot module replacement enabled
- TypeScript type checking

**`yarn build`**: Build for production

- Creates optimized production build
- Generates static pages where possible
- Type checks and validates

**`yarn start`**: Start production server

- Serves production build
- Requires `yarn build` first

---

## 10. Security Considerations

### Authentication / Authorization

**Authentication:**

- Server-side session management via HTTP-only cookies
- User data stored in encrypted cookie
- Login via server action validates credentials

**Authorization:**

- Role-based access control (Admin, Manager, Surveyor)
- Route protection via middleware/checks
- Data filtering based on user role

**Role Hierarchy:**

- **Admin**: Full access, user management
- **Manager**: Access to own + team member surveys
- **Surveyor**: Access only to own surveys

---

## 11. Deployment

### Deployment Flow

**Recommended Platform**: Vercel (Next.js optimized)

1. **Connect Repository**: Link GitHub/GitLab
2. **Configure Environment Variables**: Add all required keys
3. **Build Settings**: Auto-detected (Next.js)
4. **Deploy**: Automatic on push to main branch

### Hosting Platform Assumptions

- **Vercel**: Serverless functions for API routes
- **Supabase**: Hosted PostgreSQL database
- **Mux**: Managed video streaming
- **Google Maps**: CDN-hosted API

## 12. Glossary

### Domain Terms

- **Survey**: A video recording session with associated GPS data
- **GPS Track**: Collection of GPS coordinates with timestamps
- **Route**: A predefined path or survey route
- **Asset**: Video asset in Mux platform
- **Playback ID**: Mux identifier for video streaming
- **HLS**: HTTP Live Streaming protocol for video delivery

### Technical Terms

- **SSR**: Server-Side Rendering
- **SSG**: Static Site Generation
- **RSC**: React Server Components
- **JSONB**: PostgreSQL JSON binary format
- **Webhook**: HTTP callback for event notifications
- **Zustand**: Lightweight state management library
- **TanStack Query**: Data fetching and caching library

---

## Additional Notes

### Database Schema (Inferred)

**Tables:**

- `surveys`: Survey metadata (id, name, state, gps_track_id, video_id, user_id)
- `videos`: Video information (id, name, url, mux_playback_id, survey_id)
- `gps_tracks`: GPS track data (id, name, location_data, duration)
- `users`: User accounts (user_id, username, email, role, manager_id)
- `assets`: Mux asset references (asset_id, video_id)

**Relationships:**

- `surveys.gps_track_id` → `gps_tracks.id`
- `surveys.video_id` → `videos.id`
- `surveys.user_id` → `users.user_id`
- `videos.survey_id` → `surveys.id`

---

**Last Updated**: Based on codebase analysis
**Version**: 0.1.0
