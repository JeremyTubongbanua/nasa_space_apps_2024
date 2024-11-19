import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Leaflet CSS
import "leaflet-draw/dist/leaflet.draw.css"; // Leaflet Draw CSS
import DrawControl from "./DrawControl"; // Your DrawControl component

const BASE_URL = "http://67.217.243.8:5001";

function App() {
  const [elevationData, setElevationData] = useState([]);
  const [swotData, setSwotData] = useState([]);
  const [overlayVisible, setOverlayVisible] = useState({});
  const [images, setImages] = useState({});
  const [selectAllElevation, setSelectAllElevation] = useState(true);
  const [selectAllSwot, setSelectAllSwot] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    // Fetch elevation data
    fetch(`${BASE_URL}/elevation/get_json`)
      .then((response) => response.json())
      .then((data) => {
        setElevationData(data);
        const visibility = {};
        data.forEach((item) => {
          if (item.name) {
            visibility[item.name] = true;
            fetchImage("elevation", item.name);
          }
        });
        setOverlayVisible((prev) => ({ ...prev, ...visibility }));
      })
      .catch((error) => {
        console.error("Error fetching elevation data:", error);
        alert("Error fetching elevation data: " + error.message);
      });

    // Fetch SWOT data
    fetch(`${BASE_URL}/swot/get_json`)
      .then((response) => response.json())
      .then((data) => {
        setSwotData(data);
        const visibility = {};
        data.forEach((item) => {
          if (item.name) {
            visibility[item.name] = true;
            fetchImage("swot", item.name);
          }
        });
        setOverlayVisible((prev) => ({ ...prev, ...visibility }));
      })
      .catch((error) => {
        console.error("Error fetching SWOT data:", error);
        alert("Error fetching SWOT data: " + error.message);
      });
  }, []);

  const fetchImage = (type, name) => {
    const url =
      type === "elevation"
        ? `${BASE_URL}/elevation/get_image?name=${name}`
        : `${BASE_URL}/swot/get_image?name=${name}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Image not found");
        }
        return response.blob();
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setImages((prevImages) => ({
          ...prevImages,
          [name]: imageUrl,
        }));
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  };

  const toggleOverlay = (name) => {
    const newState = !overlayVisible[name];
    setOverlayVisible((prev) => ({
      ...prev,
      [name]: newState,
    }));
  };

  // Toggle all elevation overlays
  const toggleSelectAllElevation = () => {
    const newState = !selectAllElevation;
    setSelectAllElevation(newState);
    const newVisibility = {};
    elevationData.forEach((item) => {
      if (item.name) {
        newVisibility[item.name] = newState;
      }
    });
    setOverlayVisible((prev) => ({ ...prev, ...newVisibility }));
  };

  // Toggle all SWOT overlays
  const toggleSelectAllSwot = () => {
    const newState = !selectAllSwot;
    setSelectAllSwot(newState);
    const newVisibility = {};
    swotData.forEach((item) => {
      if (item.name) {
        newVisibility[item.name] = newState;
      }
    });
    setOverlayVisible((prev) => ({ ...prev, ...newVisibility }));
  };

  const handleCollapseToggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleRectangleDraw = (e) => {
    const bounds = e.layer.getBounds();
    const southwest = bounds.getSouthWest();
    const northeast = bounds.getNorthEast();

    const west = southwest.lng;
    const east = northeast.lng;
    const south = southwest.lat;
    const north = northeast.lat;

    const drawnBoundingBox = {
      southwest: { lat: south, lng: west },
      northeast: { lat: north, lng: east },
    };

    // Generate STL for Elevation
    const relevantElevationCSVs = elevationData
      .filter((item) =>
        isBoundingBoxIntersecting(drawnBoundingBox, item.bounding_box)
      )
      .map((item) => item.csv);

    if (relevantElevationCSVs.length > 0) {
      generateSTL("elevation", relevantElevationCSVs, west, east, south, north);
    }

    // Generate STL for SWOT
    const relevantSwotCSVs = swotData
      .filter((item) =>
        isBoundingBoxIntersecting(drawnBoundingBox, item.bounding_box)
      )
      .map((item) => item.csv);

    if (relevantSwotCSVs.length > 0) {
      generateSTL("swot", relevantSwotCSVs, west, east, south, north);
    }
  };

  const generateSTL = (type, relevantCSVs, west, east, south, north) => {
    const data = {
      csv_files: relevantCSVs,
      west,
      east,
      south,
      north,
      lng: (west + east) / 2,
      lat: (south + north) / 2,
    };

    const url =
      type === "elevation"
        ? `${BASE_URL}/elevation/generate_stl`
        : `${BASE_URL}/swot/generate_stl`;

    fetch(url, {
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
          throw new Error(`${type.toUpperCase()} STL generation failed`);
        }
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${type}_terrain.stl`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => {
        console.error(`Error generating ${type.toUpperCase()} STL:`, error);
        alert(`Error generating ${type.toUpperCase()} STL: ${error.message}`);
      });
  };

  const isBoundingBoxIntersecting = (bbox1, bbox2) => {
    return !(
      bbox2.southwest.lat > bbox1.northeast.lat ||
      bbox2.northeast.lat < bbox1.southwest.lat ||
      bbox2.southwest.lng > bbox1.northeast.lng ||
      bbox2.northeast.lng < bbox1.southwest.lng
    );
  };

  return (
    <div className="h-screen">
      <MapContainer
        center={[43.65107, -79.347015]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {[...elevationData, ...swotData].map((item, index) => {
          const bounds = [
            [item.bounding_box.southwest.lat, item.bounding_box.southwest.lng],
            [item.bounding_box.northeast.lat, item.bounding_box.northeast.lng],
          ];
          return (
            item.name &&
            overlayVisible[item.name] &&
            images[item.name] && (
              <ImageOverlay
                key={`${item.name}-${index}`} // Unique key
                url={images[item.name]}
                bounds={bounds}
                opacity={0.7}
              />
            )
          );
        })}

        <DrawControl onCreated={handleRectangleDraw} />
      </MapContainer>

      <div
        className="overlay-controls"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "white",
          padding: 10,
          zIndex: 1000,
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectAllElevation}
              onChange={toggleSelectAllElevation}
            />
            Select/Deselect All Elevation
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectAllSwot}
              onChange={toggleSelectAllSwot}
            />
            Select/Deselect All SWOT
          </label>
        </div>

        <button onClick={handleCollapseToggle}>
          {isCollapsed ? "Expand Options" : "Collapse Options"}
        </button>

        {!isCollapsed && (
          <div>
            {[...elevationData, ...swotData].map((item, index) => (
              <div key={`${item.name}-${index}`}>
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
        )}
      </div>
    </div>
  );
}

export default App;
