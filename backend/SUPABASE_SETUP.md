# Supabase Connection Setup Guide

## IPv4 Compatibility Issue

If you're getting the error:
```
could not translate host name "db.lgngwgacdfnrjatfbhdb.supabase.co" to address: No such host is known.
```

This is likely because Supabase's **Direct Connection** is IPv6-only and your network is IPv4-only.

## Solution: Use Session Pooler

### Step 1: Get the Pooler Connection String

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Click on **"Pooler settings"** button (or switch to **"Session Pooler"** tab)
4. Select **"Transaction"** mode (recommended for Django)
5. Copy the connection string

The pooler connection string will look like:
```
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Or for session mode:
```
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### Step 2: Update Your .env File

Update your `DATABASE_URL` in the `.env` file to use the pooler connection string:

```env
# Old (Direct connection - IPv6 only, may not work)
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.lgngwgacdfnrjatfbhdb.supabase.co:5432/postgres

# New (Session Pooler - IPv4 compatible)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Important:** Replace:
- `[PROJECT_REF]` with your project reference (the long string in your original hostname)
- `[PASSWORD]` with your database password
- `[REGION]` with your Supabase region (e.g., `us-east-1`, `eu-west-1`, etc.)

### Step 3: Test the Connection

Run the migration command:
```powershell
cd backend
python manage.py migrate
```

Or test the connection:
```powershell
python test_db_connection.py
```

## Connection Modes Explained

### Transaction Mode (Port 6543) - Recommended for Django
- Best for serverless applications
- Each transaction gets its own connection
- Use this for Django applications

### Session Mode (Port 5432 with pooler)
- Maintains connection for the entire session
- Better for long-running applications
- Uses connection pooling

## Alternative: Use SQLite for Local Development

If you don't need PostgreSQL for local development, you can simply:

1. Remove or comment out `DATABASE_URL` in your `.env` file
2. Django will automatically use SQLite (configured in `settings.py`)

This is often the simplest solution for local development.

