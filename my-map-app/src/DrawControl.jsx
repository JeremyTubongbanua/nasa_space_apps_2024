import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet-draw"; // Ensure leaflet-draw is imported

function DrawControl({ onCreated }) {
  const map = useMap();

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        polygon: false,
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
        rectangle: true, // Only allow drawing of rectangles
      },
    });

    // Add control only once
    map.addControl(drawControl);

    // Handle the 'draw:created' event to call onCreated
    map.on(L.Draw.Event.CREATED, (e) => {
      const { layerType, layer } = e;

      if (layerType === "rectangle") {
        onCreated(e); // Pass the event to the handler in App.jsx
        drawnItems.addLayer(layer); // Add the drawn layer to the map
      }
    });

    // Cleanup function to remove controls and event listeners
    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED);
    };
  }, [map, onCreated]);

  return null;
}

export default DrawControl;
