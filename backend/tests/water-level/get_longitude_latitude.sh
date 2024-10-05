#!/bin/bash
# test_get_water_level_longitude_latitude.sh
IMAGE_NAME=$1
if [ -z "$IMAGE_NAME" ]; then
  echo "Usage: ./test_get_water_level_longitude_latitude.sh <image_name_without_extension>"
  exit 1
fi
curl -X GET "http://localhost:5001/water-level/get_longitude_latitude?name=$IMAGE_NAME" -H "Content-Type: application/json"
