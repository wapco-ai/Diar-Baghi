// DetailPage.jsx - With AR mode and sound features
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/DetailPage.css';

const DetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showGpsPrompt, setShowGpsPrompt] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const destinationMarkerRef = useRef(null);
  const originMarkerRef = useRef(null);

  // TEMPORARILY ROUTING SYSTEM - Navigation state
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationIntervalRef = useRef(null);
  const routeLineRef = useRef(null);

  // AR Mode state
  const [isArMode, setIsArMode] = useState(false);

  // Sound states
  const [isSoundOverlayOpen, setIsSoundOverlayOpen] = useState(false);
  const [isSoundPopupVisible, setIsSoundPopupVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Route info state
  const [routeInfo, setRouteInfo] = useState({
    distance: '--',
    wheelchair: '--',
    walkingTime: '--',
    shadedPath: '--'
  });

  useEffect(() => {
    setFadeIn(true);

    // Get selected person from navigation state or sessionStorage
    let person = null;

    if (location.state?.selectedPerson) {
      person = location.state.selectedPerson;
      sessionStorage.setItem('selectedPerson', JSON.stringify(person));
    } else {
      const savedPerson = sessionStorage.getItem('selectedPerson');
      if (savedPerson) {
        person = JSON.parse(savedPerson);
      }
    }

    if (person) {
      console.log('Selected person:', person);
      console.log('Destination coordinates:', person.lat, person.lng);
      setSelectedPerson(person);
    } else {
      // TEMPORARILY ROUTING SYSTEM - Fallback to priority person
      const defaultPerson = {
        id: 0,
        name: 'حمید رضا رحمانی میاندهی',
        section: 'بلوک 30',
        row: '13',
        lat: 36.1675134665991,
        lng: 59.7000692302999,
        province: 'خراسان رضوی',
        city: 'مشهد',
        deathDate: '1393/07/25',
        image: '/assets/images/s1.jpg'
      };
      setSelectedPerson(defaultPerson);
    }
  }, [location.state]);

  // Request user location on page load
  useEffect(() => {
    // Small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      requestUserLocation();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const requestUserLocation = () => {
    if (isRequestingLocation) return;

    if (!navigator.geolocation) {
      setLocationError('مرورگر شما از موقعیت یابی پشتیبانی نمی کند');
      return;
    }

    setIsRequestingLocation(true);
    setShowGpsPrompt(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location:', latitude, longitude);
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationError(null);
        setIsRequestingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        setIsRequestingLocation(false);

        if (error.code === 1) {
          // Permission denied
          setLocationError('دسترسی به موقعیت مکانی داده نشد');
          setShowGpsPrompt(true);
        } else if (error.code === 2) {
          setLocationError('موقعیت مکانی در دسترس نیست');
        } else if (error.code === 3) {
          setLocationError('زمان دریافت موقعیت به پایان رسید');
        } else {
          setLocationError('خطا در دریافت موقعیت مکانی');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    console.log('Initializing map...');

    // TEMPORARILY ROUTING SYSTEM - Center on priority person's location
    const defaultLat = 36.1675134665991;
    const defaultLng = 59.7000692302999;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',
      center: [defaultLng, defaultLat],
      zoom: 12,
      attributionControl: false,
      dragPan: true,
      scrollZoom: true,
      touchZoomRotate: true,
      dragRotate: false,
    });

    mapRef.current.on('load', () => {
      console.log('Map loaded');
      setMapLoaded(true);
    });

    mapRef.current.on('error', (e) => {
      console.error('Map error:', e);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // TEMPORARILY ROUTING SYSTEM - Draw route line on map
  const drawRouteLine = () => {
    if (!mapRef.current || !mapLoaded || !userLocation || !selectedPerson) {
      console.log('Cannot draw route - missing data');
      return;
    }

    // Remove existing route line if any
    if (routeLineRef.current) {
      mapRef.current.removeLayer('route-line');
      mapRef.current.removeSource('route-line');
      routeLineRef.current = null;
    }

    // Get points for the route - origin to destination
    const origin = [userLocation.lng, userLocation.lat];
    const destination = [selectedPerson.lng, selectedPerson.lat];

    // Create a simple straight line (this is temporary - in real app you'd get actual route)
    const routeData = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [origin, destination]
      },
      properties: {}
    };

    // Add the route source and layer
    mapRef.current.addSource('route-line', {
      type: 'geojson',
      data: routeData
    });

    mapRef.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route-line',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#2196F3',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });

    routeLineRef.current = 'route-line';
  };

  // TEMPORARILY ROUTING SYSTEM - Remove route line
  const removeRouteLine = () => {
    if (!mapRef.current) return;
    if (routeLineRef.current) {
      try {
        mapRef.current.removeLayer('route-line');
        mapRef.current.removeSource('route-line');
        routeLineRef.current = null;
      } catch (e) {
        console.log('Route line already removed');
      }
    }
  };

  // Add markers to map
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !selectedPerson) {
      console.log('Waiting for map and selectedPerson...');
      return;
    }

    console.log('Adding markers...');
    console.log('Destination:', selectedPerson.lat, selectedPerson.lng);

    // Clear existing markers
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
    }
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
    }

    // Add destination marker (grave location)
    const destinationElement = document.createElement('div');
    destinationElement.className = 'Detailpage-destinationMarker';
    destinationElement.innerHTML = `
      <div class="Detailpage-destinationMarkerInner">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#2A884A" stroke="white" strokeWidth="2">
          <path d="M12 22c-2 0-8-7-8-10a8 8 0 1 1 16 0c0 3-6 10-8 10z"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>
        <div class="Detailpage-markerLabel">مزار ${selectedPerson.name}</div>
      </div>
    `;

    destinationMarkerRef.current = new maplibregl.Marker({
      element: destinationElement,
      anchor: 'bottom'
    })
      .setLngLat([selectedPerson.lng, selectedPerson.lat])
      .addTo(mapRef.current);

    console.log('Destination marker added at:', selectedPerson.lng, selectedPerson.lat);

    // Add origin marker if user location is available
    if (userLocation) {
      console.log('Adding origin marker at:', userLocation.lng, userLocation.lat);

      const originElement = document.createElement('div');
      originElement.className = 'Detailpage-originMarker';
      originElement.innerHTML = `
        <div class="Detailpage-pulseRing"></div>
        <div class="Detailpage-originMarkerInner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="#2196F3" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3" fill="#2196F3"/>
          </svg>
          <div class="Detailpage-markerLabel">موقعیت شما</div>
        </div>
      `;

      originMarkerRef.current = new maplibregl.Marker({
        element: originElement,
        anchor: 'bottom'
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);

      // Calculate actual distance
      const distanceInMeters = calculateDistance(
        userLocation.lat, userLocation.lng,
        selectedPerson.lat, selectedPerson.lng
      );

      const distanceInKm = (distanceInMeters / 1000).toFixed(1);
      const walkingTimeInMinutes = Math.round(distanceInMeters / 83.33);

      setRouteInfo({
        distance: distanceInMeters < 1000 ? `${Math.round(distanceInMeters)}` : `${distanceInKm}`,
        distanceUnit: distanceInMeters < 1000 ? 'متر' : 'کیلومتر',
        wheelchair: distanceInMeters < 500 ? 'بله' : 'خیر',
        walkingTime: walkingTimeInMinutes,
        shadedPath: Math.floor(Math.random() * 40) + 50
      });

      // Fit bounds to show both markers
      const bounds = new maplibregl.LngLatBounds()
        .extend([selectedPerson.lng, selectedPerson.lat])
        .extend([userLocation.lng, userLocation.lat]);

      mapRef.current.fitBounds(bounds, {
        padding: 80,
        duration: 1000
      });

      // TEMPORARILY ROUTING SYSTEM - Draw route if navigating
      if (isNavigating) {
        drawRouteLine();
      }
    } else {
      // Just show destination
      mapRef.current.flyTo({
        center: [selectedPerson.lng, selectedPerson.lat],
        zoom: 15,
        duration: 1000
      });
    }
  }, [mapLoaded, selectedPerson, userLocation, isNavigating]);

  // TEMPORARILY ROUTING SYSTEM - Start navigation
  const startNavigation = () => {
    if (!userLocation) {
      setShowGpsPrompt(true);
      return;
    }

    setIsNavigating(true);
    setIsSoundPopupVisible(true); // Show sound popup when navigation starts
    drawRouteLine();

    // Open navigation in external app (OSM)
    const url = `https://www.openstreetmap.org/directions?engine=graphhopper_foot&route=${userLocation.lat},${userLocation.lng}&to=${selectedPerson.lat},${selectedPerson.lng}`;
    window.open(url, '_blank');

    // Simulate navigation with interval (for demonstration)
    navigationIntervalRef.current = setInterval(() => {
      // This just updates the walking time to show activity
      setRouteInfo(prev => ({
        ...prev,
        walkingTime: Math.max(0, prev.walkingTime - 1)
      }));
    }, 30000); // Update every 30 seconds
  };

  // TEMPORARILY ROUTING SYSTEM - Stop navigation
  const stopNavigation = () => {
    setIsNavigating(false);
    setIsSoundPopupVisible(false); // Hide sound popup when navigation stops
    setIsArMode(false); // Turn off AR mode when navigation stops
    removeRouteLine();

    if (navigationIntervalRef.current) {
      clearInterval(navigationIntervalRef.current);
      navigationIntervalRef.current = null;
    }

    // Reset walking time to original
    if (userLocation && selectedPerson) {
      const distanceInMeters = calculateDistance(
        userLocation.lat, userLocation.lng,
        selectedPerson.lat, selectedPerson.lng
      );
      const walkingTimeInMinutes = Math.round(distanceInMeters / 83.33);
      setRouteInfo(prev => ({
        ...prev,
        walkingTime: walkingTimeInMinutes
      }));
    }
  };

  // TEMPORARILY ROUTING SYSTEM - Toggle navigation
  const handleToggleNavigation = () => {
    if (isNavigating) {
      stopNavigation();
    } else {
      startNavigation();
    }
  };

  // Handle AR mode toggle
  const handleArToggle = () => {
    setIsArMode(!isArMode);
  };

  // Handle sound button click
  const handleSoundClick = () => {
    setIsSoundOverlayOpen(true);
  };

  // Close sound overlay
  const closeSoundOverlay = () => {
    setIsSoundOverlayOpen(false);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleBack = () => {
    // Clean up navigation if active
    if (isNavigating) {
      stopNavigation();
    }
    navigate('/mappage');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (navigationIntervalRef.current) {
        clearInterval(navigationIntervalRef.current);
      }
    };
  }, []);

  // Check if we should show sound popup (only when navigating and not in AR mode)
  const shouldShowSoundPopup = isNavigating && !isArMode;

  return (
    <div className={`Detailpage-container ${fadeIn ? 'fade-in' : ''}`}>
      {/* Header */}
      <div className="Detailpage-header">
        <h1 className="Detailpage-headerTitle">
          مسیریابی به مزار {selectedPerson?.name || ''}
        </h1>
        <button className="Detailpage-backButton" onClick={handleBack}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Map Container with overlay buttons */}
      <div className="Detailpage-mapWrapper">
        {/* Sound Button - Top Left - Only visible during navigation */}
        {isNavigating && (
          <>
            <button
              className={`Detailpage-arButton ${isArMode ? 'active' : ''}`}
              onClick={handleArToggle}
            >
              {isArMode ? 'خروج از AR' : 'نمایش AR'}
            </button>
            <button
              className="Detailpage-soundButton"
              onClick={handleSoundClick}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </button>

            {/* Sound Popup - Shows below sound button when navigating */}
            {/* {shouldShowSoundPopup && (
              <div className="Detailpage-soundPopup">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A884A" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <p className="Detailpage-soundPopupInstruction">بیست متر جلو بروید</p>
              </div>
            )} */}

            {/* AR Mode Button - Top Right - Only visible during navigation */}
          </>
        )}

        <div ref={mapContainerRef} className="Detailpage-mapContainer" />

        {/* AR Mode Image Placeholder */}
        {isArMode && isNavigating && (
          <div className="Detailpage-arImageContainer">
          </div>
        )}
      </div>

      {/* GPS Prompt Modal */}
      {showGpsPrompt && !userLocation && !isRequestingLocation && (
        <div className="Detailpage-gpsModal">
          <div className="Detailpage-gpsModalContent">
            <div className="Detailpage-gpsModalIcon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2A884A" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" />
              </svg>
            </div>
            <h3>دسترسی به موقعیت مکانی</h3>
            <p>برای نمایش موقعیت شما روی نقشه و محاسبه مسیر دقیق، نیاز به دسترسی به موقعیت شما داریم</p>
            <div className="Detailpage-gpsModalButtons">
              <button className="Detailpage-gpsAllowBtn" onClick={requestUserLocation}>
                اجازه دسترسی
              </button>
              <button className="Detailpage-gpsCancelBtn" onClick={() => setShowGpsPrompt(false)}>
                بعداً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Error Message */}
      {locationError && !showGpsPrompt && (
        <div className="Detailpage-locationError">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="0.5" fill="#f44336" stroke="none" />
          </svg>
          <span>{locationError}</span>
          <button onClick={requestUserLocation}>تلاش مجدد</button>
        </div>
      )}

      {/* Loading indicator */}
      {isRequestingLocation && (
        <div className="Detailpage-loadingLocation">
          <div className="Detailpage-loadingSpinner"></div>
          <span>در حال دریافت موقعیت شما...</span>
        </div>
      )}

      {/* Bottom Info Card */}
      <div className={`Detailpage-infoCard ${isArMode ? 'ar-mode' : ''}`}>
        <div className="Detailpage-infoGrid">
          <div className="Detailpage-infoItem">
            <div className="Detailpage-infoIcon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-walk"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 4a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M7 21l3 -4" /><path d="M16 21l-2 -4l-3 -3l1 -6" /><path d="M6 12l2 -3l4 -1l3 3l3 1" /></svg>
            </div>
            <div className="Detailpage-infoText">
              <span className="Detailpage-infoLabel">فاصله</span>
              <span className="Detailpage-infoValue">
                {routeInfo.distance !== '--' ? `${routeInfo.distance} ${routeInfo.distanceUnit || 'متر'}` : '--'}
              </span>
            </div>
          </div>

          <div className="Detailpage-infoItem">
            <div className="Detailpage-infoIcon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-clock"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 7v5l3 3" /></svg>
            </div>
            <div className="Detailpage-infoText">
              <span className="Detailpage-infoLabel">زمان پیاده</span>
              <span className="Detailpage-infoValue">
                {routeInfo.walkingTime !== '--' ? `${routeInfo.walkingTime} دقیقه` : '--'}
              </span>
            </div>
          </div>

          {!isArMode && (
            <>
              <div className="Detailpage-infoItem">
                <div className="Detailpage-infoIcon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-disabled"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M11 7l0 8l4 0l4 5" /><path d="M11 11l5 0" /><path d="M7 11.5a5 5 0 1 0 6 7.5" /></svg>
                </div>
                <div className="Detailpage-infoText">
                  <span className="Detailpage-infoLabel">مناسب ویلچر</span>
                  <span className="Detailpage-infoValue">{routeInfo.wheelchair}</span>
                </div>
              </div>

              <div className="Detailpage-infoItem">
                <div className="Detailpage-infoIcon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#387F4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-tree"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 13l-2 -2" /><path d="M12 12l2 -2" /><path d="M12 21v-13" /><path d="M9.824 16a3 3 0 0 1 -2.743 -3.69a3 3 0 0 1 .304 -4.833a3 3 0 0 1 4.615 -3.707a3 3 0 0 1 4.614 3.707a3 3 0 0 1 .305 4.833a3 3 0 0 1 -2.919 3.695h-4l-.176 -.005" /></svg>
                </div>
                <div className="Detailpage-infoText">
                  <span className="Detailpage-infoLabel">مسیر سایه‌دار</span>
                  <span className="Detailpage-infoValue">
                    {routeInfo.shadedPath !== '--' ? `${routeInfo.shadedPath}%` : '--'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* TEMPORARILY ROUTING SYSTEM - Toggle button with dynamic styling */}
        <button
          className={`Detailpage-startButton ${isNavigating ? 'navigating' : ''}`}
          onClick={handleToggleNavigation}
        >
          {isNavigating ? 'توقف مسیریابی' : 'شروع مسیریابی'}
        </button>
      </div>

      {/* Sound Overlay - Full page (Second Picture) */}
      {isSoundOverlayOpen && (
        <div className="Detailpage-soundOverlay">
          <div className="Detailpage-soundOverlayContent">
            {/* Header */}
            <div className="Detailpage-soundOverlayHeader">
              <button
                className="Detailpage-soundOverlayMuteBtn"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>
              <h2 className="Detailpage-soundOverlayTitle">راهنمایی صوتی</h2>
              <button
                className="Detailpage-soundOverlayCloseBtn"
                onClick={closeSoundOverlay}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="Detailpage-soundOverlayBody">
              <div className="Detailpage-soundOverlayStatus">
                <div className="Detailpage-soundOverlayPulseIcon">
                  <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#2A884A" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                </div>
                <div className="Detailpage-soundOverlayStatusWrapper">
                  {/* Left sound bars */}
                  <div className="Detailpage-soundBars left">
                    <div className="Detailpage-soundBar"></div>
                    <div className="Detailpage-soundBar"></div>
                    <div className="Detailpage-soundBar"></div>
                    <div className="Detailpage-soundBar"></div>
                    <div className="Detailpage-soundBar"></div>
                  </div>

                  <p className="Detailpage-soundOverlayStatusText">در حال پخش راهنمایی صوتی... </p>

                  {/* Right sound bars */}
                  <div className="Detailpage-soundBars right">
                    <div className="Detailpage-soundBar"></div>
                    <div className="Detailpage-soundBar"></div>
                    <div className="Detailpage-soundBar"></div>
                    <div className="Detailpage-soundBar"></div>
                    <div className="Detailpage-soundBar"></div>
                  </div>
                </div>
              </div>

              <div className="Detailpage-soundOverlayInstruction">
                <p className="Detailpage-soundOverlayInstructionText">بیست متر جلو بروید</p>
              </div>

              {/* Progress Bar */}
              <div className="Detailpage-soundOverlayProgressContainer">
                <div className="Detailpage-soundOverlayProgressTrack">
                  <div
                    className="Detailpage-soundOverlayProgressFill"
                    style={{ width: '70%' }}
                  ></div>
                </div>
                <span className="Detailpage-soundOverlayProgressText">70%</span>
              </div>

              {/* Distance and Buttons */}
              <div className="Detailpage-soundOverlayFooter">
                <span className="Detailpage-soundOverlayDistance">متر 120</span>
                <div className="Detailpage-soundOverlayActions">
                  <button className="Detailpage-soundOverlayRepeatBtn">تکرار</button>
                  <button className="Detailpage-soundOverlayStopBtn">توقف</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPage;