import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from 'leaflet';
import 'leaflet-draw'; // Leaflet Draw Plugin

// Patch the readableArea function to fix the 'type is not defined' issue
L.GeometryUtil.readableArea = function (area, isMetric) {
  let areaStr;
  const units = isMetric
    ? ['m²', 'ha', 'km²']
    : ['yd²', 'ac', 'mi²'];
  
  if (isMetric) {
    if (area >= 1000000) {
      areaStr = (area * 0.000001).toFixed(2) + ' ' + units[2];
    } else if (area >= 10000) {
      areaStr = (area * 0.0001).toFixed(2) + ' ' + units[1];
    } else {
      areaStr = area.toFixed(2) + ' ' + units[0];
    }
  } else {
    area /= 0.836127; // Convert to square yards
    if (area >= 3097600) {
      areaStr = (area / 3097600).toFixed(2) + ' ' + units[2];
    } else if (area >= 4840) {
      areaStr = (area / 4840).toFixed(2) + ' ' + units[1];
    } else {
      areaStr = Math.ceil(area) + ' ' + units[0];
    }
  }

  return areaStr;
};


function DrawControl() {
  const map = useMap();

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        rectangle: true,
        polyline: false, // Disable polyline if not needed
        polygon: false,  // Disable polygon if not needed
        circle: false,   // Disable circle if not needed
        marker: false,   // Disable marker if not needed
      },
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      drawnItems.addLayer(layer);
    });

    // Clean up the draw controls when the component is unmounted
    return () => {
      map.off(L.Draw.Event.CREATED); // Clean up the event listener
      map.removeControl(drawControl); // Remove the draw control
    };
  }, [map]);

  return null; // This component doesn't render anything
}

export default DrawControl;
