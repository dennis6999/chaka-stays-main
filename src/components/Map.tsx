
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const Map = ({ location = 'Chaka Town, Nyeri, Kenya', zoom = 13 }: { location?: string; zoom?: number }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // If we don't have a token yet, don't initialize map
    if (!mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    // Convert location string to coordinates (for simplicity, using Chaka's approximate coordinates)
    // Chaka Ranch coordinates
    const coordinates: [number, number] = [-0.3826, 36.7452]; 

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: coordinates,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add marker for the location
    new mapboxgl.Marker({ color: '#E74C3C' })
      .setLngLat(coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h3 class="font-bold">${location}</h3><p>Explore this area</p>`))
      .addTo(map.current);

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [location, zoom, mapboxToken]);

  return (
    <div className="w-full relative">
      {!mapboxToken ? (
        <div className="bg-neutral p-4 rounded-lg">
          <p className="mb-2 font-medium">Enter your Mapbox access token to view the map:</p>
          <input 
            type="text" 
            className="w-full p-2 border rounded mb-2"
            placeholder="pk.eyJ1Ijoie3lvdXItdXNlcm5hbWV9IiwiYSI6..."
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Get your token at <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Mapbox.com</a>
          </p>
        </div>
      ) : (
        <div ref={mapContainer} className="h-[400px] rounded-lg shadow-lg" />
      )}
    </div>
  );
};

export default Map;
