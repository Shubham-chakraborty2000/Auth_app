import React, { useState, useEffect, useCallback } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  MapPin,
  Navigation,
} from "lucide-react";

const GoogleMapComponent = () => {
  const [userLocation, setUserLocation] = useState({
    lat: 22.5726,
    lng: 88.3639,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isDefaultLocation, setIsDefaultLocation] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [hoverLocation, setHoverLocation] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [hoverMarker, setHoverMarker] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const GOOGLE_MAPS_API_KEY = "AIzaSyBIi8c81iPwdiOnpZk7wzUl6_hC3-elfBU";
  const OPEN_WEATHER_API_KEY = "a08e35189d1dd3a6d1a820364e4d19f2";

  // Debounce function to limit API calls
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Fetch weather data function
  const fetchWeatherData = useCallback(async (lat, lng) => {
    setWeatherLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod === 200) {
        setWeatherData(data);
        setHoverLocation({ lat, lng });
      } else {
        throw new Error(data.message || "Failed to fetch weather data");
      }
    } catch (err) {
      console.error("Weather API error:", err);
      setWeatherData(null);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // Debounced version of fetchWeatherData
  const debouncedFetchWeather = useCallback(
    debounce((lat, lng) => fetchWeatherData(lat, lng), 500),
    [fetchWeatherData]
  );

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setUserLocation(newLocation);
          setIsDefaultLocation(false);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          setIsDefaultLocation(true);
        },
        { timeout: 10000 }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      setIsDefaultLocation(true);
    }
  }, []);

  // Initialize map when userLocation is set and Google Maps API is loaded
  useEffect(() => {
    if (userLocation && window.google && window.google.maps && !mapLoaded) {
      initMap();
      setMapLoaded(true);
    }
  }, [userLocation, mapLoaded]);

  // Load Google Maps API script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (userLocation) {
          initMap();
          setMapLoaded(true);
        }
      };
      script.onerror = () => {
        setError("Failed to load Google Maps. Please check your API key.");
        setLoading(false);
      };
      document.head.appendChild(script);
    } else if (
      window.google &&
      window.google.maps &&
      userLocation &&
      !mapLoaded
    ) {
      initMap();
      setMapLoaded(true);
    }
  }, [userLocation]);

  // Initialize the map
  const initMap = () => {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    const googleMap = new window.google.maps.Map(mapElement, {
      center: userLocation,
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ color: "#f8fafc" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#3b82f6" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [{ color: "#f1f5f9" }],
        },
      ],
    });

    // Add main marker for user location
    const newMarker = new window.google.maps.Marker({
      position: userLocation,
      map: googleMap,
      title: isDefaultLocation
        ? "Kolkata, India (Default)"
        : "Your Current Location",
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: isDefaultLocation
          ? "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
              `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#ffffff"/></svg>`
            )
          : "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
              `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#ffffff"/></svg>`
            ),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16),
      },
    });

    // Add info window for the main marker
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div style="padding: 12px; font-family: Arial, sans-serif;"><strong style="color: #1f2937;">${
        isDefaultLocation ? "Kolkata, India" : "Your Location"
      }</strong><br/><span style="color: #6b7280; font-size: 14px;">${
        isDefaultLocation
          ? "Default location shown"
          : "Current location detected"
      }</span></div>`,
    });

    newMarker.addListener("click", () => {
      infoWindow.open(googleMap, newMarker);
    });

    // Add mousemove listener to get weather on hover
    let mouseMoveTimeout;
    googleMap.addListener("mousemove", (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      // Remove previous hover marker if exists
      if (hoverMarker) {
        hoverMarker.setMap(null);
      }

      // Create new hover marker
      const newHoverMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: googleMap,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
              `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="6" fill="#ef4444" stroke="#ffffff" stroke-width="2" opacity="0.8"/></svg>`
            ),
          scaledSize: new window.google.maps.Size(20, 20),
          anchor: new window.google.maps.Point(10, 10),
        },
        zIndex: 1000,
      });

      setHoverMarker(newHoverMarker);

      // Clear previous timeout and set new one
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        debouncedFetchWeather(lat, lng);
      }, 300);
    });

    // Remove hover marker when mouse leaves map
    googleMap.addListener("mouseout", () => {
      if (hoverMarker) {
        hoverMarker.setMap(null);
        setHoverMarker(null);
      }
    });

    setMap(googleMap);
    setMarker(newMarker);

    // Fetch initial weather data for user location
    fetchWeatherData(userLocation.lat, userLocation.lng);
  };

  // Get weather icon based on condition
  const getWeatherIcon = (iconCode) => {
    switch (iconCode) {
      case "01d":
      case "01n":
        return <Sun className="w-12 h-12 text-yellow-500" />;
      case "02d":
      case "02n":
      case "03d":
      case "03n":
      case "04d":
      case "04n":
        return <Cloud className="w-12 h-12 text-gray-500" />;
      case "09d":
      case "09n":
      case "10d":
      case "10n":
      case "11d":
      case "11n":
        return <CloudRain className="w-12 h-12 text-blue-500" />;
      case "50d":
      case "50n":
        return <Eye className="w-12 h-12 text-gray-400" />;
      default:
        return <Sun className="w-12 h-12 text-yellow-500" />;
    }
  };

  // Recenter map to user's location
  const recenterMap = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(12);
      fetchWeatherData(userLocation.lat, userLocation.lng);
    }
  };

  // Try to get location again
  const tryAgainLocation = () => {
    setLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setUserLocation(newLocation);
          setIsDefaultLocation(false);
          setLoading(false);

          // Reinitialize map with new location
          if (map) {
            map.setCenter(newLocation);
            if (marker) {
              marker.setPosition(newLocation);
            }
            fetchWeatherData(newLocation.lat, newLocation.lng);
          }
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        <div className="text-center p-8 bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
            <MapPin className="absolute inset-0 m-auto w-6 h-6 text-white" />
          </div>
          <p className="text-xl font-medium text-white">
            Detecting your location...
          </p>
          <p className="text-white/80 mt-2">Please allow location access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            ⛅ Weather Explorer
          </h1>
          <p className="text-xl text-white/90 font-medium">
            {isDefaultLocation
              ? "📍 Showing Kolkata, India - Hover anywhere on the map to explore weather"
              : "🎯 Your location detected - Hover anywhere to explore weather worldwide"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-lg border border-red-300/30 rounded-2xl flex items-center justify-between">
            <div className="text-white">
              <strong>⚠️ Location Error:</strong> {error}
            </div>
            <button
              onClick={tryAgainLocation}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 font-medium backdrop-blur-sm border border-white/30"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/30">
              <div className="relative">
                <div id="map" className="h-[500px] w-full"></div>
                <button
                  onClick={recenterMap}
                  className="absolute bottom-6 right-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl font-medium flex items-center space-x-2 backdrop-blur-sm"
                >
                  <Navigation className="w-4 h-4" />
                  <span>My Location</span>
                </button>
              </div>
            </div>

            <div className="mt-6 p-6 bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30">
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">🎯</span>How to Use
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <p className="text-white/90 text-lg">
                    Hover your mouse over any location on the map to instantly
                    see weather data
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <p className="text-white/90 text-lg">
                    Watch the weather panel update in real-time as you explore
                    different areas
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-6 border border-white/30">
              <h2 className="text-3xl font-semibold text-white mb-6 flex items-center">
                <Cloud className="w-8 h-8 mr-3 text-white" />
                Live Weather
              </h2>

              {weatherLoading ? (
                <div className="text-center py-12">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
                    <Cloud className="absolute inset-0 m-auto w-6 h-6 text-white" />
                  </div>
                  <p className="text-white/80 text-lg">
                    Fetching weather data...
                  </p>
                </div>
              ) : weatherData ? (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl border border-white/20">
                    <div className="flex items-center justify-center mb-4">
                      {getWeatherIcon(weatherData.weather[0].icon)}
                    </div>
                    <div className="text-5xl font-bold text-white mb-2">
                      {Math.round(weatherData.main.temp)}°C
                    </div>
                    <div className="text-white/80 text-lg capitalize mb-2">
                      {weatherData.weather[0].description}
                    </div>
                    <div className="text-white/60 text-sm">
                      {weatherData.weather[0].main} Conditions
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-xl border border-white/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Thermometer className="w-5 h-5 text-red-300" />
                        <span className="text-white/80 font-medium">
                          Feels Like
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {Math.round(weatherData.main.feels_like)}°C
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-xl border border-white/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Droplets className="w-5 h-5 text-blue-300" />
                        <span className="text-white/80 font-medium">
                          Humidity
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {weatherData.main.humidity}%
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-xl border border-white/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Wind className="w-5 h-5 text-green-300" />
                        <span className="text-white/80 font-medium">
                          Wind Speed
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {weatherData.wind.speed} m/s
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl border border-white/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Gauge className="w-5 h-5 text-purple-300" />
                        <span className="text-white/80 font-medium">
                          Pressure
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {weatherData.main.pressure} hPa
                      </div>
                    </div>
                  </div>

                  {hoverLocation && (
                    <div className="p-4 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-xl border border-white/20">
                      <p className="text-white/80 text-sm">
                        Hover Location: Lat {hoverLocation.lat.toFixed(4)}, Lng{" "}
                        {hoverLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/80 text-lg">
                    Hover over the map to see weather information
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapComponent;
