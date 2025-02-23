import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default marker icons
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerProps {
  defaultLocation?: L.LatLngTuple;
  onSave: (location: L.LatLngTuple) => void;
}

const LocationPicker = ({ defaultLocation, onSave }: LocationPickerProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [location, setLocation] = useState<L.LatLngTuple | null>(null);
  const [editMode, setEditMode] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Initialize location
  useEffect(() => {
    if (defaultLocation) {
      setLocation(defaultLocation);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          console.error("Geolocation request denied");
          setLocation([0, 0]); // Fallback location
        }
      );
    }
  }, [defaultLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !location) return;

    const map = L.map(mapContainerRef.current).setView(location, 13);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Add marker
    const marker = L.marker(location, {
      icon: defaultIcon,
      draggable: editMode,
    }).addTo(map);

    markerRef.current = marker;

    // Always show popup when clicking marker
    marker.on("click", () => {
      marker
        .bindPopup(`📍 Lat: ${location[0]}, Lng: ${location[1]}`)
        .openPopup();
    });

    return () => {
      map.remove();
    };
  }, [editMode, location]);

  // Enable multiple clicks in edit mode
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;

    if (!map || !marker) return;

    if (editMode) {
      marker.dragging?.enable();
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
    } else {
      marker.dragging?.disable();
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!editMode) return;

      const newLocation: L.LatLngTuple = [e.latlng.lat, e.latlng.lng];

      // Update marker without reloading map
      marker
        .setLatLng(newLocation)
        .bindPopup(
          `📍 Selected Location<br>Lat: ${newLocation[0]}, Lng: ${newLocation[1]}`
        )
        .openPopup();

      setLocation(newLocation);
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [editMode,location]);

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLocation: L.LatLngTuple = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];

        setLocation(newLocation);

        if (mapRef.current) {
          mapRef.current.setView(newLocation, 15); // Higher zoom for accuracy
        }

        if (markerRef.current) {
          markerRef.current
            .setLatLng(newLocation)
            .bindPopup(
              `📍 Your Location<br>Lat: ${newLocation[0]}, Lng: ${newLocation[1]}`
            )
            .openPopup();
        }
      },
      () => {
        alert("Failed to get location. Try enabling GPS.");
      },
      { enableHighAccuracy: true } // 🔥 High Accuracy Mode
    );
  };


  const handleSave = () => {
    if (location) {
      onSave(location);
      setEditMode(false);
      markerRef.current
        ?.bindPopup(
          `📍 Final Location<br>Lat: ${location[0]}, Lng: ${location[1]}`
        )
        .openPopup();
    }
  };

  if (!location) return <div>Loading map...</div>;

  return (
    <div>
      <div
        ref={mapContainerRef}
        style={{
          height: "400px",
          width: "400px",
          cursor: editMode ? "pointer" : "default",
        }}
      />
      <div style={{ marginTop: "10px" }}>
        <button
          onClick={editMode ? handleSave : () => setEditMode(true)}
          style={{ marginRight: "10px" }}
        >
          {editMode ? "Save Location" : "Edit Location"}
        </button>
        <button onClick={handleGetLocation}>📍 Get My Location</button>
      </div>
    </div>
  );
};

export default LocationPicker;
