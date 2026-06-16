'use client';

import React, { useEffect, useRef, useState } from 'react';
import { type EventRecord } from '@/data/csvEventService';
import { MapPin, Sparkles, Loader2 } from 'lucide-react';

interface EventHeatMapProps {
  events: EventRecord[];
}

export default function EventHeatMap({ events }: EventHeatMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet css
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet script
    const loadScript = () => {
      if ((window as any).L) {
        setLeafletLoaded(true);
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setLeafletLoaded(true);
      };
      script.onerror = () => {
        setMapError(true);
      };
      document.body.appendChild(script);
    };

    loadScript();

    return () => {
      // Cleanup map instance if unmounted
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || typeof window === 'undefined') return;

    const L = (window as any).L;
    if (!L) return;

    // Re-create map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // Center map on India
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView([22.9734, 78.6569], 5);

      mapInstanceRef.current = map;

      // Add elegant dark/light theme tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Plot markers
      events.forEach((event) => {
        const { lat, lng } = event.location || {};
        if (lat !== undefined && lng !== undefined) {
          // Determine color scheme based on category
          let color = '#A67B5B'; // Music Concert
          if (event.category.includes('Hack')) color = '#7C6FE5'; // Hackathon
          else if (event.category.includes('Bus') || event.category.includes('Conf')) color = '#22C55E'; // Business
          else if (event.category.includes('Work')) color = '#F59E0B'; // Workshop
          else if (event.category.includes('Fest')) color = '#EC4899'; // Festival
          
          const pinHtml = `
            <div style="
              background-color: ${color};
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              animation: pulse 2s infinite;
            "></div>
          `;

          const icon = L.divIcon({
            html: pinHtml,
            className: 'custom-pin-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const startingPrice = event.ticketTiers[0]?.price ?? 0;
          const formattedPrice = startingPrice === 0 ? 'FREE' : `₹${startingPrice.toLocaleString('en-IN')}`;

          const popupContent = `
            <div style="width: 220px; font-family: 'Satoshi', sans-serif; text-align: left; padding: 2px;">
              <img src="${event.banner}" alt="${event.title}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 12px; margin-bottom: 8px;" />
              <div style="display: flex; gap: 4px; margin-bottom: 4px; flex-wrap: wrap;">
                <span style="background-color: #FAF7F5; border: 1px solid #D6D3D1; color: #A67B5B; font-size: 8px; font-weight: bold; padding: 1px 6px; border-radius: 20px;">
                  ${event.category}
                </span>
                ${event.featured ? `<span style="background-color: #FAF0E6; color: #D4956A; font-size: 8px; font-weight: bold; padding: 1px 6px; border-radius: 20px;">★ Trending</span>` : ''}
              </div>
              <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 900; color: #1C1917; line-height: 1.2;">${event.title}</h4>
              <p style="margin: 0 0 8px 0; font-size: 10px; color: #78716C; font-weight: 500;">📍 ${event.venue.name}, ${event.venue.city}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F5F5F4; padding-top: 8px; margin-top: 4px;">
                <div>
                  <span style="font-size: 8px; color: #78716C; display: block; font-weight: 600; text-transform: uppercase;">From</span>
                  <span style="font-size: 12px; font-weight: 800; color: #1C1917;">${formattedPrice}</span>
                </div>
                <a href="/events/${event.slug}" style="
                  background-color: ${color};
                  color: white;
                  text-decoration: none;
                  font-size: 10px;
                  font-weight: 700;
                  padding: 5px 12px;
                  border-radius: 8px;
                  box-shadow: 0 2px 6px ${color}40;
                  display: inline-block;
                  transition: all 0.2s;
                ">Book Now</a>
              </div>
            </div>
          `;

          L.marker([lat, lng], { icon })
            .addTo(map)
            .bindPopup(popupContent);
        }
      });

      // Fit map to markers bounds if there are markers
      const validMarkers = events
        .filter(e => e.location?.lat !== undefined && e.location?.lng !== undefined)
        .map(e => [e.location.lat, e.location.lng]);

      if (validMarkers.length > 0) {
        map.fitBounds(validMarkers, { padding: [50, 50] });
      }

    } catch (e) {
      console.error('Leaflet map initialization failed:', e);
      setMapError(true);
    }
  }, [leafletLoaded, events]);

  if (mapError) {
    return (
      <div className="w-full h-[550px] rounded-3xl border border-red-200 bg-red-50/20 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-12 h-12 text-red-400 mb-3" />
        <h3 className="font-bold text-red-900 text-lg mb-1">Map Loading Failed</h3>
        <p className="text-red-700/80 text-sm max-w-sm">
          There was an error loading the geographic mapping library. Please verify your internet connection.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[550px] rounded-3xl overflow-hidden border border-[#D6D3D1] shadow-inner bg-white/5 z-10">
      {!leafletLoaded && (
        <div className="absolute inset-0 bg-[#FAF7F5]/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <Loader2 className="w-10 h-10 text-[#A67B5B] animate-spin mb-3" />
          <p className="text-[#78716C] text-sm font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#A67B5B]" /> Initializing Intelligence Map...
          </p>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
