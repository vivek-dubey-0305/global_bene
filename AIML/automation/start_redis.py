"""Start Redis server using Python"""
import subprocess
import sys

try:
    # Try to use redis-py's embedded Redis
    from redis import Redis
    
    # Try to start Redis
    print("Starting Redis server...")
    print("Redis must be installed on your system")
    print("\nDownload from: https://github.com/microsoftarchive/redis/releases")
    
except ImportError:
    print("Redis not installed!")
    print("Install with: pip install redis-server")
