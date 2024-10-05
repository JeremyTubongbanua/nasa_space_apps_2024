import csv
import numpy as np
from stl import mesh
import argparse
from scipy.spatial import Delaunay
from scipy.spatial import ConvexHull
import sys

def generate_stl(csv_file, west, east, south, north, output_stl):
    # Load CSV data
    all_lons, all_lats = [], []
    lons, lats, water_levels = [], [], []
    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                lon = float(row['Longitude'])
                lat = float(row['Latitude'])
                water_level = float(row['Water_Level'])
            except KeyError as e:
                raise ValueError(f"KeyError: {e}. Available keys are: {list(row.keys())}")
            
            all_lons.append(lon)
            all_lats.append(lat)
            
            # Filter by boundary box
            if west <= lon <= east and south <= lat <= north:
                lons.append(lon)
                lats.append(lat)
                water_levels.append(water_level)
    
    # Print the total number of data points and the number after filtering
    print(f"Total data points loaded: {len(all_lons)}")
    print(f"Data points after filtering: {len(lons)}")
    
    # Check if enough data points were loaded
    if len(lons) < 4:
        raise ValueError(f"Not enough data points ({len(lons)}) within the specified boundaries to perform triangulation.")

    # Normalize the coordinates and water levels
    lons = np.array(lons)
    lats = np.array(lats)
    water_levels = np.array(water_levels)

    # Normalize coordinates to range [0, 150mm]
    x_normalized = (lons - np.min(lons)) / (np.max(lons) - np.min(lons)) * 150
    y_normalized = (lats - np.min(lats)) / (np.max(lats) - np.min(lats)) * 150

    # Normalize water levels to range [0, 30mm]
    if np.max(water_levels) - np.min(water_levels) == 0:
        z_normalized = np.zeros_like(water_levels)
    else:
        z_normalized = (water_levels - np.min(water_levels)) / (np.max(water_levels) - np.min(water_levels)) * 30

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
    parser.add_argument('--csv_file', type=str, required=True, help='Path to the CSV file')
    parser.add_argument('--west', type=float, required=True, help='Western boundary longitude')
    parser.add_argument('--east', type=float, required=True, help='Eastern boundary longitude')
    parser.add_argument('--south', type=float, required=True, help='Southern boundary latitude')
    parser.add_argument('--north', type=float, required=True, help='Northern boundary latitude')
    parser.add_argument('--output_stl', type=str, required=True, help='Output STL file name')

    args = parser.parse_args()
    try:
        generate_stl(args.csv_file, args.west, args.east, args.south, args.north, args.output_stl)
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)
