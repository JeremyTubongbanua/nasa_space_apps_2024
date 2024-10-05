#!/bin/bash

# Define the server URL and endpoint
SERVER_URL="http://localhost:5001/create"

# Use a more reliable way to define the JSON data with the updated bounding box coordinates
bounding_box_json=$(cat <<EOF
{
  "bounding_box": {
    "north": 43.54329,
    "south": 43.30613,
    "east": -79.10476,
    "west": -79.49159
  }
}
EOF
)

# Send a POST request to the /create endpoint
# The response will be saved as water_surface_elevation.stl
curl -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -d "$bounding_box_json" \
  --output water_surface_elevation.stl

# Check if the STL file was downloaded successfully
if [ -f "water_surface_elevation.stl" ]; then
  echo "STL file downloaded successfully: water_surface_elevation.stl"
else
  echo "Failed to download the STL file"
fi
