#!/bin/bash
# test_get_swot_json.sh
curl -X GET http://localhost:5001/swot/get_json -H "Content-Type: application/json"
