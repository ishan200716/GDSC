'use client';

import React, { useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { CommunityNeed } from '../../types';

const nightStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

export function NeedsMap({ needs }: { needs: CommunityNeed[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      });

      const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;

      if (mapRef.current && !mapInstance.current) {
        mapInstance.current = new Map(mapRef.current, {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 10,
          styles: nightStyle,
          disableDefaultUI: true,
          zoomControl: true,
          backgroundColor: '#0A0E1A'
        });
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!mapInstance.current || typeof google === 'undefined') return;
    
    needs.forEach(need => {
      if (!need.coordinates || (need.coordinates.lat === 0 && need.coordinates.lng === 0)) return;

      // Vibrant Colors based on criticality
      const color = need.urgencyScore >= 8 
        ? '#FF3131' // Critical Red
        : need.urgencyScore >= 5 
        ? '#FFD700' // Warning Gold
        : '#00FFFF'; // Active Cyan
      
      // -- 1. Inner Circle (Solid) --
      const innerCircle = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.4,
        map: mapInstance.current,
        center: need.coordinates,
        radius: Math.max(3000, need.urgencyScore * 1200), // 3km - 12km
      });

      // -- 2. Outer Glow (Large & Faint) --
      new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.2,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: 0.1,
        map: mapInstance.current,
        center: need.coordinates,
        radius: Math.max(8000, need.urgencyScore * 2500), // 8km - 25km
      });

      // -- 3. Central Marker --
      const marker = new google.maps.Marker({
        position: need.coordinates,
        map: mapInstance.current,
        title: need.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 7
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #0f131f; font-family: Inter, sans-serif; padding: 4px; min-width: 150px;">
            <strong style="display: block; font-size: 14px; margin-bottom: 4px; color: ${color}; text-transform: uppercase;">
              ${need.category} Need
            </strong>
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${need.title}</div>
            <div style="font-size: 12px; color: #4b5563;">
              Urgency: <strong>${need.urgencyScore}/10</strong><br/>
              Impact: <strong>${need.affectedCount} people</strong>
            </div>
          </div>
        `
      });

      const openInfo = () => {
        infoWindow.setPosition(need.coordinates);
        infoWindow.open(mapInstance.current);
      };

      innerCircle.addListener("click", openInfo);
      marker.addListener("click", openInfo);
    });

    if (needs.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      let hasValidCoords = false;

      needs.forEach(need => {
        if (need.coordinates && (need.coordinates.lat !== 0 || need.coordinates.lng !== 0)) {
          bounds.extend(need.coordinates);
          hasValidCoords = true;
        }
      });

      if (hasValidCoords && mapInstance.current) {
        mapInstance.current.fitBounds(bounds);
        // Don't zoom in too much if only one point
        if (needs.length === 1) {
          const listener = google.maps.event.addListener(mapInstance.current, 'idle', () => {
            if (mapInstance.current && mapInstance.current.getZoom()! > 12) {
              mapInstance.current.setZoom(12);
            }
            google.maps.event.removeListener(listener);
          });
        }
      }
    }

  }, [needs]);

  return <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden border border-white/10" />;
}
