#!/bin/bash
# test_get_elevation_image.sh
IMAGE_NAME=$1
if [ -z "$IMAGE_NAME" ]; then
  echo "Usage: ./test_get_elevation_image.sh <image_name>"
  exit 1
fi
curl -X GET "http://localhost:5001/elevation/get_image?name=$IMAGE_NAME" --output $IMAGE_NAME
