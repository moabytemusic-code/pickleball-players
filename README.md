# Pickleball Players 🥒🎾

The ultimate directory for finding pickleball courts, tournaments, and players.

## Features
- **Smart Court Search**: Find courts by city, name, or amenities.
- **Verified Listings**: Badge system for verified venue data.
- **De-Duplication Engine**: Python pipeline to ingest and merge data intelligently.
- **Interactive Maps**: (Coming in M5).

## Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4.
- **Backend / DB**: Supabase (PostgreSQL + PostGIS).
- **Ingestion**: Python, Selenium, Pandas.

## Setup

1. **Environment Variables**  
   Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

2. **Database Setup**  
   Run the SQL script in Supabase SQL Editor:
   - Copy content from `database/init_db.sql`.

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Dev Server**
   ```bash
   npm run dev
   ```

5. **Run Ingestion (Python)**
   ```bash
   cd pipelines
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   # Set SUPABASE_URL and SUPABASE_SERVICE_KEY in environment or custom_env.py
   python ingest_pilot.py
   ```

## Project Structure
- `/app`: Next.js App Router (Frontend).
- `/components`: UI Components.
- `/database`: SQL Schemas and Logic.
- `/pipelines`: Python scripts for data ingestion.
