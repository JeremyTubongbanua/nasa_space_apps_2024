from flask import Flask, jsonify, request, send_file, abort
import os
import json

app = Flask(__name__)

# Base directory setup
base_dir = os.path.dirname(os.path.abspath(__file__))
elevation_dir = os.path.join(base_dir, 'data', 'elevation')
water_level_dir = os.path.join(base_dir, 'data', 'water-level')
swot_dir = os.path.join(base_dir, 'data', 'swot')  # Added SWOT directory

# Load JSON locations
def load_locations(directory):
    location_file = os.path.join(directory, 'locations.json')
    if os.path.exists(location_file):
        with open(location_file, 'r') as file:
            return json.load(file)
    return []

# Load elevation, water-level, and swot locations
elevation_locations = load_locations(elevation_dir)
water_level_locations = load_locations(water_level_dir)
swot_locations = load_locations(swot_dir)  # Load SWOT locations

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
        return send_file(image_path, mimetype='image/png')
    return abort(404, description="Image not found")

# Common function to serve JSON data (bounding boxes)
def serve_json(locations):
    return jsonify(locations)

# Common function to get longitude and latitude from image name
def get_coordinates(locations, name):
    if not name:
        return abort(400, description="Image name is required")
    for loc in locations:
        if loc['image'] == f"{name}.png":
            return jsonify(loc['bounding_box'])
    return abort(404, description="Coordinates not found")

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

if __name__ == '__main__':
    app.run(port=5001)
