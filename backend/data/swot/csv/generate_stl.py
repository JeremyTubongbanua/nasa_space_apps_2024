import csv
import numpy as np
from stl import mesh
import argparse
from scipy.spatial import Delaunay, ConvexHull
import sys
import os

def load_csv_data(csv_file, lng, lat):
    """Loads data from a CSV file and finds the closest points around the provided longitude and latitude."""
    lons, lats, water_levels = [], [], []

    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                lon = float(row['Longitude'])
                lat_val = float(row['Latitude'])
                water_level = float(row['Water_Level'])
            except KeyError as e:
                raise ValueError(f"KeyError: {e}. Available keys are: {list(row.keys())}")

            # Calculate the distance to the provided longitude/latitude
            distance = np.sqrt((lon - lng) ** 2 + (lat_val - lat) ** 2)

            # Append points if they are close (you can adjust this distance threshold as needed)
            if distance < 0.1:  # You can tune this threshold for your data
                lons.append(lon)
                lats.append(lat_val)
                water_levels.append(water_level)

    return lons, lats, water_levels

def generate_stl(csv_files, lng, lat, output_stl):
    """Generates a single STL file by merging data from multiple CSV files based on proximity to a point."""
    
    all_lons, all_lats, all_water_levels = [], [], []

    # Load and merge data from all CSV files
    for csv_file in csv_files:
        lons, lats, water_levels = load_csv_data(csv_file, lng, lat)
        all_lons.extend(lons)
        all_lats.extend(lats)
        all_water_levels.extend(water_levels)

    # Print the total number of data points and the number after filtering
    print(f"Total data points loaded from all CSV files: {len(all_lons)}")

    # Check if enough data points were loaded
    if len(all_lons) < 4:
        raise ValueError(f"Not enough data points ({len(all_lons)}) near the specified location to perform triangulation.")

    # Convert lists to NumPy arrays
    all_lons = np.array(all_lons)
    all_lats = np.array(all_lats)
    all_water_levels = np.array(all_water_levels)

    # Normalize coordinates and water levels
    x_normalized = (all_lons - np.min(all_lons)) / (np.max(all_lons) - np.min(all_lons)) * 150
    y_normalized = (all_lats - np.min(all_lats)) / (np.max(all_lats) - np.min(all_lats)) * 150

    if np.max(all_water_levels) - np.min(all_water_levels) == 0:
        z_normalized = np.zeros_like(all_water_levels)
    else:
        z_normalized = (all_water_levels - np.min(all_water_levels)) / (np.max(all_water_levels) - np.min(all_water_levels)) * 30

    # Prepare points for triangulation
    points2D = np.vstack((x_normalized, y_normalized)).T

    # Check for colinear points
    if np.linalg.matrix_rank(points2D - points2D[0]) < 2:
        raise ValueError("Data points are colinear. Cannot perform Delaunay triangulation.")
    
    # Perform Delaunay triangulation
    tri = Delaunay(points2D)

    # Create faces using the triangulation
    faces = []
    for simplex in tri.simplices:
        i, j, k = simplex
        v0 = [x_normalized[i], y_normalized[i], z_normalized[i]]
        v1 = [x_normalized[j], y_normalized[j], z_normalized[j]]
        v2 = [x_normalized[k], y_normalized[k], z_normalized[k]]
        faces.append([v0, v1, v2])

    # --- Add Side Walls and Base to Create Volume ---
    
    # Find the convex hull of the set of points to get the boundary edges
    hull = ConvexHull(points2D)
    boundary_indices = hull.vertices
    num_boundary_points = len(boundary_indices)
    
    # Create side wall faces
    for i in range(num_boundary_points):
        idx_current = boundary_indices[i]
        idx_next = boundary_indices[(i + 1) % num_boundary_points]

        # Top vertices (from the terrain surface)
        v_top_current = [x_normalized[idx_current], y_normalized[idx_current], z_normalized[idx_current]]
        v_top_next = [x_normalized[idx_next], y_normalized[idx_next], z_normalized[idx_next]]

        # Bottom vertices (at z = 0)
        v_bottom_current = [x_normalized[idx_current], y_normalized[idx_current], 0]
        v_bottom_next = [x_normalized[idx_next], y_normalized[idx_next], 0]

        # Create two triangles for each side wall quad
        faces.append([v_top_current, v_bottom_current, v_bottom_next])
        faces.append([v_top_current, v_bottom_next, v_top_next])

    # Create base faces (fill the bottom)
    # Triangulate the boundary points projected onto z = 0
    base_points2D = points2D[boundary_indices]
    base_tri = Delaunay(base_points2D)

    for simplex in base_tri.simplices:
        i, j, k = boundary_indices[simplex]
        v0 = [x_normalized[i], y_normalized[i], 0]
        v1 = [x_normalized[j], y_normalized[j], 0]
        v2 = [x_normalized[k], y_normalized[k], 0]
        faces.append([v0, v1, v2])

    # --- End of Volume Addition ---

    # Generate the 3D mesh object
    terrain_mesh = mesh.Mesh(np.zeros(len(faces), dtype=mesh.Mesh.dtype))
    for idx, face in enumerate(faces):
        terrain_mesh.vectors[idx] = np.array(face)

    # Save the mesh to STL file
    terrain_mesh.save(output_stl)
    print(f"STL file saved to {output_stl}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate 3D printable STL from CSV')
    parser.add_argument('--csv_files', type=str, nargs='+', required=True, help='List of CSV files')
    parser.add_argument('--lng', type=float, required=True, help='Longitude of the point')
    parser.add_argument('--lat', type=float, required=True, help='Latitude of the point')
    parser.add_argument('--output_stl', type=str, required=True, help='Output STL file name')

    args = parser.parse_args()
    try:
        generate_stl(args.csv_files, args.lng, args.lat, args.output_stl)
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)
