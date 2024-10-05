import os
import json
from osgeo import gdal
from pyproj import Proj, transform as proj_transform  # Renamed the pyproj transform function

# Paths
base_dir = os.path.dirname(os.path.abspath(__file__))  # Directory containing the script
tif_dir = os.path.join(base_dir, 'tif')  # Directory containing .tif files
png_dir = os.path.join(base_dir, 'png')  # Directory for .png files
csv_dir = os.path.join(base_dir, 'csv')  # Directory for .csv files
location_file = os.path.join(base_dir, 'locations.json')  # Output JSON file

# Define resolution reduction factor (increase this to reduce the number of points)
sampling_interval = 10  # Process every 10th pixel (can be adjusted for more or less detail)

# Create output directories if they don't exist
for dir_path in [csv_dir, png_dir]:
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)

# Initialize an empty list for storing image locations
image_locations = []

# UTM to Lat/Lng conversion (adjust UTM zone accordingly)
utm_proj = Proj(proj='utm', zone=17, datum='WGS84')  # UTM zone should match your data
wgs84_proj = Proj(proj='latlong', datum='WGS84')

# Iterate through each .tif file in the tif directory
for filename in os.listdir(tif_dir):
    if filename.endswith('.tif'):  # Only process TIF files
        base_name = filename[:-4]  # Remove '.tif' extension
        tif_path = os.path.join(tif_dir, filename)
        png_path = os.path.join(png_dir, base_name + '.png')
        csv_path = os.path.join(csv_dir, base_name + '.csv')

        # Open the TIF file using GDAL
        ds = gdal.Open(tif_path)
        band = ds.GetRasterBand(1)
        geo_transform = ds.GetGeoTransform()  # Renamed to geo_transform
        x_res = ds.RasterXSize
        y_res = ds.RasterYSize
        no_data_value = band.GetNoDataValue()

        # Get the georeference information (bounding box in UTM)
        minx = geo_transform[0]
        maxy = geo_transform[3]
        maxx = minx + geo_transform[1] * ds.RasterXSize
        miny = maxy + geo_transform[5] * ds.RasterYSize

        # Convert the bounding box from UTM to lat/lng
        minx_lon, miny_lat = proj_transform(utm_proj, wgs84_proj, minx, miny)
        maxx_lon, maxy_lat = proj_transform(utm_proj, wgs84_proj, maxx, maxy)

        # Debugging: Print the converted coordinates
        print(f"Bounding Box for {filename}:")
        print(f"Southwest (lat, lng): ({miny_lat}, {minx_lon})")
        print(f"Northeast (lat, lng): ({maxy_lat}, {maxx_lon})")

        # Generate the CSV file with longitude, latitude, and elevation
        with open(csv_path, 'w') as csv_file:
            csv_file.write("longitude,latitude,elevation\n")
            for i in range(0, y_res, sampling_interval):  # Skip rows by sampling_interval
                for j in range(0, x_res, sampling_interval):  # Skip columns by sampling_interval
                    x_coord = geo_transform[0] + j * geo_transform[1] + i * geo_transform[2]
                    y_coord = geo_transform[3] + j * geo_transform[4] + i * geo_transform[5]
                    elevation = band.ReadAsArray(j, i, 1, 1)[0][0]
                    if elevation != no_data_value:
                        lon, lat = proj_transform(utm_proj, wgs84_proj, x_coord, y_coord)
                        csv_file.write(f"{lon},{lat},{elevation}\n")

        # Create a dictionary for the image and bounding box info
        image_info = {
            "name": base_name,
            "csv": f"./csv/{base_name}.csv",
            "image": f"./png/{base_name}.png",
            "tif": f"./tif/{filename}",
            "bounding_box": {
                "southwest": {
                    "lat": miny_lat,
                    "lng": minx_lon
                },
                "northeast": {
                    "lat": maxy_lat,
                    "lng": maxx_lon
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

print(f"Conversion complete. PNGs saved in '{png_dir}', CSVs saved in '{csv_dir}', and 'locations.json' created at '{location_file}'.")
