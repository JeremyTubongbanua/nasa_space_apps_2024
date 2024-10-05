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
csv_dir = os.path.join(base_dir, 'csv')

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

# Endpoint to generate STL from bounding box
@app.route('/swot/generate_stl', methods=['POST'])
def generate_stl():
    # Get the bounding box from the request
    data = request.json
    west = data.get('west')
    east = data.get('east')
    south = data.get('south')
    north = data.get('north')

    if not (west and east and south and north):
        return abort(400, description="Bounding box parameters are required (west, east, south, north)")

    # Correct path to the CSV file
    csv_file = os.path.join(base_dir, 'data', 'swot', 'csv', 'SWOT_L2_HR_Raster_100m_UTM17T_N_x_x_x_018_076_039F_20240712T145120_20240712T145141_PIC0_01.csv')
    
    # Correct path for the output STL
    output_stl = os.path.join(base_dir, 'data', 'swot', 'csv', 'generated_terrain.stl')

    # Path to the generate_stl.py script
    script_path = os.path.join(base_dir, 'data', 'swot', 'csv', 'generate_stl.py')

    # Run the STL generation script with the corrected paths
    command = ['python3', script_path, '--csv_file', csv_file, '--west', str(west), '--east', str(east),
               '--south', str(south), '--north', str(north), '--output_stl', output_stl]

    try:
        print(f"Running command: {command}")
        subprocess.run(command, check=True)
        print(f"STL file generated: {output_stl}")
    except subprocess.CalledProcessError as e:
        print(f"Error generating STL: {e}")
        return abort(500, description="Error generating STL")

    # Check if the STL file exists before serving it
    if not os.path.exists(output_stl):
        print(f"STL file not found at: {output_stl}")
        return abort(500, description="STL file was not generated")

    # Serve the generated STL file for download
    return send_file(output_stl, as_attachment=True, download_name='terrain.stl', mimetype='application/sla')





if __name__ == '__main__':
    # Enable debugging, auto-restart the server if code changes
    app.run(port=5001, debug=True)
