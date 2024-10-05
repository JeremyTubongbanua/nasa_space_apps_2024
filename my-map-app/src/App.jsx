import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Leaflet CSS
import 'leaflet-draw/dist/leaflet.draw.css'; // Leaflet Draw CSS
import DrawControl from './DrawControl';

function App() {
  return (
    <div className="h-screen">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DrawControl />
      </MapContainer>
    </div>
  );
}

export default App;
