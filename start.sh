#!/bin/sh
npx kill-port 3000 8080 3001 4200 5200
# Function to handle termination
terminate() {
  echo "Terminating all processes..."
  kill $NPM1_PID $NPM2_PID $NPM_PID3 $SQLITE_PID
  wait $NPM1_PID $NPM2_PID $NPM_PID3 $SQLITE_PID 2>/dev/null
  echo "All processes terminated."
  exit 0
}

# Trap the termination signals
trap terminate INT TERM

# Navigate to the types project and start it
cd ./shared-types/
npm run watch &
$NPM_PID3=$!
echo "Started the Shared-Types project"

# Navigate to the first npm project and start it
cd ../app/
npm run two &
NPM1_PID=$!
echo "Started YAIT with PID $NPM1_PID"

# Navigate to the second npm project and start it
cd ../signal-server/
npm start &
NPM2_PID=$!
echo "Started Signal Server with PID $NPM2_PID"

# Start the SQLite database
sqlite3 ./database/myTestDatabase.db < ./database/schema.sql &
SQLITE_PID=$!
echo "Started SQLite with PID $SQLITE_PID"

# Wait for all background processes
wait $NPM1_PID $NPM2_PID $NPM_PID3 $SQLITE_PID
npx kill-port 3000 8080 3001 4200 5200
