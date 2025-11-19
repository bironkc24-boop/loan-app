#!/bin/bash

# Script to create auth users via API calls
# Make sure the backend is running on localhost:3000

echo "Creating borrower user..."
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mhel7881@gmail.com",
    "password": "mhel123",
    "full_name": "Borrower User",
    "accepted_terms": true,
    "terms_version": "1.0"
  }'

echo -e "\n\nCreating admin user..."
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kcbiron79@gmail.com",
    "password": "almonte17",
    "full_name": "Admin User",
    "accepted_terms": true,
    "terms_version": "1.0"
  }'

echo -e "\n\nUsers created. Now run diagnostic_users.sql to get UUIDs, then update manual_users_insert.sql"