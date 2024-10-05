import numpy as np
from netCDF4 import Dataset

def extract_wse_data_from_nc(nc_file_path, bounding_box):
    nc_file = Dataset(nc_file_path, 'r')
    try:
        longitudes = nc_file.variables['longitude'][:]
        latitudes = nc_file.variables['latitude'][:]
        wse = nc_file.variables['wse'][:]

        wse = np.ma.masked_invalid(wse)

        lon_indices = np.where((longitudes >= bounding_box['west']) & (
            longitudes <= bounding_box['east']))[0]
        lat_indices = np.where((latitudes >= bounding_box['south']) & (
            latitudes <= bounding_box['north']))[0]

        region_wse = wse[np.ix_(lat_indices, lon_indices)]
        region_lons = longitudes[lon_indices]
        region_lats = latitudes[lat_indices]

        print("Extracted region WSE shape:", region_wse.shape)
        print("Extracted region longitude shape:", region_lons.shape)
        print("Extracted region latitude shape:", region_lats.shape)

        return region_wse, region_lons, region_lats

    finally:
        nc_file.close()

def analyze_downsampling(wse_data, lon_data, lat_data, resolution_factor=100):
    # Downsample the WSE, longitude, and latitude data uniformly
    min_size_lat = min(wse_data.shape[0], lat_data.shape[0])
    min_size_lon = min(wse_data.shape[1], lon_data.shape[1])

    wse_data_downsampled = wse_data[:min_size_lat:resolution_factor, :min_size_lon:resolution_factor]
    lon_data_downsampled = lon_data[:min_size_lon:resolution_factor]
    lat_data_downsampled = lat_data[:min_size_lat:resolution_factor]

    print(f"\nDownsampled WSE shape: {wse_data_downsampled.shape}")
    print(f"Downsampled longitude shape: {lon_data_downsampled.shape}")
    print(f"Downsampled latitude shape: {lat_data_downsampled.shape}")

    # Print a small sample of data for manual inspection
    print(f"\nSample WSE data (downsampled): {wse_data_downsampled[:5, :5]}")
    print(f"Sample longitude data (downsampled): {lon_data_downsampled[:5]}")
    print(f"Sample latitude data (downsampled): {lat_data_downsampled[:5]}")

    # Check for out-of-bound index scenarios
    num_rows, num_cols = wse_data_downsampled.shape
    print(f"\nNumber of rows (latitudes): {num_rows}, Number of columns (longitudes): {num_cols}")

# Provide the bounding box and the path to your .nc file here
bounding_box = {'north': 44.0, 'south': 43.5, 'east': -78.5, 'west': -79.0}
nc_file_path = '/Users/jeremytubongbanua/GitHub/nasa_space_apps_2024/backend/data/swot/nc/SWOT_L2_HR_Raster_250m_UTM17T_N_x_x_x_021_354_039F_20240923T032854_20240923T032915_PIC0_01.nc'

# Extract the data
region_wse, region_lons, region_lats = extract_wse_data_from_nc(nc_file_path, bounding_box)

# Analyze downsampling
analyze_downsampling(region_wse, region_lons, region_lats)
