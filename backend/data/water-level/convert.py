import os
import json
from osgeo import gdal

# Paths
base_dir = os.path.dirname(os.path.abspath(__file__))  # Directory containing the script
tif_dir = base_dir  # TIF files are in the same directory as this script
png_dir = os.path.join(base_dir, 'pngs')  # PNG output directory
location_file = os.path.join(base_dir, 'locations.json')  # Location of the JSON output

# Create png directory if it doesn't exist
if not os.path.exists(png_dir):
    os.makedirs(png_dir)

# Initialize an empty list for storing image locations
image_locations = []

# Iterate through each .tif file in the directory
for filename in os.listdir(tif_dir):
    if filename.endswith('.tif'):
        # Full path for input .tif file and output .png file
        tif_path = os.path.join(tif_dir, filename)
        png_path = os.path.join(png_dir, filename.replace('.tif', '.png'))

        # Open the TIF file using GDAL
        ds = gdal.Open(tif_path)

        # Get the georeference information (bounding box)
        transform = ds.GetGeoTransform()
        minx = transform[0]
        maxy = transform[3]
        maxx = minx + transform[1] * ds.RasterXSize
        miny = maxy + transform[5] * ds.RasterYSize

        # Create a dictionary for the image and bounding box info
        image_info = {
            "image": filename.replace('.tif', '.png'),
            "bounding_box": {
                "southwest": {
                    "lat": miny,
                    "lng": minx
                },
                "northeast": {
                    "lat": maxy,
                    "lng": maxx
                }
            }
        }

        # Append this image info to the list
        image_locations.append(image_info)

        # Use GDAL to convert the .tif to .png
        gdal.Translate(png_path, ds, format='PNG')

# Write the bounding box info to a JSON file
with open(location_file, 'w') as json_file:
    json.dump(image_locations, json_file, indent=4)

print(f"Conversion complete. PNGs saved in '{png_dir}', and 'locations.json' created at '{location_file}'.")
