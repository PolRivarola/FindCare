"""
Script to check database connection and provide troubleshooting options
Run with: python check_db_connection.py
"""
import os
import sys
import django
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
import socket

def check_dns(hostname):
    """Check if hostname can be resolved"""
    try:
        socket.gethostbyname(hostname)
        return True
    except socket.gaierror:
        return False

def main():
    print("=" * 70)
    print("Database Connection Diagnostic")
    print("=" * 70)
    
    # Check DATABASE_URL
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("\n✅ DATABASE_URL is not set - will use SQLite (local development)")
        print(f"   Database: {settings.DATABASES['default']['NAME']}")
        return
    
    print(f"\n📋 DATABASE_URL is set")
    
    # Extract hostname from DATABASE_URL
    try:
        # Parse DATABASE_URL format: postgres://user:pass@host:port/dbname
        if "://" in database_url:
            parts = database_url.split("://")[1]
            if "@" in parts:
                host_part = parts.split("@")[1]
                hostname = host_part.split("/")[0].split(":")[0]
            else:
                hostname = "unknown"
        else:
            hostname = "unknown"
        
        print(f"   Hostname: {hostname}")
        
        # Check DNS resolution
        print(f"\n🔍 Checking DNS resolution...")
        if check_dns(hostname):
            print(f"   ✅ DNS resolution successful")
        else:
            print(f"   ❌ DNS resolution FAILED")
            print(f"\n   Possible causes:")
            print(f"   1. Internet connection issue")
            print(f"   2. Supabase project might be paused or deleted")
            print(f"   3. Incorrect DATABASE_URL")
            print(f"   4. DNS server issue")
            
    except Exception as e:
        print(f"   ⚠️  Could not parse DATABASE_URL: {e}")
    
    # Check database configuration
    db_config = settings.DATABASES['default']
    print(f"\n📊 Current Database Configuration:")
    print(f"   Engine: {db_config.get('ENGINE', 'Not set')}")
    print(f"   Name: {db_config.get('NAME', 'Not set')}")
    print(f"   Host: {db_config.get('HOST', 'Not set')}")
    print(f"   Port: {db_config.get('PORT', 'Not set')}")
    print(f"   User: {db_config.get('USER', 'Not set')}")
    
    # Test connection
    print(f"\n🔌 Testing database connection...")
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            print(f"   ✅ Connection successful!")
    except Exception as e:
        print(f"   ❌ Connection failed: {str(e)}")
        print(f"\n💡 Solutions:")
        print(f"   1. Use SQLite for local development:")
        print(f"      - Remove or comment out DATABASE_URL in .env file")
        print(f"      - Or unset it: unset DATABASE_URL (Linux/Mac) or")
        print(f"        $env:DATABASE_URL=$null (PowerShell)")
        print(f"   2. Fix Supabase connection:")
        print(f"      - Check your Supabase project is active")
        print(f"      - Verify DATABASE_URL in .env file is correct")
        print(f"      - Check internet connectivity")
        print(f"   3. Test connection manually:")
        print(f"      - Run: python test_db_connection.py")
    
    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()

