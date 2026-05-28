/**
 * Map.jsx
 *
 * A reusable Leaflet-based map component for displaying locations across Nepal.
 * Supports interactive markers, custom popups, and dynamic zooming.
 *
 * Includes a mandatory fix for Leaflet's default marker icons which often
 * fail to load correctly in modern build environments like Vite.
 */
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Leaflet Asset Fix ────────────────────────────────────────────────────────
// Overrides default icon URLs to use reliable CDN-hosted assets.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Map = ({
  center = [28.3949, 84.124], // Default center: Nepal (lat, lng)
  zoom = 7,
  markers = [],
  onMarkerClick,
  className = 'h-64 w-full',
  interactive = true,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  /**
   * Effect: Map Lifecycle Management
   * Initializes the Leaflet instance on mount and updates markers/view on prop changes.
   */
  useEffect(() => {
    if (!mapRef.current) return;

    // ── Initialization ──
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
      }).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    } else {
      // Smoothly move the map if center or zoom changes
      mapInstanceRef.current.setView(center, zoom);
    }

    // ── Marker Management ──
    // Clear existing markers before re-adding (to prevent duplicates on re-render)
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers from props
    markers.forEach((marker, index) => {
      const { lat, lng, title, popup } = marker;
      const leafletMarker = L.marker([lat, lng]).addTo(mapInstanceRef.current);

      if (title || popup) {
        leafletMarker.bindPopup(popup || title || '');
      }

      if (onMarkerClick) {
        leafletMarker.on('click', () => onMarkerClick(marker, index));
      }

      markersRef.current.push(leafletMarker);
    });

    // Fallback: If no markers are provided, place one at the specified center
    if (markers.length === 0 && center) {
      const centerMarker = L.marker(center).addTo(mapInstanceRef.current);
      markersRef.current.push(centerMarker);
    }

    // Leaflet handles its own cleanup, but we ensure the ref persists
    return () => {};
  }, [center, zoom, markers, onMarkerClick, interactive]);

  return <div ref={mapRef} className={className} style={{ zIndex: 1 }} />;
};

export default Map;
