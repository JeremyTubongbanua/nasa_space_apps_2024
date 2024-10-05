#!/bin/bash
# test_get_water_level_json.sh
curl -X GET http://localhost:5001/water-level/get_json -H "Content-Type: application/json"
