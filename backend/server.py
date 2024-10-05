from flask import Flask, jsonify, request, send_file, abort
import os
import json
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)

# Base directory setup
base_dir = os.path.dirname(os.path.abspath(__file__))
elevation_dir = os.path.join(base_dir, 'data', 'elevation')
water_level_dir = os.path.join(base_dir, 'data', 'water-level')
swot_dir = os.path.join(base_dir, 'data', 'swot')  # Added SWOT directory
csv_dir = os.path.join(swot_dir, 'csv')

# Load JSON locations
def load_locations(directory):
    location_file = os.path.join(directory, 'locations.json')
    if os.path.exists(location_file):
        with open(location_file, 'r') as file:
            return json.load(file)
    else:
        print(f"Warning: {location_file} not found.")
    return []

# Load elevation, water-level, and SWOT locations
elevation_locations = load_locations(elevation_dir)
water_level_locations = load_locations(water_level_dir)
swot_locations = load_locations(swot_dir)

# Helper function to get image path
def get_image_path(directory, name):
    if not name.endswith('.png'):
        name = f"{name}.png"

    png_path = os.path.join(directory, 'png', name)
    print(f"Looking for image at: {png_path}")  # Debug print
    if os.path.exists(png_path):
        return png_path
    return None

# Common function to serve images based on directory and name
def serve_image(directory, name):
    if not name:
        return abort(400, description="Image name is required")

    image_path = get_image_path(directory, name)
    if image_path:
        print(f"Serving image: {image_path}")
        return send_file(image_path, mimetype='image/png')

    print(f"Error: Image {name} not found in {directory}")
    return abort(404, description="Image not found")

# Common function to serve JSON data (bounding boxes)
def serve_json(locations):
    if not locations:
        return abort(404, description="No data available")
    return jsonify(locations)

# Common function to get longitude and latitude from image name
def get_coordinates(locations, name):
    if not name:
        return abort(400, description="Image name is required")

    for loc in locations:
        if loc['image'].endswith(f"{name}.png"):
            return jsonify(loc['bounding_box'])

    return abort(404, description="Coordinates not found for the specified image")

# Elevation endpoints
@app.route('/elevation/get_image', methods=['GET'])
def get_elevation_image():
    name = request.args.get('name')
    return serve_image(elevation_dir, name)

@app.route('/elevation/get_json', methods=['GET'])
def get_elevation_json():
    return serve_json(elevation_locations)

@app.route('/elevation/get_longitude_latitude', methods=['GET'])
def get_elevation_coordinates():
    name = request.args.get('name')
    return get_coordinates(elevation_locations, name)

# Water-level endpoints
@app.route('/water-level/get_image', methods=['GET'])
def get_water_level_image():
    name = request.args.get('name')
    return serve_image(water_level_dir, name)

@app.route('/water-level/get_json', methods=['GET'])
def get_water_level_json():
    return serve_json(water_level_locations)

@app.route('/water-level/get_longitude_latitude', methods=['GET'])
def get_water_level_coordinates():
    name = request.args.get('name')
    return get_coordinates(water_level_locations, name)

# SWOT endpoints
@app.route('/swot/get_image', methods=['GET'])
def get_swot_image():
    name = request.args.get('name')
    return serve_image(swot_dir, name)

@app.route('/swot/get_json', methods=['GET'])
def get_swot_json():
    return serve_json(swot_locations)

@app.route('/swot/get_longitude_latitude', methods=['GET'])
def get_swot_coordinates():
    name = request.args.get('name')
    return get_coordinates(swot_locations, name)

# Function to check if two bounding boxes intersect
def bounding_boxes_intersect(bbox1, bbox2):
    return not (
        bbox1['north'] < bbox2['southwest']['lat'] or
        bbox1['south'] > bbox2['northeast']['lat'] or
        bbox1['east'] < bbox2['southwest']['lng'] or
        bbox1['west'] > bbox2['northeast']['lng']
    )

# Function to check if a point is inside a bounding box
def is_point_in_bbox(lng, lat, bbox):
    return (
        bbox['southwest']['lng'] <= lng <= bbox['northeast']['lng'] and
        bbox['southwest']['lat'] <= lat <= bbox['northeast']['lat']
    )

import logging

# Initialize the logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.route('/swot/generate_stl', methods=['POST'])
def generate_stl():
    data = request.json

    # Log the incoming request data
    logger.info(f"Received POST request for STL generation with data: {data}")

    try:
        longitude = float(data.get('lng'))
        latitude = float(data.get('lat'))
        logger.info(f"Longitude: {longitude}, Latitude: {latitude}")
    except (TypeError, ValueError) as e:
        logger.error(f"Invalid longitude/latitude provided: {e}")
        return abort(400, description="Longitude and latitude are required and must be valid numbers (lng, lat)")

    if not (longitude and latitude):
        logger.warning("Longitude and latitude are missing from the request")
        return abort(400, description="Longitude and latitude are required (lng, lat)")

    # Check if the point is within any of the bounding boxes
    relevant_location = None
    for location in swot_locations:
        bbox = location['bounding_box']
        if is_point_in_bbox(longitude, latitude, bbox):
            relevant_location = location
            logger.info(f"Found relevant location: {relevant_location['name']}")
            break

    if not relevant_location:
        logger.warning(f"No relevant location found for longitude: {longitude}, latitude: {latitude}")
        return abort(404, description="No data available for the specified location.")

    csv_file_path = os.path.join(swot_dir, relevant_location['csv'])

    if not os.path.exists(csv_file_path):
        logger.error(f"CSV file not found for location: {relevant_location['name']} at path: {csv_file_path}")
        return abort(404, description="CSV file not found for the specified location.")

    output_stl = os.path.join(csv_dir, 'generated_terrain.stl')  # Output STL file

    # Prepare command to run generate_stl.py with the necessary arguments
    command = [
        'python3', os.path.join(csv_dir, 'generate_stl.py'),
        '--csv_files', csv_file_path,
        '--lng', str(longitude),
        '--lat', str(latitude),
        '--output_stl', output_stl
    ]

    try:
        logger.info(f"Running command: {' '.join(command)}")
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        if result.returncode == 0:
            logger.info(f"STL file successfully generated: {output_stl}")
            return send_file(output_stl, as_attachment=True, download_name='terrain.stl', mimetype='application/sla')
        else:
            logger.error(f"STL generation failed with error: {result.stderr}")
            return abort(500, description=f"Error generating STL: {result.stderr}")
    except subprocess.CalledProcessError as e:
        logger.error(f"STL generation process failed: {e.stderr}")
        return abort(500, description=f"STL generation failed: {e.stderr}")




if __name__ == '__main__':
    # Enable debugging, auto-restart the server if code changes
    app.run(port=5001, debug=True)
