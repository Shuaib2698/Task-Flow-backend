#!/bin/sh
set -e

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
exec npm start