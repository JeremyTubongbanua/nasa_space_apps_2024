import os
import numpy as np
from netCDF4 import Dataset
from numpy.ma import masked_invalid

# Paths
base_dir = os.path.dirname(os.path.abspath(__file__))
nc_dir = os.path.join(base_dir, '.')  # Directory containing .nc files

# Function to print data summary
def print_data_summary(variable_name, data):
    total_elements = data.size
    valid_elements = np.count_nonzero(~data.mask)  # Count non-masked (valid) elements
    invalid_elements = total_elements - valid_elements

    print(f"Variable: {variable_name}")
    print(f"Shape: {data.shape}")
    print(f"Total Elements: {total_elements}")
    print(f"Valid Elements: {valid_elements}")
    print(f"Invalid/Masked Elements: {invalid_elements}")
    print(f"Min: {np.min(data)} (excluding masked)")
    print(f"Max: {np.max(data)} (excluding masked)")
    print(f"Mean: {np.mean(data)} (excluding masked)")
    print(f"Sample data (first 5 non-masked elements): {data.compressed()[:5]}")
    print("-" * 50)

# Iterate through each .nc file in the nc directory
for filename in os.listdir(nc_dir):
    if filename.endswith('.nc'):
        nc_path = os.path.join(nc_dir, filename)

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

            # Print summaries of the data
            print(f"File: {filename}")
            print_data_summary('Longitude', longitudes)
            print_data_summary('Latitude', latitudes)
            print_data_summary('Water Surface Elevation', water_surface_elevation)

        except KeyError as e:
            print(f"Error reading variables from {filename}: {e}")
        finally:
            # Close the NetCDF file
            nc_file.close()
