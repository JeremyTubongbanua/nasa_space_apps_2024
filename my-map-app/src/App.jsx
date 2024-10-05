import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Leaflet CSS
import "leaflet-draw/dist/leaflet.draw.css"; // Leaflet Draw CSS
import DrawControl from "./DrawControl"; // Your DrawControl component

function App() {
  const [swotData, setSwotData] = useState([]);
  const [overlayVisible, setOverlayVisible] = useState({});
  const [images, setImages] = useState({});
  const [selectAll, setSelectAll] = useState(true); // Control for select/deselect all

  // Fetch SWOT data on component mount
  useEffect(() => {
    fetch("http://localhost:5001/swot/get_json")
      .then((response) => response.json())
      .then((data) => {
        setSwotData(data);

        // Initialize visibility state for all overlays (visible by default)
        const visibility = {};
        data.forEach((item) => {
          visibility[item.name] = true; // Set all overlays to be visible by default
          fetchImage(item.name); // Fetch images immediately when data is loaded
        });
        setOverlayVisible(visibility);
      })
      .catch((error) => {
        console.error("Error fetching SWOT data:", error);
        alert("Error fetching SWOT data: " + error.message);
      });
  }, []);

  // Fetch the image dynamically for a specific overlay
  const fetchImage = (name) => {
    fetch(`http://localhost:5001/swot/get_image?name=${name}`)
      .then((response) => response.blob())
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setImages((prevImages) => ({
          ...prevImages,
          [name]: imageUrl,
        }));
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
        alert("Error fetching image: " + error.message);
      });
  };

  // Toggle the visibility of a specific overlay
  const toggleOverlay = (name) => {
    const newState = !overlayVisible[name];
    setOverlayVisible((prev) => ({
      ...prev,
      [name]: newState,
    }));
  };

  // Toggle all overlays (Select/Deselect All)
  const toggleSelectAll = () => {
    const newState = !selectAll;
    setSelectAll(newState);

    // Update the visibility state for all SWOT items
    const newVisibility = {};
    swotData.forEach((item) => {
      newVisibility[item.name] = newState;
    });
    setOverlayVisible(newVisibility);
  };

  // Helper function to check if bounding boxes intersect
  const isBoundingBoxIntersecting = (bbox1, bbox2) => {
    return !(
      bbox2.southwest.lat > bbox1.northeast.lat ||
      bbox2.northeast.lat < bbox1.southwest.lat ||
      bbox2.southwest.lng > bbox1.northeast.lng ||
      bbox2.northeast.lng < bbox1.southwest.lng
    );
  };

  // Handle when a rectangle is drawn
  const handleRectangleDraw = (e) => {
    const bounds = e.layer.getBounds();
    const southwest = bounds.getSouthWest();
    const northeast = bounds.getNorthEast();

    let west = southwest.lng;
    let east = northeast.lng;
    let south = southwest.lat;
    let north = northeast.lat;

    // Calculate the center point of the bounding box
    const longitude = (west + east) / 2;
    const latitude = (south + north) / 2;

    // Create a bounding box
    const drawnBoundingBox = {
      southwest: { lat: south, lng: west },
      northeast: { lat: north, lng: east },
    };

    // Show alert with bounding box data
    alert(`Bounding box coordinates: West: ${west}, East: ${east}, South: ${south}, North: ${north}`);

    // Find the relevant CSVs whose bounding boxes intersect with the drawn bounding box
    const relevantCSVs = swotData
      .filter((item) => isBoundingBoxIntersecting(drawnBoundingBox, item.bounding_box))
      .map((item) => item.csv);

    if (relevantCSVs.length === 0) {
      alert("No data points found within the selected area.");
      return;
    }

    // Prepare data for the POST request, including the center point (longitude, latitude)
    const data = {
      csv_files: relevantCSVs,
      west,
      east,
      south,
      north,
      lng: longitude,
      lat: latitude,
    };

    // Show alert with relevant CSVs
    alert(`Relevant CSVs: ${relevantCSVs.join(", ")}`);

    // Make the POST request to the generate_stl endpoint
    fetch("http://localhost:5001/swot/generate_stl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error("STL generation failed");
        }
      })
      .then((blob) => {
        alert("STL generation successful! Downloading now...");
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "terrain.stl");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => {
        console.error("Error generating STL:", error);
        alert("Error generating STL: " + error.message);
      });
  };

  return (
    <div className="h-screen">
      <MapContainer
        center={[43.65107, -79.347015]} // Centered in Toronto
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Loop through the SWOT data and render image overlays based on bounding boxes */}
        {swotData.map((item) => {
          const bounds = [
            [item.bounding_box.southwest.lat, item.bounding_box.southwest.lng],
            [item.bounding_box.northeast.lat, item.bounding_box.northeast.lng],
          ];

          return (
            overlayVisible[item.name] &&
            images[item.name] && ( // Only show the overlay if it's visible and the image is loaded
              <ImageOverlay
                key={item.name}
                url={images[item.name]} // Dynamically fetched image URL
                bounds={bounds}
                opacity={0.7} // Adjust the opacity as needed
              />
            )
          );
        })}

        <DrawControl onCreated={handleRectangleDraw} />
      </MapContainer>

      {/* Toggle buttons to control overlays */}
      <div
        className="overlay-controls"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "white",
          padding: 10,
          zIndex: 1000, // Set a high z-index to make sure it's on top of the map
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Optional: for better visibility
        }}
      >
        {/* Select/Deselect All Checkbox */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={toggleSelectAll}
            />
            Select/Deselect All
          </label>
        </div>

        {/* Individual SWOT controls */}
        {swotData.map((item) => (
          <div key={item.name}>
            <label>
              <input
                type="checkbox"
                checked={overlayVisible[item.name] || false}
                onChange={() => toggleOverlay(item.name)}
              />
              {item.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
