import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import pic7 from '../assets/images/pic7.png';
import '../styles/GraveReservation.css';
import html2canvas from 'html2canvas';
import logo from '../assets/images/Main_Logo2.png';
import jsPDF from 'jspdf';

const GraveReservation = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [fadeIn, setFadeIn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Stage 1: Registration Form Data
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    nationalId: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Stage 2: Document Upload
  const [idCardImage, setIdCardImage] = useState(null);
  const [livePhotoImage, setLivePhotoImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);

  // Stage 3: COMPLETELY REWRITTEN - Clean map implementation
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedGrave, setSelectedGrave] = useState(null);
  const [selectedSection, setSelectedSection] = useState('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showGraveModal, setShowGraveModal] = useState(false);
  const dropdownRef = useRef(null);

  // Stage 5: Receipt & Map Overlay
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptMap, setShowReceiptMap] = useState(false);
  const receiptMapContainerRef = useRef(null);
  const receiptMapRef = useRef(null);
  const receiptRef = useRef(null);

  // Confetti pieces for stage 5
  const [confettiPieces, setConfettiPieces] = useState([]);

  // TEMPORARY FUNCTION FOR SESSION OF FAVOURITE PLACES - START
  const saveReservedGraveToFavourites = (grave, formData) => {
    const savedFavourites = sessionStorage.getItem('favourites_list');
    let favourites = savedFavourites ? JSON.parse(savedFavourites) : [];

    const existingIndex = favourites.findIndex(fav => fav.id === grave.id);

    const reservedItem = {
      id: grave.id,
      name: formData.name + ' ' + formData.surname,
      section: grave.section,
      row: grave.row,
      number: grave.number,
      province: 'خراسان رضوی',
      city: 'مشهد',
      deathDate: '1403/01/01',
      image: null,
      isReserved: true,
      reservationDate: new Date().toLocaleDateString('fa-IR')
    };

    if (existingIndex >= 0) {
      favourites[existingIndex] = { ...favourites[existingIndex], ...reservedItem };
    } else {
      favourites.push(reservedItem);
    }

    sessionStorage.setItem('favourites_list', JSON.stringify(favourites));
  };
  // TEMPORARY FUNCTION FOR SESSION OF FAVOURITE PLACES - END

  // SIMPLIFIED GRAVE DATA - All graves with fixed coordinates
  const allGraves = [
    // بلوک 1
    { id: 1, section: 'بلوک 1', row: 1, number: 1, lat: 36.1675, lng: 59.6958, price: 35000000, status: 'available' },
    { id: 2, section: 'بلوک 1', row: 1, number: 2, lat: 36.1675, lng: 59.6960, price: 35200000, status: 'available' },
    { id: 3, section: 'بلوک 1', row: 1, number: 3, lat: 36.1675, lng: 59.6962, price: 35400000, status: 'reserved' },
    { id: 4, section: 'بلوک 1', row: 2, number: 1, lat: 36.1677, lng: 59.6958, price: 35600000, status: 'available' },
    { id: 5, section: 'بلوک 1', row: 2, number: 2, lat: 36.1677, lng: 59.6960, price: 35800000, status: 'available' },
    { id: 6, section: 'بلوک 1', row: 2, number: 3, lat: 36.1677, lng: 59.6962, price: 36000000, status: 'available' },
    { id: 7, section: 'بلوک 1', row: 3, number: 1, lat: 36.1679, lng: 59.6958, price: 36200000, status: 'reserved' },
    { id: 8, section: 'بلوک 1', row: 3, number: 2, lat: 36.1679, lng: 59.6960, price: 36400000, status: 'available' },
    { id: 9, section: 'بلوک 1', row: 3, number: 3, lat: 36.1679, lng: 59.6962, price: 36600000, status: 'available' },

    // بلوک 2
    { id: 10, section: 'بلوک 2', row: 1, number: 1, lat: 36.1681, lng: 59.6959, price: 38000000, status: 'available' },
    { id: 11, section: 'بلوک 2', row: 1, number: 2, lat: 36.1681, lng: 59.6961, price: 38200000, status: 'available' },
    { id: 12, section: 'بلوک 2', row: 1, number: 3, lat: 36.1681, lng: 59.6963, price: 38400000, status: 'reserved' },
    { id: 13, section: 'بلوک 2', row: 2, number: 1, lat: 36.1683, lng: 59.6959, price: 38600000, status: 'available' },
    { id: 14, section: 'بلوک 2', row: 2, number: 2, lat: 36.1683, lng: 59.6961, price: 38800000, status: 'available' },
    { id: 15, section: 'بلوک 2', row: 2, number: 3, lat: 36.1683, lng: 59.6963, price: 39000000, status: 'available' },

    // بلوک 3
    { id: 16, section: 'بلوک 3', row: 1, number: 1, lat: 36.1676, lng: 59.6955, price: 40000000, status: 'available' },
    { id: 17, section: 'بلوک 3', row: 1, number: 2, lat: 36.1676, lng: 59.6957, price: 40200000, status: 'available' },
    { id: 18, section: 'بلوک 3', row: 1, number: 3, lat: 36.1676, lng: 59.6959, price: 40400000, status: 'reserved' },
    { id: 19, section: 'بلوک 3', row: 2, number: 1, lat: 36.1678, lng: 59.6955, price: 40600000, status: 'available' },
    { id: 20, section: 'بلوک 3', row: 2, number: 2, lat: 36.1678, lng: 59.6957, price: 40800000, status: 'available' },

    // بلوک 4
    { id: 21, section: 'بلوک 4', row: 1, number: 1, lat: 36.1680, lng: 59.6965, price: 42000000, status: 'available' },
    { id: 22, section: 'بلوک 4', row: 1, number: 2, lat: 36.1680, lng: 59.6967, price: 42200000, status: 'reserved' },
    { id: 23, section: 'بلوک 4', row: 1, number: 3, lat: 36.1680, lng: 59.6969, price: 42400000, status: 'available' },
    { id: 24, section: 'بلوک 4', row: 2, number: 1, lat: 36.1682, lng: 59.6965, price: 42600000, status: 'available' },

    // بلوک 5
    { id: 25, section: 'بلوک 5', row: 1, number: 1, lat: 36.1685, lng: 59.6958, price: 44000000, status: 'available' },
    { id: 26, section: 'بلوک 5', row: 1, number: 2, lat: 36.1685, lng: 59.6960, price: 44200000, status: 'available' },
    { id: 27, section: 'بلوک 5', row: 1, number: 3, lat: 36.1685, lng: 59.6962, price: 44400000, status: 'reserved' },
    { id: 28, section: 'بلوک 5', row: 2, number: 1, lat: 36.1687, lng: 59.6958, price: 44600000, status: 'available' },

    // بلوک 6
    { id: 29, section: 'بلوک 6', row: 1, number: 1, lat: 36.1674, lng: 59.6964, price: 36000000, status: 'available' },
    { id: 30, section: 'بلوک 6', row: 1, number: 2, lat: 36.1674, lng: 59.6966, price: 36200000, status: 'available' },
    { id: 31, section: 'بلوک 6', row: 1, number: 3, lat: 36.1674, lng: 59.6968, price: 36400000, status: 'reserved' },

    // بلوک 7
    { id: 32, section: 'بلوک 7', row: 1, number: 1, lat: 36.1672, lng: 59.6957, price: 38000000, status: 'available' },
    { id: 33, section: 'بلوک 7', row: 1, number: 2, lat: 36.1672, lng: 59.6959, price: 38200000, status: 'available' },
    { id: 34, section: 'بلوک 7', row: 1, number: 3, lat: 36.1672, lng: 59.6961, price: 38400000, status: 'reserved' },

    // بلوک 8
    { id: 35, section: 'بلوک 8', row: 1, number: 1, lat: 36.1688, lng: 59.6963, price: 40000000, status: 'available' },
    { id: 36, section: 'بلوک 8', row: 1, number: 2, lat: 36.1688, lng: 59.6965, price: 40200000, status: 'available' },
    { id: 37, section: 'بلوک 8', row: 1, number: 3, lat: 36.1688, lng: 59.6967, price: 40400000, status: 'reserved' },

    // بلوک 9
    { id: 38, section: 'بلوک 9', row: 1, number: 1, lat: 36.1678, lng: 59.6953, price: 42000000, status: 'available' },
    { id: 39, section: 'بلوک 9', row: 1, number: 2, lat: 36.1678, lng: 59.6955, price: 42200000, status: 'available' },

    // بلوک 10
    { id: 40, section: 'بلوک 10', row: 1, number: 1, lat: 36.1684, lng: 59.6971, price: 45000000, status: 'available' },
    { id: 41, section: 'بلوک 10', row: 1, number: 2, lat: 36.1684, lng: 59.6973, price: 45200000, status: 'reserved' },
  ];

  const sections = ['بلوک 1', 'بلوک 2', 'بلوک 3', 'بلوک 4', 'بلوک 5', 'بلوک 6', 'بلوک 7', 'بلوک 8', 'بلوک 9', 'بلوک 10'];

  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createConfetti = () => {
    const colors = ['#FF5252', '#FFD740', '#4CAF50', '#2196F3', '#9C27B0', '#FF4081', '#00BCD4', '#FF9800'];
    const pieces = [];
    for (let i = 0; i < 150; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        top: -10 - Math.random() * 20,
        delay: Math.random() * 1.5,
        duration: Math.random() * 2 + 2.5,
        size: Math.random() * 12 + 6,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: Math.random() > 0.5 ? 'square' : 'rectangle'
      });
    }
    return pieces;
  };

  useEffect(() => {
    if (currentStep === 3 && mapContainerRef.current && !mapRef.current) {
      console.log('Initializing map...');

      // Ensure container has dimensions
      const container = mapContainerRef.current;
      container.style.width = '100%';
      container.style.height = '100%';

      mapRef.current = new maplibregl.Map({
        container: container,
        style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',
        center: [59.696200, 36.167699],
        zoom: 16,
        bearing: 0,
        pitch: 0,
        attributionControl: false,
        dragPan: true,
        scrollZoom: true,
        touchZoomRotate: true,
        dragRotate: false,
        // Add these to ensure proper interaction
        interactive: true,
        touchPitch: false,
      });

      // Add navigation control for zoom buttons
      mapRef.current.addControl(
        new maplibregl.NavigationControl({
          showCompass: false,
          showZoom: true,
        }),
        'top-right'
      );

      mapRef.current.on('load', () => {
        if (mapRef.current) {
          mapRef.current.setPitch(0);
          mapRef.current.setBearing(0);
          setMapLoaded(true);
          // Update markers after map loads
          setTimeout(() => updateMarkers(), 200);
        }
      });

      // Handle movement - only reset pitch and bearing, don't interfere with zoom
      let moveTimeout = null;

      mapRef.current.on('move', () => {
        // Clear any existing timeout
        if (moveTimeout) {
          clearTimeout(moveTimeout);
        }

        // Set a small delay to reset pitch/bearing after movement stops
        moveTimeout = setTimeout(() => {
          if (mapRef.current) {
            const currentPitch = mapRef.current.getPitch();
            const currentBearing = mapRef.current.getBearing();

            if (currentPitch !== 0 || currentBearing !== 0) {
              mapRef.current.easeTo({
                pitch: 0,
                bearing: 0,
                duration: 100 // Smooth transition
              });
            }
          }
          moveTimeout = null;
        }, 150);
      });

      mapRef.current.on('error', (e) => {
        console.error('Map error:', e);
      });

      // Force a resize after a short delay to ensure proper rendering
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 100);
    }

    return () => {
      // Only cleanup if moving away from step 3 completely
      if (currentStep !== 3 && mapRef.current) {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        mapRef.current.remove();
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [currentStep]);

  // Create marker element - UPDATED WITH TOMBSTONE SVG
  const createMarkerElement = (grave, isSelected) => {
    const el = document.createElement('div');
    el.className = `GraveReservation-graveMarker ${isSelected ? 'selected' : ''}`;
    el.style.cursor = grave.status === 'available' ? 'pointer' : 'not-allowed';
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';

    if (isSelected) {
      el.innerHTML = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
            <!-- Tombstone with gold styling for selected -->
            <rect x="6" y="6" width="12" height="14" rx="2" stroke="#C6A045" stroke-width="2.5" fill="#C6A045" fill-opacity="0.15"/>
            <path d="M8 6H16C17.1046 6 18 6.89543 18 8V20H6V8C6 6.89543 6.89543 6 8 6Z" stroke="#C6A045" stroke-width="2.5" fill="#C6A045" fill-opacity="0.15"/>
            <!-- Star decoration -->
            <polygon points="12,4 13.5,7.5 17,7.5 14.5,10 15.5,13.5 12,11.5 8.5,13.5 9.5,10 7,7.5 10.5,7.5" stroke="#FFD700" stroke-width="1.8" fill="#FFD700" fill-opacity="0.3"/>
            <path d="M10 11H14" stroke="#C6A045" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M10 14H13" stroke="#C6A045" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M7 20H17" stroke="#C6A045" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Small circle on top -->
            <circle cx="12" cy="5" r="1.5" stroke="#FFD700" stroke-width="2" fill="#FFD700"/>
          </svg>
          <div style="position:absolute;bottom:-28px;background:#C6A045;color:white;padding:2px 8px;border-radius:10px;font-size:11px;white-space:nowrap;font-weight:600;">انتخاب شما</div>
        </div>
      `;
    } else if (grave.status === 'available') {
      el.innerHTML = `
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
          <!-- Tombstone with green styling for available -->
          <rect x="6" y="6" width="12" height="14" rx="2" stroke="#4CAF50" stroke-width="2" fill="#4CAF50" fill-opacity="0.1"/>
          <path d="M8 6H16C17.1046 6 18 6.89543 18 8V20H6V8C6 6.89543 6.89543 6 8 6Z" stroke="#4CAF50" stroke-width="2" fill="#4CAF50" fill-opacity="0.1"/>
          <circle cx="12" cy="5" r="1.5" stroke="#4CAF50" stroke-width="2" fill="#4CAF50"/>
          <path d="M10 10H14" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
          <path d="M10 13H13" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
          <path d="M7 20H17" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    } else {
      el.innerHTML = `
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
          <!-- Tombstone with grey styling for reserved -->
          <rect x="6" y="6" width="12" height="14" rx="2" stroke="#9E9E9E" stroke-width="2" fill="#9E9E9E" fill-opacity="0.1"/>
          <path d="M8 6H16C17.1046 6 18 6.89543 18 8V20H6V8C6 6.89543 6.89543 6 8 6Z" stroke="#9E9E9E" stroke-width="2" fill="#9E9E9E" fill-opacity="0.1"/>
          <circle cx="12" cy="5" r="1.5" stroke="#9E9E9E" stroke-width="2" fill="#9E9E9E"/>
          <path d="M10 10H14" stroke="#9E9E9E" stroke-width="2" stroke-linecap="round"/>
          <line x1="8" y1="13" x2="16" y2="13" stroke="#9E9E9E" stroke-width="2" stroke-linecap="round"/>
          <path d="M7 20H17" stroke="#9E9E9E" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    }

    return el;
  };

  // Update markers
  const updateMarkers = () => {
    if (!mapRef.current || !mapLoaded) {
      console.log('Map not ready for markers');
      return;
    }

    console.log('Updating markers...');

    // Remove all existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Get filtered graves
    const filtered = selectedSection === 'all'
      ? allGraves
      : allGraves.filter(g => g.section === selectedSection);

    console.log(`Adding ${filtered.length} markers`);

    filtered.forEach(grave => {
      const isSelected = selectedGrave?.id === grave.id;
      const el = createMarkerElement(grave, isSelected);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([grave.lng, grave.lat])
        .addTo(mapRef.current);

      // Click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Marker clicked:', grave.id);

        if (grave.status === 'available') {
          setSelectedGrave(grave);
          setShowGraveModal(true);

          // Fly to the grave
          if (mapRef.current) {
            const container = mapRef.current.getContainer();
            const containerHeight = container.clientHeight;
            const offsetFactor = 0.3;

            mapRef.current.flyTo({
              center: [grave.lng, grave.lat],
              zoom: 17.5,
              duration: 800,
              essential: true,
              offset: [0, -containerHeight * (0.5 - offsetFactor)]
            });
          }
        } else {
          alert('این قبر قبلاً رزرو شده است');
        }
      });

      markersRef.current.push(marker);
    });
  };

  // Update markers when map loads or selection changes
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      setTimeout(() => {
        updateMarkers();
      }, 100);
    }
  }, [mapLoaded, selectedGrave, selectedSection]);

  // Handle section change - fly to section
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      if (selectedSection !== 'all') {
        const sectionGraves = allGraves.filter(g => g.section === selectedSection);
        if (sectionGraves.length > 0) {
          const avgLat = sectionGraves.reduce((sum, g) => sum + g.lat, 0) / sectionGraves.length;
          const avgLng = sectionGraves.reduce((sum, g) => sum + g.lng, 0) / sectionGraves.length;
          mapRef.current.flyTo({
            center: [avgLng, avgLat],
            zoom: 16.5,
            duration: 800,
            essential: true
          });
        }
      } else {
        mapRef.current.flyTo({
          center: [59.696200, 36.167699],
          zoom: 16,
          duration: 800,
          essential: true
        });
      }
    }
  }, [selectedSection, mapLoaded]);

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setIsDropdownOpen(false);
  };

  const closeGraveModal = () => {
    setShowGraveModal(false);
  };

  const validateStage1 = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'نام الزامی است';
    if (!formData.surname.trim()) errors.surname = 'نام خانوادگی الزامی است';
    if (!formData.phone.trim()) {
      errors.phone = 'شماره موبایل الزامی است';
    } else if (!/^09[0-9]{9}$/.test(formData.phone)) {
      errors.phone = 'شماره موبایل معتبر نیست';
    }
    if (!formData.nationalId.trim()) {
      errors.nationalId = 'کد ملی الزامی است';
    } else if (!/^[0-9]{10}$/.test(formData.nationalId)) {
      errors.nationalId = 'کد ملی باید ۱۰ رقم باشد';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStage1Proceed = () => {
    if (validateStage1()) {
      setCurrentStep(2);
    }
  };

  const handleIdCardUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdCardImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
      setShowCamera(true);
    } catch (err) {
      alert('برای گرفتن سلفی به دسترسی دوربین نیاز است. لطفاً مجوز دوربین را فعال کنید.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');
      setLivePhotoImage(imageData);

      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setShowCamera(false);
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const handleStage2Proceed = () => {
    if (!idCardImage || !livePhotoImage) {
      setUploadStatus({ type: 'error', message: 'لطفاً تمام مدارک را بارگذاری کنید' });
      setTimeout(() => setUploadStatus(null), 3000);
      return;
    }

    setIsVerifying(true);
    setUploadStatus({ type: 'pending', message: 'در حال بررسی مدارک...' });

    setTimeout(() => {
      setIsVerifying(false);
      setUploadStatus({ type: 'success', message: 'مدارک با موفقیت تأیید شد' });
      setTimeout(() => {
        setUploadStatus(null);
        setCurrentStep(3);
      }, 1500);
    }, 6000);
  };

  const handleStage3Proceed = () => {
    if (!selectedGrave) {
      alert('لطفاً یک قبر را انتخاب کنید');
      return;
    }

    saveReservedGraveToFavourites(selectedGrave, formData);

    const receipt = {
      trackingNumber: `۱۴۰۴-۰۸-${Math.floor(Math.random() * 9000) + 1000}`,
      grave: `${selectedGrave.section} - ردیف ${selectedGrave.row} - شماره ${selectedGrave.number}`,
      amount: selectedGrave.price.toLocaleString(),
      date: new Date().toLocaleDateString('fa-IR'),
      status: 'تأیید شده',
      graveData: selectedGrave
    };

    setReceiptData(receipt);
    setCurrentStep(5);
    setShowConfetti(true);
    setConfettiPieces(createConfetti());

    setTimeout(() => {
      setShowConfetti(false);
      setConfettiPieces([]);
    }, 4000);
  };

  const handleViewOnMap = () => {
    setShowReceiptMap(true);
    setTimeout(() => {
      if (receiptMapContainerRef.current && !receiptMapRef.current && receiptData?.graveData) {
        receiptMapRef.current = new maplibregl.Map({
          container: receiptMapContainerRef.current,
          style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
          center: [receiptData.graveData.lng, receiptData.graveData.lat],
          zoom: 18,
          bearing: 0,
          pitch: 0,
          attributionControl: false,
          dragRotate: false,
          minPitch: 0,
          maxPitch: 0,
        });

        receiptMapRef.current.on('load', () => {
          receiptMapRef.current.setPitch(0);
          receiptMapRef.current.setBearing(0);

          const markerElement = document.createElement('div');
          markerElement.className = 'GraveReservation-receiptMarker';
          markerElement.innerHTML = `
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
              <!-- Tombstone with gold styling for receipt -->
              <rect x="6" y="6" width="12" height="14" rx="2" stroke="#C6A045" stroke-width="2.5" fill="#C6A045" fill-opacity="0.15"/>
              <path d="M8 6H16C17.1046 6 18 6.89543 18 8V20H6V8C6 6.89543 6.89543 6 8 6Z" stroke="#C6A045" stroke-width="2.5" fill="#C6A045" fill-opacity="0.15"/>
              <polygon points="12,4 13.5,7.5 17,7.5 14.5,10 15.5,13.5 12,11.5 8.5,13.5 9.5,10 7,7.5 10.5,7.5" stroke="#FFD700" stroke-width="2" fill="#FFD700" fill-opacity="0.3"/>
              <path d="M10 11H14" stroke="#C6A045" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M10 14H13" stroke="#C6A045" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M7 20H17" stroke="#C6A045" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="12" cy="5" r="2" stroke="#FFD700" stroke-width="2" fill="#FFD700"/>
            </svg>
            <div class="GraveReservation-receiptMarkerLabel">${receiptData.graveData.section} - ردیف ${receiptData.graveData.row} - شماره ${receiptData.graveData.number}</div>
          `;

          new maplibregl.Marker({ element: markerElement })
            .setLngLat([receiptData.graveData.lng, receiptData.graveData.lat])
            .addTo(receiptMapRef.current);
        });
      }
    }, 100);
  };

  const closeReceiptMap = () => {
    if (receiptMapRef.current) {
      receiptMapRef.current.remove();
      receiptMapRef.current = null;
    }
    setShowReceiptMap(false);
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) {
      alert('خطا: رسید یافت نشد');
      return;
    }
  
    try {
      // Disable buttons during download
      const buttons = receiptRef.current.querySelector('.GraveReservation-receiptButtons');
      if (buttons) {
        buttons.style.pointerEvents = 'none';
        buttons.style.opacity = '0.5';
      }
  
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#F5EDD8',
        logging: false,
        useCORS: true,
        allowTaint: true
      });
  
      // Re-enable buttons
      if (buttons) {
        buttons.style.pointerEvents = '';
        buttons.style.opacity = '';
      }
  
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`رسید_رزرو_قبر_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const buttons = receiptRef.current?.querySelector('.GraveReservation-receiptButtons');
      if (buttons) {
        buttons.style.pointerEvents = '';
        buttons.style.opacity = '';
      }
      alert('خطا در ایجاد فایل PDF: ' + error.message);
    }
  };

  const steps = [
    { number: 1, title: 'ثبت درخواست' },
    { number: 2, title: 'بارگذاری مدارک' },
    { number: 3, title: 'انتخاب قبر' },
    { number: 4, title: 'پرداخت' },
    { number: 5, title: 'صدور رسید' }
  ];

  // Custom Dropdown Component
  const CustomSectionDropdown = () => {
    const getDisplayText = () => {
      if (selectedSection === 'all') return 'همه بلوک ها';
      return selectedSection;
    };

    return (
      <div className="GraveReservation-customSelect" ref={dropdownRef}>
        <div className="GraveReservation-selectTrigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <span>{getDisplayText()}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {isDropdownOpen && (
          <div className="GraveReservation-dropdownMenu">
            <div
              className="GraveReservation-dropdownItem"
              onClick={() => handleSectionSelect('all')}
            >
              همه بلوک ها
            </div>
            {sections.map(section => (
              <div
                key={section}
                className="GraveReservation-dropdownItem"
                onClick={() => handleSectionSelect(section)}
              >
                {section}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`GraveReservation-container ${fadeIn ? 'fade-in' : ''}`}>
      {/* Hide header and top image for Stage 2 and Stage 3 */}
      {currentStep !== 2 && currentStep !== 3 && currentStep !== 5 && (
        <>
          <div className="GraveReservation-header">
            <img src={logo} alt="دیار باقی" className="Mainlogo-g" />
          </div>
          <div className="GraveReservation-topImage">
            <img src={pic7} alt="رزرو قبر" />
          </div>
        </>
      )}

      {/* Progress Bar */}
      <div className="GraveReservation-progress">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          return (
            <React.Fragment key={step.number}>
              <div
                className={`GraveReservation-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              >
                <div className="GraveReservation-stepCircle">
                  {isCompleted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span className="GraveReservation-stepLabel">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`GraveReservation-stepLine ${isCompleted ? 'completed-line' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Stage 1 */}
      {currentStep === 1 && (
        <div className="GraveReservation-stage">
          <div className="GraveReservation-stageHeader">
            <div className="GraveReservation-badge">
              <svg
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="32px"
                height="32px"
                viewBox="0 0 96 96"
                enableBackground="new 0 0 96 96"
                xmlSpace="preserve"
              >
                <g>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    fill="#039660"
                    d="M48,0c26.51,0,48,21.49,48,48S74.51,96,48,96S0,74.51,0,48 S21.49,0,48,0L48,0z M26.764,49.277c0.644-3.734,4.906-5.813,8.269-3.79c0.305,0.182,0.596,0.398,0.867,0.646l0.026,0.025 c1.509,1.446,3.2,2.951,4.876,4.443l1.438,1.291l17.063-17.898c1.019-1.067,1.764-1.757,3.293-2.101 c5.235-1.155,8.916,5.244,5.206,9.155L46.536,63.366c-2.003,2.137-5.583,2.332-7.736,0.291c-1.234-1.146-2.576-2.312-3.933-3.489 c-2.35-2.042-4.747-4.125-6.701-6.187C26.993,52.809,26.487,50.89,26.764,49.277L26.764,49.277z"
                  />
                </g>
              </svg>
              <span>فرآیند آنلاین - بدون نیاز به مراجعه حضوری</span>
            </div>
          </div>

          <div className="GraveReservation-form">
            <div className="GraveReservation-formGroup">
              <label>نام</label>
              <input type="text" placeholder="نام خود را وارد کنید" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={formErrors.name ? 'error' : ''} />
              {formErrors.name && <span className="GraveReservation-error">{formErrors.name}</span>}
            </div>

            <div className="GraveReservation-formGroup">
              <label>نام خانوادگی</label>
              <input type="text" placeholder="نام خانوادگی خود را وارد کنید" value={formData.surname} onChange={(e) => setFormData({ ...formData, surname: e.target.value })} className={formErrors.surname ? 'error' : ''} />
              {formErrors.surname && <span className="GraveReservation-error">{formErrors.surname}</span>}
            </div>

            <div className="GraveReservation-formGroup">
              <label>شماره موبایل</label>
              <input type="tel" placeholder="شماره موبایل خود را وارد کنید" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={formErrors.phone ? 'error' : ''} />
              {formErrors.phone && <span className="GraveReservation-error">{formErrors.phone}</span>}
            </div>

            <div className="GraveReservation-formGroup">
              <label>کد ملی</label>
              <input type="text" placeholder="کد ملی خود را وارد کنید" value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} className={formErrors.nationalId ? 'error' : ''} />
              {formErrors.nationalId && <span className="GraveReservation-error">{formErrors.nationalId}</span>}
            </div>

            <div className="GraveReservation-formGroup">
              <label>آدرس (اختیاری)</label>
              <textarea placeholder="آدرس کامل خود را وارد کنید" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows="3" />
            </div>
          </div>

          <button className="GraveReservation-submitBtn" onClick={handleStage1Proceed}>شروع ثبت درخواست</button>

          <div className="GraveReservation-guide">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 19l18 0" /><path d="M5 7a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -8" /></svg>
            <span>راهنمای تصویری</span>
          </div>
        </div>
      )}

      {/* Stage 2 */}
      {currentStep === 2 && (
        <div className="GraveReservation-stage">
          <button className="GraveReservation-backButton" onClick={() => setCurrentStep(1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <h2 className="GraveReservation-stageTitle">بارگذاری مدارک</h2>

          <div className="GraveReservation-uploadSection">
            <div className="GraveReservation-uploadBox">
              <div className="GraveReservation-uploadLabel">

                <span>کارت ملی متقاضی</span>
              </div>
              <div className="GraveReservation-uploadArea" onClick={() => document.getElementById('idCardInput').click()}>
                {idCardImage ? (
                  <img src={idCardImage} alt="کارت ملی" className="GraveReservation-uploadPreview" />
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p>برای بارگذاری کلیک کنید</p>
                    <small>فرمت‌های مجاز: JPG, PNG</small>
                  </>
                )}
                <input type="file" id="idCardInput" accept="image/*" style={{ display: 'none' }} onChange={handleIdCardUpload} />
              </div>
            </div>

            <div className="GraveReservation-uploadBox">
              <div className="GraveReservation-uploadLabel">
                <span>تصویر زنده برای احراز هویت </span>
              </div>

              {!showCamera && !livePhotoImage && (
                <div className="GraveReservation-uploadArea" onClick={startCamera}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <p>برای گرفتن سلفی کلیک کنید</p>
                  <small>دوربین فعال می‌شود - از خودتان عکس بگیرید</small>
                </div>
              )}

              {showCamera && (
                <div className="GraveReservation-cameraContainer">
                  <video
                    ref={videoRef}
                    className="GraveReservation-cameraVideo"
                    autoPlay
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div className="GraveReservation-cameraButtons">
                    <button className="GraveReservation-captureBtn" onClick={capturePhoto}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" fill="white" />
                      </svg>
                      گرفتن عکس
                    </button>
                    <button className="GraveReservation-cameraCloseBtn" onClick={closeCamera}>
                      بستن دوربین
                    </button>
                  </div>
                </div>
              )}

              {livePhotoImage && !showCamera && (
                <div className="GraveReservation-uploadArea">
                  <img src={livePhotoImage} alt="تصویر زنده" className="GraveReservation-uploadPreview" />
                  <button className="GraveReservation-retakeBtn" onClick={startCamera}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#039660" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    گرفتن مجدد
                  </button>
                </div>
              )}
            </div>
          </div>

          {uploadStatus && (
            <div className={`GraveReservation-uploadStatus ${uploadStatus.type}`}>
              {uploadStatus.type === 'pending' && <div className="GraveReservation-spinner"></div>}
              <span>{uploadStatus.message}</span>
            </div>
          )}

          <button className="GraveReservation-submitBtn" onClick={handleStage2Proceed} disabled={isVerifying}>
            {isVerifying ? 'در حال بررسی...' : 'ادامه'}
          </button>
        </div>
      )}

      {/* ============ STAGE 3 - WITH ORIGINAL MODAL DESIGN ============ */}
      {currentStep === 3 && (
        <div className="GraveReservation-stage GraveReservation-stage3">
          <div className="GraveReservation-mapHeader">
            <CustomSectionDropdown />
          </div>

          <div className="GraveReservation-mapWrapper">
            <div ref={mapContainerRef} className="GraveReservation-mapContainer" />
          </div>

          {/* Bottom Sliding Modal - ORIGINAL DESIGN RESTORED */}
          {showGraveModal && selectedGrave && (
            <div className="GraveReservation-graveModalOverlay" onClick={closeGraveModal}>
              <div className="GraveReservation-graveModalContent" onClick={(e) => e.stopPropagation()}>
                <button className="GraveReservation-modalCloseBtn" onClick={closeGraveModal}>×</button>
                <div className="GraveReservation-modalGraveDetails">
                  <div className="GraveReservation-selectedDetails">
                    <div className="GraveReservation-selectedItem">
                      <span className="value">{selectedGrave.section}</span>
                    </div>
                    <span className="modal-meta-divider">-</span>
                    <div className="GraveReservation-selectedItem">
                      <span className="label">ردیف</span>
                      <span className="value">{selectedGrave.row}</span>
                    </div>
                    <span className="modal-meta-divider">-</span>
                    <div className="GraveReservation-selectedItem">
                      <span className="label">شماره</span>
                      <span className="value">{selectedGrave.number}</span>
                    </div>
                  </div>
                  <div className="GraveReservation-selectedDetails2">
                    <div className="GraveReservation-selectedItem">
                      <p>مبلغ :</p>
                      <span>{selectedGrave.price.toLocaleString()} تومان</span>
                    </div>
                  </div>
                  <div className="GraveReservation-Temporarily">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                    <p>رزرو موقت</p>
                  </div>
                </div>
                <button className="GraveReservation-submitBtn" onClick={handleStage3Proceed}>
                  رزرو و پرداخت
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage 5 */}
      {currentStep === 5 && receiptData && (
        <div className="GraveReservation-stage GraveReservation-stage5">
          <div className="GraveReservation-receiptContainer" ref={receiptRef}>
            <div className="GraveReservation-receiptHeader">
              <div className="GraveReservation-successIcon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l3 3 6-6" />
                </svg>
              </div>
              <h2 className="GraveReservation-receiptTitle">رزرو با موفقیت انجام شد!</h2>
            </div>

            <div className="GraveReservation-receiptInfo">
              <div className="GraveReservation-receiptRow"><span className="label">شماره پیگیری:</span><span className="value">{receiptData.trackingNumber}</span></div>
              <div className="GraveReservation-receiptRow"><span className="label">مشخصات قبر:</span><span className="value">{receiptData.grave}</span></div>
              <div className="GraveReservation-receiptRow"><span className="label">مبلغ پرداختی:</span><span className="value">{receiptData.amount} تومان</span></div>
              <div className="GraveReservation-receiptRow"><span className="label">تاریخ:</span><span className="value">{receiptData.date}</span></div>
              <div className="GraveReservation-receiptRow"><span className="label">وضعیت:</span><span className="value status">{receiptData.status}</span></div>
            </div>

            <div className="GraveReservation-receiptButtons">
              <button className="GraveReservation-mapViewBtn" onClick={handleViewOnMap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                  <path d="M8 2v16" />
                  <path d="M16 6v16" />
                </svg>
                مشاهده روی نقشه
              </button>
              <button className="GraveReservation-downloadBtn" onClick={handleDownloadPDF}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                دانلود رسید
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Map Overlay */}
      {showReceiptMap && receiptData && (
        <div className="GraveReservation-receiptMapOverlay">
          <div className="GraveReservation-receiptMapContent">
            <div className="GraveReservation-receiptMapHeader">
              <h3>موقعیت قبر رزرو شده</h3>
              <button className="GraveReservation-receiptMapClose" onClick={closeReceiptMap}>×</button>
            </div>
            <div ref={receiptMapContainerRef} className="GraveReservation-receiptMapContainer" />
            <div className="GraveReservation-receiptMapInfo">
              <p>مبلغ: {receiptData.amount} تومان</p>
            </div>
          </div>
        </div>
      )}

      {/* Confetti */}
      {showConfetti && (
        <div className="GraveReservation-confetti">
          {confettiPieces.map((piece) => (
            <div key={piece.id} className={`GraveReservation-confettiPiece ${piece.type === 'square' ? 'square' : 'rectangle'}`} style={{ left: `${piece.left}%`, top: `${piece.top}%`, animationDelay: `${piece.delay}s`, animationDuration: `${piece.duration}s`, width: `${piece.size}px`, height: `${piece.type === 'square' ? piece.size : piece.size * 0.6}px`, backgroundColor: piece.color, transform: `rotate(${piece.rotation}deg)` }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GraveReservation;