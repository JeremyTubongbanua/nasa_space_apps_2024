#!/bin/bash
# test_get_elevation_json.sh
curl -X GET http://localhost:5001/elevation/get_json -H "Content-Type: application/json"
