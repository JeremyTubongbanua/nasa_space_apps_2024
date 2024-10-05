import os
import csv
import json
import numpy as np
import matplotlib.pyplot as plt
from netCDF4 import Dataset
from numpy.ma import masked_invalid

# Paths
base_dir = os.path.dirname(os.path.abspath(__file__))
nc_dir = os.path.join(base_dir, 'nc')  # Directory containing .nc files
png_dir = os.path.join(base_dir, 'png')  # Directory for .png files
csv_dir = os.path.join(base_dir, 'csv')  # Directory for .csv files
location_file = os.path.join(base_dir, 'locations.json')  # Output JSON file

# Create png and csv directories if they don't exist
if not os.path.exists(png_dir):
    os.makedirs(png_dir)

if not os.path.exists(csv_dir):
    os.makedirs(csv_dir)

# Initialize an empty list for storing image locations
image_locations = []

# Iterate through each .nc file in the nc directory
for filename in os.listdir(nc_dir):
    if filename.endswith('.nc'):
        nc_path = os.path.join(nc_dir, filename)
        png_path = os.path.join(png_dir, filename.replace('.nc', '.png'))
        csv_path = os.path.join(csv_dir, filename.replace('.nc', '.csv'))

        # Open the NetCDF file
        nc_file = Dataset(nc_path, 'r')

        try:
            longitudes = nc_file.variables['longitude'][:]
            latitudes = nc_file.variables['latitude'][:]
            water_surface_elevation = nc_file.variables['wse'][:]

            # Mask invalid data (very large or NaN values)
            longitudes = masked_invalid(longitudes)
            latitudes = masked_invalid(latitudes)
            water_surface_elevation = masked_invalid(water_surface_elevation)

            # Downsample the data for faster processing
            downsample_factor = 10  # Adjust this number to balance speed vs quality
            longitudes_downsampled = longitudes[::downsample_factor, ::downsample_factor]
            latitudes_downsampled = latitudes[::downsample_factor, ::downsample_factor]
            water_surface_elevation_downsampled = water_surface_elevation[::downsample_factor, ::downsample_factor]

            # Only save valid (non-masked) data to CSV
            with open(csv_path, 'w', newline='') as csvfile:
                csvwriter = csv.writer(csvfile)
                # Write the header
                csvwriter.writerow(['Longitude', 'Latitude', 'Water_Level'])

                # Iterate over the water surface elevation array and corresponding lat/lon
                for i in range(longitudes_downsampled.shape[0]):
                    for j in range(latitudes_downsampled.shape[1]):
                        if not water_surface_elevation_downsampled.mask[i, j]:  # Only write non-masked data
                            csvwriter.writerow([longitudes_downsampled[i, j], latitudes_downsampled[i, j], water_surface_elevation_downsampled[i, j]])

            # Set up the figure without axes (good for map overlay)
            fig, ax = plt.subplots(figsize=(10, 6))

            # Plot the data as an image with longitude and latitude bounds (extent)
            im = ax.imshow(
                water_surface_elevation_downsampled,
                extent=(np.min(longitudes_downsampled), np.max(longitudes_downsampled), np.min(latitudes_downsampled), np.max(latitudes_downsampled)),
                cmap='viridis',
                origin='lower'
            )

            # Remove the axes for a clean overlay
            ax.set_axis_off()

            # Save the PNG with a transparent background
            plt.savefig(png_path, transparent=True, bbox_inches='tight', pad_inches=0)
            plt.close()

            # Create a dictionary for the image and bounding box info
            image_info = {
                "image": filename.replace('.nc', '.png'),
                "bounding_box": {
                    "southwest": {
                        "lat": np.min(latitudes_downsampled),
                        "lng": np.min(longitudes_downsampled)
                    },
                    "northeast": {
                        "lat": np.max(latitudes_downsampled),
                        "lng": np.max(longitudes_downsampled)
                    }
                }
            }

            # Append this image info to the list
            image_locations.append(image_info)

        except KeyError as e:
            print(f"Error reading variables from {filename}: {e}")

        # Close the NetCDF file
        nc_file.close()

# Write the bounding box info to a JSON file
with open(location_file, 'w') as json_file:
    json.dump(image_locations, json_file, indent=4)

print(f"Conversion complete. PNGs saved in '{png_dir}', CSVs saved in '{csv_dir}', and 'locations.json' created at '{location_file}'.")
