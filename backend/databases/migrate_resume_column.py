"""
Database Migration Script
Adds resume_json column to User table
"""

import sqlite3
import os

# Get the path to the database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'users.db')

def migrate_database():
    """Add resume_json column to User table if it doesn't exist"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(user)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'resume_json' not in columns:
            print("Adding resume_json column to User table...")
            cursor.execute("ALTER TABLE user ADD COLUMN resume_json TEXT")
            conn.commit()
            print("Successfully added resume_json column!")
        else:
            print("resume_json column already exists. No migration needed.")
        
        conn.close()
        return True
    except Exception as e:
        print(f"Error during migration: {e}")
        return False

if __name__ == "__main__":
    print("Starting database migration...")
    success = migrate_database()
    if success:
        print("Migration completed successfully!")
    else:
        print("Migration failed!")
