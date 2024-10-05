import React from "react";
import { MapContainer, TileLayer, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Leaflet CSS
import "leaflet-draw/dist/leaflet.draw.css"; // Leaflet Draw CSS
import DrawControl from "./DrawControl";

function App() {
  // Define the bounds for the image overlay
  const imageBounds = [
    [southWestLat, southWestLng], // southwest corner (lat, lng)
    [northEastLat, northEastLng], // northeast corner (lat, lng)
  ];

  return (
    <div className="h-screen">
      <MapContainer
        center={[51.505, -0.09]} // Replace with appropriate center coordinates
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Add your ImageOverlay component */}
        <ImageOverlay
          url="/assets/OPERA_L3_DSWx-HLS_T17TPJ_20230829T160831Z_20230831T193706Z_S2A_30_v1.0_B05_WTR-1.png"
          bounds={imageBounds}
          opacity={0.7} // Adjust the opacity as needed
        />

        <DrawControl />
      </MapContainer>
    </div>
  );
}

export default App;
