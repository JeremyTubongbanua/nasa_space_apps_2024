#!/bin/bash
#exampkle ./generate_stl.sh -80.1 -79.9 43.08 43.12
# generate_stl.sh
WEST=$1
EAST=$2
SOUTH=$3
NORTH=$4

if [ -z "$WEST" ] || [ -z "$EAST" ] || [ -z "$SOUTH" ] || [ -z "$NORTH" ]; then
  echo "Usage: ./generate_stl.sh <west> <east> <south> <north>"
  exit 1
fi

curl -X POST "http://localhost:5001/swot/generate_stl" \
  -H "Content-Type: application/json" \
  -d '{"west": '"$WEST"', "east": '"$EAST"', "south": '"$SOUTH"', "north": '"$NORTH"'}' \
  --output generated_terrain.stl

if [ $? -eq 0 ]; then
  echo "STL file has been generated and saved as generated_terrain.stl"
else
  echo "Failed to generate STL file"
fi
