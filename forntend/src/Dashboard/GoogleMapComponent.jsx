import React, { useState, useEffect, useRef } from 'react';

const GoogleMapWithLocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [hoverLatLng, setHoverLatLng] = useState(null);
  const mouseMoveListenerRef = useRef(null);
  const [hoverWeather, setHoverWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const weatherDebounceRef = useRef(null);
  const weatherAbortRef = useRef(null);

  const API_KEY = "AIzaSyBIi8c81iPwdiOnpZk7wzUl6_hC3-elfBU";
  const OPEN_WEATHER_KEY = "a08e35189d1dd3a6d1a820364e4d19f2";

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(true);
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      const googleMapScript = document.createElement('script');
      googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      googleMapScript.async = true;
      googleMapScript.defer = true;
      window.document.body.appendChild(googleMapScript);
      
      googleMapScript.addEventListener('load', () => {
        const mapElement = document.getElementById('map');
        const googleMap = new window.google.maps.Map(mapElement, {
          center: userLocation,
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });
        
        const newMarker = new window.google.maps.Marker({
          position: userLocation,
          map: googleMap,
          title: 'Your Location',
          animation: window.google.maps.Animation.DROP,
        });
        
        const infoWindow = new window.google.maps.InfoWindow({
          content: '<div style="padding: 10px;"><strong>You are here!</strong><br>This is your current location.</div>',
        });
        
        newMarker.addListener('click', () => {
          infoWindow.open(googleMap, newMarker);
        });
          
        infoWindow.open(googleMap, newMarker);
        
        setMap(googleMap);
        setMarker(newMarker);
      });
    }
  }, [userLocation]);

  useEffect(() => {
    if (!map || !window.google) return undefined;
    const listener = map.addListener('mousemove', (e) => {
      if (!e || !e.latLng) return;
      setHoverLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    });
    mouseMoveListenerRef.current = listener;
    return () => {
      if (mouseMoveListenerRef.current) {
        window.google.maps.event.removeListener(mouseMoveListenerRef.current);
        mouseMoveListenerRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (!hoverLatLng) return undefined;

    if (weatherDebounceRef.current) {
      clearTimeout(weatherDebounceRef.current);
    }
    if (weatherAbortRef.current) {
      weatherAbortRef.current.abort();
      weatherAbortRef.current = null;
    }

    weatherDebounceRef.current = setTimeout(async () => {
      try {
        setWeatherLoading(true);
        setWeatherError(null);
        const controller = new AbortController();
        weatherAbortRef.current = controller;
        const { lat, lng } = hoverLatLng;
        const resp = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPEN_WEATHER_KEY}&units=metric`,
          { signal: controller.signal }
        );
        if (!resp.ok) {
          throw new Error(`Weather request failed (${resp.status})`);
        }
        const data = await resp.json();
        setHoverWeather({
          temperatureC: data?.main?.temp ?? null,
          humidityPct: data?.main?.humidity ?? null,
          windSpeedMs: data?.wind?.speed ?? null,
          description: data?.weather?.[0]?.description ?? null,
        });
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setWeatherError(err?.message || 'Failed to load weather');
          setHoverWeather(null);
        }
      } finally {
        setWeatherLoading(false);
      }
    }, 400);

    return () => {
      if (weatherDebounceRef.current) {
        clearTimeout(weatherDebounceRef.current);
        weatherDebounceRef.current = null;
      }
    };
  }, [hoverLatLng]);

  const recenterMap = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(14);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📍</div>
          <p>Loading your current location...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '16px',
          background: 'linear-gradient(90deg, #1a73e8, #34a853)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '800',
          letterSpacing: '0.5px'
        }}
      >
        Live Map & Weather Explorer
      </h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Note:</strong> {error} Using default location.
        </div>
      )}
      
      <div style={{ position: 'relative' }}>
        <div 
          id="map" 
          style={{ 
            height: '500px', 
            width: '100%', 
            borderRadius: '8px',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0,0,0,0.06)',
            cursor: 'crosshair'
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'rgba(20, 22, 26, 0.55)',
            color: '#fff',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
            maxWidth: 'calc(100% - 32px)'
          }}
        >
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>Cursor</div>
          <div style={{ marginTop: '8px', lineHeight: 1.4 }}>
            {hoverLatLng
              ? (
                <>
                  <div>lat: <span style={{ fontWeight: 700 }}>{hoverLatLng.lat.toFixed(6)}</span></div>
                  <div>lng: <span style={{ fontWeight: 700 }}>{hoverLatLng.lng.toFixed(6)}</span></div>
                </>
              )
              : 'Move cursor over map'}
          </div>
          <div style={{ marginTop: '10px', height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))' }} />
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {hoverLatLng && weatherLoading && <span style={{ opacity: 0.85 }}>Fetching weather…</span>}
            {hoverLatLng && !weatherLoading && weatherError && <span style={{ color: '#ffb3b3' }}>Weather: {weatherError}</span>}
            {hoverLatLng && !weatherLoading && !weatherError && hoverWeather && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🌡️</span>
                  <span><strong>{hoverWeather.temperatureC?.toFixed?.(1)}°C</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>💧</span>
                  <span><strong>{hoverWeather.humidityPct}%</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🌬️</span>
                  <span><strong>{hoverWeather.windSpeedMs} m/s</strong></span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <button 
          onClick={recenterMap}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #1a73e8, #3ea6ff)',
            color: '#fff',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 10px 18px rgba(26, 115, 232, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🎯
        </button>
      </div>
   
    </div>
  );
};

export default GoogleMapWithLocation;