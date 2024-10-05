import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from 'leaflet';
import 'leaflet-draw';

// Override the readableArea function
L.GeometryUtil.readableArea = function (area, units, precision) {
  let areaStr;
  const numberFormat = {
    maximumFractionDigits: precision || 2,
  };

  if (units === 'km') {
    areaStr = new Intl.NumberFormat('en', numberFormat).format(area / 1e6) + ' km²';
  } else if (units === 'ha') {
    areaStr = new Intl.NumberFormat('en', numberFormat).format(area / 1e4) + ' ha';
  } else {
    areaStr = new Intl.NumberFormat('en', numberFormat).format(area) + ' m²';
  }

  return areaStr;
};

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

    map.addControl(drawControl);

    // Handle the 'draw:created' event to call onCreated
    const handleDrawCreated = (e) => {
      const { layerType, layer } = e;

      if (layerType === "rectangle" && onCreated) {
        onCreated(e); // Call onCreated if it exists
        drawnItems.addLayer(layer); // Add the drawn layer to the map
      }
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreated);

    // Cleanup function to remove controls and event listeners
    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
    };
  }, [map, onCreated]);

  return null;
}

export default DrawControl;
