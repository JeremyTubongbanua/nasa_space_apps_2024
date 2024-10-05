from flask import Flask, jsonify, request, send_file, abort
import os
import json

app = Flask(__name__)

# Base directory setup
base_dir = os.path.dirname(os.path.abspath(__file__))
elevation_dir = os.path.join(base_dir, 'data', 'elevation')
water_level_dir = os.path.join(base_dir, 'data', 'water-level')

# Load JSON locations
def load_locations(directory):
    location_file = os.path.join(directory, 'locations.json')
    if os.path.exists(location_file):
        with open(location_file, 'r') as file:
            return json.load(file)
    return []

# Load both elevation and water-level locations
elevation_locations = load_locations(elevation_dir)
water_level_locations = load_locations(water_level_dir)

# Helper function to get image path
def get_image_path(directory, name):
    png_path = os.path.join(directory, 'png', f"{name}.png")
    if os.path.exists(png_path):
        return png_path
    return None

# Endpoint to get water level image by name
@app.route('/water-level/get_image', methods=['GET'])
def get_water_level_image():
    name = request.args.get('name')
    if not name:
        return abort(400, description="Image name is required")

    image_path = get_image_path(water_level_dir, name)
    if image_path:
        return send_file(image_path, mimetype='image/png')
    return abort(404, description="Image not found")

# Endpoint to get elevation image by name
@app.route('/elevation/get_image', methods=['GET'])
def get_elevation_image():
    name = request.args.get('name')
    if not name:
        return abort(400, description="Image name is required")

    image_path = get_image_path(elevation_dir, name)
    if image_path:
        return send_file(image_path, mimetype='image/png')
    return abort(404, description="Image not found")

# Endpoint to get water level JSON bounding box data
@app.route('/water-level/get_json', methods=['GET'])
def get_water_level_json():
    return jsonify(water_level_locations)

# Endpoint to get elevation JSON bounding box data
@app.route('/elevation/get_json', methods=['GET'])
def get_elevation_json():
    return jsonify(elevation_locations)

# Endpoint to get water level longitude/latitude
@app.route('/water-level/get_longitude_latitude', methods=['GET'])
def get_water_level_coordinates():
    name = request.args.get('name')
    for loc in water_level_locations:
        if loc['image'] == f"{name}.png":
            return jsonify(loc['bounding_box'])
    return abort(404, description="Coordinates not found")

# Endpoint to get elevation longitude/latitude
@app.route('/elevation/get_longitude_latitude', methods=['GET'])
def get_elevation_coordinates():
    name = request.args.get('name')
    for loc in elevation_locations:
        if loc['image'] == f"{name}.png":
            return jsonify(loc['bounding_box'])
    return abort(404, description="Coordinates not found")

if __name__ == '__main__':
    app.run(port=5001)
