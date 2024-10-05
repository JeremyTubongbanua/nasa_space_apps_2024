import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Leaflet CSS
import "leaflet-draw/dist/leaflet.draw.css"; // Leaflet Draw CSS
import DrawControl from "./DrawControl"; // Your DrawControl component

function App() {
  const [swotData, setSwotData] = useState([]);
  const [overlayVisible, setOverlayVisible] = useState({});
  const [images, setImages] = useState({});
  const [selectAll, setSelectAll] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5001/swot/get_json")
      .then((response) => response.json())
      .then((data) => {
        setSwotData(data);
        const visibility = {};
        data.forEach((item) => {
          visibility[item.name] = true;
          fetchImage(item.name);
        });
        setOverlayVisible(visibility);
      })
      .catch((error) => {
        console.error("Error fetching SWOT data:", error);
        alert("Error fetching SWOT data: " + error.message);
      });
  }, []);

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

  const toggleOverlay = (name) => {
    const newState = !overlayVisible[name];
    setOverlayVisible((prev) => ({
      ...prev,
      [name]: newState,
    }));
  };

  const toggleSelectAll = () => {
    const newState = !selectAll;
    setSelectAll(newState);
    const newVisibility = {};
    swotData.forEach((item) => {
      newVisibility[item.name] = newState;
    });
    setOverlayVisible(newVisibility);
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

    const relevantCSVs = swotData
      .filter((item) => isBoundingBoxIntersecting(drawnBoundingBox, item.bounding_box))
      .map((item) => item.csv);

    if (relevantCSVs.length === 0) {
      alert("No data points found within the selected area.");
      return;
    }

    const data = {
      csv_files: relevantCSVs,
      west,
      east,
      south,
      north,
      lng: (west + east) / 2,
      lat: (south + north) / 2,
    };

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
        const url = window.URL.createObjectURL(blob);
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

        {swotData.map((item) => {
          const bounds = [
            [item.bounding_box.southwest.lat, item.bounding_box.southwest.lng],
            [item.bounding_box.northeast.lat, item.bounding_box.northeast.lng],
          ];
          return (
            overlayVisible[item.name] &&
            images[item.name] && (
              <ImageOverlay
                key={item.name}
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
              checked={selectAll}
              onChange={toggleSelectAll}
            />
            Select/Deselect All
          </label>
        </div>

        <button onClick={handleCollapseToggle}>
          {isCollapsed ? "Expand Options" : "Collapse Options"}
        </button>

        {!isCollapsed && (
          <div>
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
        )}
      </div>
    </div>
  );
}

export default App;
