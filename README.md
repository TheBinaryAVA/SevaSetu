# SevaSetu Backend & Core Engine

SevaSetu is an AI-driven, decentralized community tracking ecosystem designed to identify, validate, and resolve urban infrastructure friction points through automated pipeline generation.

## 🚀 Architectural Blueprint

The platform decouples data ingestion from worker computation pipelines:

[Client Apps] -> [NGINX Reverse Proxy] -> [Node.js Gateway REST API]
                                                 |
                       +-------------------------+-------------------------+
                       |                         |                         |
               [PostgreSQL/PostGIS]       [Redis Geofence]          [Gemini AI Worker]
               (Persistent State)         (Proximity Buffers)      (Image Triage Pipeline)

## 🛠️ Prerequisites

Ensure the following environments are installed globally before configuring the core application:
- Node.js v18.x or higher
- Docker Desktop / Docker Compose
- Google Cloud SDK CLI configured with an active project billable account

## ⚙️ Local Development Setup

Follow these steps sequentially to provision your local development environment:

1. Clone the master repository and navigate into the backend module directory:
   $ git clone https://github.com/avanthikap/sevasetu-core.git
   $ cd sevasetu-core/backend

2. Initialize environment file configuration parameters:
   $ cp .env.example .env

3. Edit the `.env` file with your authorized provider infrastructure credentials:
   PORT=8080
   DATABASE_URL=postgresql://postgres:secret@localhost:5432/sevasetu?sslmode=disable
   REDIS_URL=redis://localhost:6379
   GEMINI_API_KEY=AIzaSyYourValidatedGeminiKeyHere
   GOOGLE_MAPS_SERVER_KEY=AIzaSyYourValidMapsPlatformKey

4. Launch the local containerized infrastructure stack (PostgreSQL with PostGIS and Redis):
   $ docker-compose up -d

5. Install package module dependencies and run database schema migrations:
   $ npm install
   $ npm run db:migrate

6. Execute the development startup script to boot the Express gateway:
   $ npm run dev

## 🔀 Core REST API Reference Specifications

### 1. File an Infrastructure Grievance
- **Endpoint:** `POST /api/v1/issues/report`
- **Payload Type:** `multipart/form-data`
- **Request Parameters:**
  - `image`: File (Binary payload stream)
  - `latitude`: Float (e.g., 13.0827)
  - `longitude`: Float (e.g., 80.2707)
- **Successful Response Structure (201 Created):**
```json
{
  "status": "success",
  "data": {
    "ticketId": "seva-9821-xo90",
    "status": "UNVERIFIED",
    "aiAnalysis": {
      "category": "Sanitation & Waste Management",
      "severity": "CRITICAL",
      "description": "Uncontrolled commercial garbage overflow obstructing public pedestrian walkways."
    },
    "location": {
      "type": "Point",
      "coordinates": [80.2707, 13.0827]
    }
  }
}
