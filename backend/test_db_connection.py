"""
Script to test database connection to Supabase/PostgreSQL
Run with: python test_db_connection.py
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

from django.db import connection
from django.conf import settings

def test_connection():
    """Test database connection"""
    print("=" * 60)
    print("Testing Database Connection")
    print("=" * 60)
    
    # Show database configuration (without password)
    db_config = settings.DATABASES['default']
    print(f"\nDatabase Engine: {db_config.get('ENGINE', 'Not set')}")
    print(f"Database Name: {db_config.get('NAME', 'Not set')}")
    print(f"Database Host: {db_config.get('HOST', 'Not set')}")
    print(f"Database Port: {db_config.get('PORT', 'Not set')}")
    print(f"Database User: {db_config.get('USER', 'Not set')}")
    print(f"SSL Mode: {db_config.get('OPTIONS', {}).get('sslmode', 'Not set')}")
    
    # Test connection
    try:
        print("\n" + "-" * 60)
        print("Attempting to connect to database...")
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✅ Connection successful!")
            print(f"\nPostgreSQL Version: {version}")
            
            # Get database name
            cursor.execute("SELECT current_database();")
            db_name = cursor.fetchone()[0]
            print(f"Current Database: {db_name}")
            
            # Get current user
            cursor.execute("SELECT current_user;")
            db_user = cursor.fetchone()[0]
            print(f"Current User: {db_user}")
            
            # Get current time
            cursor.execute("SELECT NOW();")
            db_time = cursor.fetchone()[0]
            print(f"Server Time: {db_time}")
            
            # List all tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            print(f"\n📊 Tables in database ({len(tables)} total):")
            for table in tables[:10]:  # Show first 10
                print(f"  - {table[0]}")
            if len(tables) > 10:
                print(f"  ... and {len(tables) - 10} more")
                
        print("\n" + "=" * 60)
        print("✅ Database connection test PASSED!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ Connection failed!")
        print(f"Error: {str(e)}")
        print(f"Error Type: {type(e).__name__}")
        print("\n" + "=" * 60)
        print("❌ Database connection test FAILED!")
        print("=" * 60)
        print("\nTroubleshooting tips:")
        print("1. Check that DATABASE_URL is set in your .env file")
        print("2. Verify the connection string format is correct")
        print("3. Ensure your Supabase database is accessible")
        print("4. Check firewall/network settings")
        print("5. Verify database credentials are correct")
        return False

if __name__ == "__main__":
    test_connection()

