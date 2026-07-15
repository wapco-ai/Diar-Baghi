// MapPage.jsx - Complete working version with image support, favourite feature, and memory feature
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/MapPage.css';

// TEMPORARILY ROUTING SYSTEM - Import the image
import s1Image from '../assets/images/s1.jpg';
import s2Image from '../assets/images/s2.png';
import s3Image from '../assets/images/s3.png';

const MapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const popupRef = useRef(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showAllGraves, setShowAllGraves] = useState(false);
  const [searchGrave, setSearchGrave] = useState('');
  const [activeView, setActiveView] = useState('map');
  const [fadeIn, setFadeIn] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailPerson, setDetailPerson] = useState(null);
  const [favouriteMessage, setFavouriteMessage] = useState(null);
  // New state for image overlay
  const [showImageOverlay, setShowImageOverlay] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);

  // Memory overlay states
  const [showMemoryOverlay, setShowMemoryOverlay] = useState(false);
  const [newMemory, setNewMemory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const MEMORIES_PER_PAGE = 5;

  // TEMPORARY FUNCTION FOR SESSION OF FAVOURITE PLACES - START
  const loadFavouritesFromSession = () => {
    const savedFavourites = sessionStorage.getItem('favourites_list');
    if (savedFavourites) {
      return JSON.parse(savedFavourites);
    }
    return [];
  };

  const saveFavouritesToSession = (favouritesData) => {
    sessionStorage.setItem('favourites_list', JSON.stringify(favouritesData));
  };

  const isGraveFavourite = (graveId) => {
    const favourites = loadFavouritesFromSession();
    return favourites.some(fav => fav.id === graveId);
  };

  const toggleFavourite = (grave) => {
    const favourites = loadFavouritesFromSession();
    const existingIndex = favourites.findIndex(fav => fav.id === grave.id);

    let updatedFavourites;
    let isAdding = false;

    if (existingIndex >= 0) {
      updatedFavourites = favourites.filter(fav => fav.id !== grave.id);
      isAdding = false;
    } else {
      const favouriteItem = {
        id: grave.id,
        name: grave.name,
        section: grave.section,
        row: grave.row,
        number: grave.number || '1',
        province: grave.province,
        city: grave.city,
        deathDate: grave.deathDate,
        image: grave.image || null,
        isReserved: false,
        reservationDate: null
      };
      updatedFavourites = [...favourites, favouriteItem];
      isAdding = true;
    }

    saveFavouritesToSession(updatedFavourites);
    showFavouriteMessage(grave.name, isAdding);
  };
  // TEMPORARY FUNCTION FOR SESSION OF FAVOURITE PLACES - END

  // Memory functions - START
  const loadMemoriesFromSession = (graveId) => {
    const savedMemories = sessionStorage.getItem(`memories_${graveId}`);
    if (savedMemories) {
      return JSON.parse(savedMemories);
    }
    return [];
  };

  const saveMemoriesToSession = (graveId, memories) => {
    sessionStorage.setItem(`memories_${graveId}`, JSON.stringify(memories));
  };

  const getCurrentUser = () => {
    const userData = sessionStorage.getItem('user_profile');
    if (userData) {
      return JSON.parse(userData);
    }
    return {
      name: 'کاربر ناشناس',
      phone: 'نامشخص',
      image: null
    };
  };

  const isCurrentUserMemory = (memory) => {
    const user = getCurrentUser();
    return memory.userName === user.name;
  };

  const handleSubmitMemory = () => {
    if (!newMemory.trim() || !detailPerson) return;

    const user = getCurrentUser();
    const memories = loadMemoriesFromSession(detailPerson.id);

    const memoryItem = {
      id: Date.now(),
      text: newMemory.trim(),
      userName: user.name,
      userImage: user.image || null,
      timestamp: new Date().toISOString(),
      isPinned: true // New memories are pinned for the current user
    };

    // Add new memory at the beginning (pinned)
    const updatedMemories = [memoryItem, ...memories];
    saveMemoriesToSession(detailPerson.id, updatedMemories);

    setNewMemory('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setCurrentPage(1); // Reset to first page after submission
  };

  const getMemoriesForDisplay = (graveId) => {
    const memories = loadMemoriesFromSession(graveId);
    const user = getCurrentUser();

    // Separate user's own memories (pinned) and others
    const userMemories = memories.filter(m => m.userName === user.name);
    const otherMemories = memories.filter(m => m.userName !== user.name);

    // Sort user memories by timestamp (newest first)
    userMemories.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    // Sort other memories by timestamp (newest first)
    otherMemories.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Combine: user memories first (pinned), then others
    return [...userMemories, ...otherMemories];
  };

  const getCurrentPageMemories = (graveId) => {
    const allMemories = getMemoriesForDisplay(graveId);
    const startIndex = 0;
    const endIndex = currentPage * MEMORIES_PER_PAGE;
    return allMemories.slice(startIndex, endIndex);
  };

  const getTotalMemories = (graveId) => {
    return getMemoriesForDisplay(graveId).length;
  };

  const handleShowMore = () => {
    setCurrentPage(prev => prev + 1);
  };
  // Memory functions - END

  // All graves in Behesht Reza, Mashhad
  const allGraves = [
    {
      id: 0,
      name: 'حمید رضا رحمانی میاندهی',
      section: 'بلوک 30',
      row: '13',
      number: '3',
      lat: 36.1675134665991,
      lng: 59.7000692302999,
      province: 'خراسان رضوی',
      city: 'مشهد',
      deathDate: '1393/07/25',
      image: s1Image
    },
    { id: 1, name: 'حسین  محمدی', section: 'بلوک 14', row: '8', number: '12', lat: 36.1691, lng: 59.7016, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1401/06/28', image: s3Image },
    { id: 2, name: 'محمدرضا ابراهیمی', section: 'بلوک 2', row: '8', number: '12', lat: 36.1680, lng: 59.6992, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1398/07/23', image: s2Image },
    { id: 3, name: 'محمد کریمی', section: 'بلوک 18', row: '2', number: '9', lat: 36.1670, lng: 59.7008, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1403/01/10' },
    { id: 4, name: 'زهرا محمدی', section: 'بلوک 14', row: '7', number: '4', lat: 36.1685, lng: 59.7002, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1400/12/05' },
    { id: 5, name: 'علی اکبری', section: 'بلوک 5', row: '1', number: '15', lat: 36.1668, lng: 59.6995, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1402/09/18' },
    { id: 6, name: 'مریم احمدی', section: 'بلوک 12', row: '4', number: '8', lat: 36.1679, lng: 59.7010, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1401/06/30' },
    { id: 7, name: 'رضا قاسمی', section: 'بلوک 2', row: '6', number: '11', lat: 36.1688, lng: 59.7007, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1403/02/14' },
    { id: 8, name: 'سارا نوری', section: 'بلوک 14', row: '8', number: '2', lat: 36.1672, lng: 59.6990, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1400/10/25' },
    { id: 9, name: 'حسین موسوی', section: 'بلوک 18', row: '3', number: '6', lat: 36.1690, lng: 59.7000, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1402/11/12' },
    { id: 10, name: 'نگار صادقی', section: 'بلوک 7', row: '5', number: '14', lat: 36.1665, lng: 59.7009, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1401/04/08' },
    { id: 11, name: 'امیر حسینی', section: 'بلوک 12', row: '2', number: '10', lat: 36.1692, lng: 59.7004, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1403/03/20' },
    { id: 12, name: 'لیلا کاظمی', section: 'بلوک 5', row: '4', number: '5', lat: 36.1676, lng: 59.7015, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1402/07/09' },
    { id: 13, name: 'مجید رحیمی', section: 'بلوک 2', row: '1', number: '13', lat: 36.1683, lng: 59.6988, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1401/12/28' },
    { id: 14, name: 'پریسا عباسی', section: 'بلوک 14', row: '6', number: '1', lat: 36.1662, lng: 59.7003, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1400/09/17' },
    { id: 15, name: 'سعید مرادی', section: 'بلوک 18', row: '7', number: '16', lat: 36.1695, lng: 59.6995, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1403/04/05' },
    { id: 16, name: 'مهسا رضایی', section: 'بلوک 12', row: '3', number: '9', lat: 36.1674, lng: 59.7020, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1402/10/03' },
    { id: 17, name: 'وحید علیپور', section: 'بلوک 7', row: '8', number: '7', lat: 36.1689, lng: 59.7012, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1401/05/14' },
    { id: 18, name: 'ندا محمدیان', section: 'بلوک 5', row: '2', number: '4', lat: 36.1660, lng: 59.6998, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1400/11/22' },
    { id: 19, name: 'بهرام شاهینی', section: 'بلوک 14', row: '5', number: '12', lat: 36.1698, lng: 59.7006, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1402/08/19' },
    { id: 20, name: 'گلناز احمدی', section: 'بلوک 2', row: '4', number: '8', lat: 36.1677, lng: 59.6985, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1403/06/01' },
    { id: 21, name: 'احمد رضایی', section: 'بلوک 12', row: '5', number: '7', lat: 36.1678, lng: 59.7005, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1402/05/15' },
    { id: 22, name: 'فاطمه حسینی', section: 'بلوک 7', row: '3', number: '12', lat: 36.1682, lng: 59.6998, province: 'خراسان رضوی', city: 'مشهد', deathDate: '1401/08/22' }
  ];

  // Show favourite message
  const showFavouriteMessage = (name, isAdding) => {
    const message = isAdding
      ? ` ${name} به لیست علاقه‌مندی‌ها اضافه شد`
      : `${name} از لیست علاقه‌مندی‌ها حذف شد`;
    setFavouriteMessage(message);
    setTimeout(() => {
      setFavouriteMessage(null);
    }, 3000);
  };

  // Handle image click to show overlay
  const handleImageClick = () => {
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
    setShowImageOverlay(true);
  };

  // Handle overlay click to close
  const handleOverlayClose = () => {
    setShowImageOverlay(false);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Handle zoom with mouse wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.min(Math.max(imageScale + delta, 1), 3);
    setImageScale(newScale);

    if (newScale === 1) {
      setImagePosition({ x: 0, y: 0 });
    } else {
      const imgElement = e.currentTarget?.querySelector('img');
      if (imgElement) {
        const container = imgElement.parentElement;
        const containerRect = container.getBoundingClientRect();
        const displayedWidth = imgElement.clientWidth;
        const displayedHeight = imgElement.clientHeight;

        const scaledWidth = displayedWidth * newScale;
        const scaledHeight = displayedHeight * newScale;
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
        const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

        setImagePosition(prev => ({
          x: Math.min(Math.max(prev.x, -maxX), maxX),
          y: Math.min(Math.max(prev.y, -maxY), maxY)
        }));
      }
    }
  };

  // Handle mouse/touch drag start
  const handleDragStart = (e) => {
    if (imageScale <= 1) return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
    setInitialPos({ x: imagePosition.x, y: imagePosition.y });
  };

  // Handle mouse/touch drag move
  const handleDragMove = (e) => {
    if (!isDragging || imageScale <= 1) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let newX = initialPos.x + (clientX - dragStart.x);
    let newY = initialPos.y + (clientY - dragStart.y);

    const imgElement = e.currentTarget;
    if (imgElement) {
      const container = imgElement.parentElement;
      const containerRect = container.getBoundingClientRect();

      const displayedWidth = imgElement.clientWidth;
      const displayedHeight = imgElement.clientHeight;

      const scaledWidth = displayedWidth * imageScale;
      const scaledHeight = displayedHeight * imageScale;

      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
      const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

      newX = Math.min(Math.max(newX, -maxX), maxX);
      newY = Math.min(Math.max(newY, -maxY), maxY);
    }

    setImagePosition({ x: newX, y: newY });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    setFadeIn(true);

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
      const matchingGrave = allGraves.find(g => g.id === person.id);
      if (matchingGrave) {
        setSelectedPerson(matchingGrave);
      } else {
        setSelectedPerson(allGraves[0]);
      }
    } else {
      setSelectedPerson(allGraves[0]);
    }
  }, [location.state]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',
      center: [59.696200, 36.167699],
      zoom: 15,
      attributionControl: false, 
      dragPan: true,
      scrollZoom: true,
      touchZoomRotate: true,
      dragRotate: false,
    });

    mapRef.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const createMarkerElement = (grave, isSelected) => {
    const markerElement = document.createElement('div');
    markerElement.className = `Mappage-customMarker ${isSelected ? 'selected' : ''}`;
    markerElement.setAttribute('data-id', grave.id);
    markerElement.setAttribute('data-selected', isSelected ? 'true' : 'false');

    if (isSelected) {
      markerElement.innerHTML = `
        <svg width="46" height="46" viewBox="0 0 24 24" fill="#0A865F" stroke="white" strokeWidth="2">
          <path d="M12 22c-2 0-8-7-8-10a8 8 0 1 1 16 0c0 3-6 10-8 10z"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>
      `;
    } else {
      markerElement.innerHTML = `
        <svg width="36" height="36" viewBox="0 0 24 24" fill="#f44336" stroke="white" strokeWidth="2">
          <path d="M12 22c-2 0-8-7-8-10a8 8 0 1 1 16 0c0 3-6 10-8 10z"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>
      `;
    }
    return markerElement;
  };

  const showPopupForGrave = (grave) => {
    if (!mapRef.current) return;

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    const isFav = isGraveFavourite(grave.id);
    const starFill = isFav ? '#FFD700' : 'none';

    const popupHTML = `
      <div class="Mappage-popup">
        <div class="Mappage-popupHeader">
          <h3>${grave.name}</h3>
          <button class="Mappage-popupFavouriteBtn ${isFav ? 'favourited' : ''}" id="popupFavouriteBtn" data-id="${grave.id}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${starFill}" stroke="#FFD700" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        </div>
        <div class="Mappage-popupContent">
          <p class="Mappage-popupSection">${grave.section} - ردیف ${grave.row} - شماره ${grave.number || '1'}</p>
          <p class="Mappage-popupLocation">${grave.province} - ${grave.city}</p>
          <div class="Mappage-popupButtons">
            <button class="Mappage-popupDetailBtn" id="popupDetailBtn">جزئیات</button>
            <button class="Mappage-popupRouteBtn" id="popupRouteBtn">مسیریابی</button>
          </div>
        </div>
      </div>
    `;

    const popup = new maplibregl.Popup({
      offset: 35,
      closeButton: false,
      closeOnClick: false,
      className: 'Mappage-customPopup'
    })
      .setLngLat([grave.lng, grave.lat])
      .setHTML(popupHTML)
      .addTo(mapRef.current);

    popupRef.current = popup;

    setTimeout(() => {
      const detailBtn = document.getElementById('popupDetailBtn');
      const routeBtn = document.getElementById('popupRouteBtn');
      const favouriteBtn = document.getElementById('popupFavouriteBtn');

      if (detailBtn) {
        detailBtn.onclick = () => {
          setDetailPerson(grave);
          setShowDetailModal(true);
        };
      }

      if (routeBtn) {
        routeBtn.onclick = () => {
          navigate('/detailpage', { state: { selectedPerson: grave } });
        };
      }

      if (favouriteBtn) {
        favouriteBtn.onclick = () => {
          toggleFavourite(grave);
          const svg = favouriteBtn.querySelector('svg');
          if (favouriteBtn.classList.contains('favourited')) {
            favouriteBtn.classList.remove('favourited');
            svg.setAttribute('fill', 'none');
          } else {
            favouriteBtn.classList.add('favourited');
            svg.setAttribute('fill', '#FFD700');
          }
        };
      }
    }, 50);
  };

  const handleNavigateToDetail = (grave) => {
    navigate('/detailpage', { state: { selectedPerson: grave } });
  };

  const updateMarkers = () => {
    if (!mapRef.current || !mapLoaded) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    allGraves.forEach((grave) => {
      const isSelected = selectedPerson?.id === grave.id;
      const markerElement = createMarkerElement(grave, isSelected);

      const marker = new maplibregl.Marker({ element: markerElement })
        .setLngLat([grave.lng, grave.lat])
        .addTo(mapRef.current);

      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();

        if (selectedPerson?.id !== grave.id) {
          setSelectedPerson(grave);
          sessionStorage.setItem('selectedPerson', JSON.stringify(grave));

          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }

          mapRef.current.flyTo({
            center: [grave.lng, grave.lat],
            zoom: 15,
            duration: 800,
            essential: true
          });

          setTimeout(() => {
            showPopupForGrave(grave);
          }, 850);
        } else {
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }
          showPopupForGrave(grave);
        }
      });

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      updateMarkers();
    }
  }, [mapLoaded, selectedPerson]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !selectedPerson || initialLoadComplete) return;

    const hasSelectedPerson = location.state?.selectedPerson || sessionStorage.getItem('selectedPerson');

    if (hasSelectedPerson) {
      mapRef.current.flyTo({
        center: [selectedPerson.lng, selectedPerson.lat],
        zoom: 15,
        duration: 1200,
        essential: true
      });

      const timeoutId = setTimeout(() => {
        showPopupForGrave(selectedPerson);
        setInitialLoadComplete(true);
      }, 1300);

      return () => clearTimeout(timeoutId);
    } else {
      const priorityPerson = allGraves[0];
      mapRef.current.flyTo({
        center: [priorityPerson.lng, priorityPerson.lat],
        zoom: 15,
        duration: 1200,
        essential: true
      });
      setInitialLoadComplete(true);
    }
  }, [mapLoaded, selectedPerson, initialLoadComplete, location.state]);

  const handleGraveSelect = (grave) => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    setSelectedPerson(grave);
    sessionStorage.setItem('selectedPerson', JSON.stringify(grave));
    setShowAllGraves(false);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [grave.lng, grave.lat],
        zoom: 15,
        duration: 1000,
        essential: true
      });

      setTimeout(() => {
        showPopupForGrave(grave);
      }, 1100);
    }
  };

  const handleBack = () => {
    navigate('/searchpage');
  };

  const handleViewToggle = (view) => {
    setActiveView(view);
  };

  const filteredGraves = allGraves.filter(grave =>
    grave.name.toLowerCase().includes(searchGrave.toLowerCase())
  );

  const orderedGraves = [...allGraves];
  if (selectedPerson) {
    const selectedIndex = orderedGraves.findIndex(g => g.id === selectedPerson.id);
    if (selectedIndex > 0) {
      const [selectedItem] = orderedGraves.splice(selectedIndex, 1);
      orderedGraves.unshift(selectedItem);
    }
  }
  const displayedGraves = orderedGraves.slice(0, 10);

  const orderedFilteredGraves = [...filteredGraves];
  if (selectedPerson) {
    const selectedIndex = orderedFilteredGraves.findIndex(g => g.id === selectedPerson.id);
    if (selectedIndex > 0) {
      const [selectedItem] = orderedFilteredGraves.splice(selectedIndex, 1);
      orderedFilteredGraves.unshift(selectedItem);
    }
  }

  return (
    <div className={`Mappage-container ${fadeIn ? 'fade-in' : ''}`}>
      {favouriteMessage && (
        <div className={`Mappage-favouriteToast ${favouriteMessage.includes('حذف') ? 'remove' : 'add'}`}>
          <span className="Mappage-favouriteToastIcon">
            {favouriteMessage.includes('حذف')}
          </span>
          <span>{favouriteMessage}</span>
        </div>
      )}

      <div className="Mappage-header">
        <div className="Mappage-headerIcons">
          <button
            className={`Mappage-iconButton ${activeView === 'menu' ? 'active' : ''}`}
            onClick={() => handleViewToggle('menu')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <button
            className={`Mappage-iconButton ${activeView === 'map' ? 'active' : ''}`}
            onClick={() => handleViewToggle('map')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
              <path d="M8 2v16" />
              <path d="M16 6v16" />
            </svg>
          </button>
        </div>
        <h1 className="Mappage-headerTitle">نتایج روی نقشه</h1>
        <button className="Mappage-backButton" onClick={handleBack}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {activeView === 'map' ? (
        <div className="Mappage-mapWrapper">
          <div ref={mapContainerRef} className="Mappage-mapContainer" />

          <button
            className="Mappage-TrackButton"
            onClick={() => {
              if (mapRef.current && selectedPerson) {
                if (popupRef.current) {
                  popupRef.current.remove();
                  popupRef.current = null;
                }
                mapRef.current.flyTo({
                  center: [selectedPerson.lng, selectedPerson.lat],
                  zoom: 15,
                  duration: 800,
                  essential: true
                });
                setTimeout(() => {
                  showPopupForGrave(selectedPerson);
                }, 900);
              }
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" />
            </svg>
          </button>

          <button
            className="Mappage-gpsButton"
            onClick={() => {
              if (mapRef.current && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    mapRef.current.flyTo({
                      center: [longitude, latitude],
                      zoom: 14,
                      duration: 800,
                      essential: true
                    });
                  },
                  (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your location. Please enable location services.');
                  }
                );
              } else if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser');
              }
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="2" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="Mappage-menuView">
          <div className="Mappage-menuContent">
            <h3>منوی اصلی</h3>
            <div className="Mappage-menuOptions">
              <button
                className="Mappage-menuOption"
                onClick={() => {
                  setShowAllGraves(true);
                  setActiveView('map');
                }}
              >
                مشاهده همه مزارها
              </button>
              <button
                className="Mappage-menuOption"
                onClick={() => {
                  if (mapRef.current && selectedPerson) {
                    setActiveView('map');
                    setTimeout(() => {
                      mapRef.current.flyTo({
                        center: [selectedPerson.lng, selectedPerson.lat],
                        zoom: 15,
                        duration: 800,
                        essential: true
                      });
                    }, 100);
                  }
                }}
              >
                نمایش مزار انتخاب شده
              </button>
              <button
                className="Mappage-menuOption"
                onClick={handleBack}
              >
                بازگشت به جستجو
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'map' && (
        <div className="Mappage-footer">
          <div className="Mappage-footerHeader">
            <h4>نتایج روی نقشه</h4>
            <button
              className="Mappage-showMoreButton"
              onClick={() => setShowAllGraves(true)}
            >
              مشاهده بیشتر
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
          <div className="Mappage-gravesList">
            {displayedGraves.map(grave => (
              <div
                key={grave.id}
                className={`Mappage-graveItem ${selectedPerson?.id === grave.id ? 'active' : ''}`}
                onClick={() => handleGraveSelect(grave)}
              >
                <div className="Mappage-graveImage">
                  {grave.image ? (
                    <img
                      src={grave.image}
                      alt={grave.name}
                      className="Mappage-graveRealImage"
                    />
                  ) : (
                    <div className="Mappage-graveImagePlaceholder"></div>
                  )}
                </div>
                <div className="Mappage-graveInfo">
                  <h5>{grave.name}</h5>
                </div>
                {selectedPerson?.id === grave.id && (
                  <div className="Mappage-selectedBadge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAllGraves && (
        <div className="Mappage-modal">
          <div className="Mappage-modalContent">
            <div className="Mappage-modalHeader">
              <h3>همه مزارها</h3>
              <button className="Mappage-modalClose" onClick={() => setShowAllGraves(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>
            <div className="Mappage-modalSearch">
              <input
                type="text"
                placeholder="جستجوی نام متوفی..."
                value={searchGrave}
                onChange={(e) => setSearchGrave(e.target.value)}
              />
            </div>
            <div className="Mappage-modalGrid">
              {orderedFilteredGraves.map(grave => (
                <div
                  key={grave.id}
                  className={`Mappage-modalGraveItem ${selectedPerson?.id === grave.id ? 'active' : ''}`}
                >
                  <div className="Mappage-modalGraveImage">
                    {grave.image ? (
                      <img
                        src={grave.image}
                        alt={grave.name}
                        className="Mappage-modalRealImage"
                      />
                    ) : (
                      <svg width="30" height="30" viewBox="0 0 24 24" fill={selectedPerson?.id === grave.id ? "#0A865F" : "#999"} stroke="white" strokeWidth="1">
                        <rect x="5" y="8" width="14" height="12" rx="1" />
                        <circle cx="12" cy="5" r="3" fill={selectedPerson?.id === grave.id ? "#0A865F" : "#999"} />
                      </svg>
                    )}
                    <div className="Mappage-modalGraveInfo">
                      <h4>{grave.name}</h4>
                      <p>{grave.section} - ردیف {grave.row} - شماره {grave.number || '1'}</p>
                      <p className="Mappage-modalGraveLocation">{grave.province} - {grave.city}</p>
                    </div>
                  </div>
                  <button
                    className="Mappage-modalRouteButton"
                    onClick={() => handleNavigateToDetail(grave)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M11.092 2.581a1 1 0 0 1 1.754 -.116l.062 .116l8.005 17.365c.198 .566 .05 1.196 -.378 1.615a1.53 1.53 0 0 1 -1.459 .393l-7.077 -2.398l-6.899 2.338a1.535 1.535 0 0 1 -1.52 -.231l-.112 -.1c-.398 -.386 -.556 -.954 -.393 -1.556l.047 -.15l7.97 -17.276z" />
                    </svg>
                    مسیریابی
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDetailModal && detailPerson && (
        <div className="Mappage-detailModalOverlay" onClick={() => setShowDetailModal(false)}>
          <div className="Mappage-detailModalContent" onClick={(e) => e.stopPropagation()}>
            <div className="Mappage-detailModalHeader">
              <h3>جزئیات مزار</h3>
            </div>
            <div className="Mappage-detailModalBody">
              <div className="Mappage-detailImageContainer">
                <div
                  className="Mappage-detailGraveImage"
                  onClick={handleImageClick}
                  style={{ cursor: 'pointer' }}
                >
                  {detailPerson.image ? (
                    <img
                      src={detailPerson.image}
                      alt={detailPerson.name}
                      className="Mappage-detailRealImage"
                    />
                  ) : (
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="#0A865F" stroke="white" strokeWidth="1">
                      <rect x="4" y="6" width="16" height="14" rx="2" />
                      <circle cx="12" cy="4" r="3" fill="#0A865F" />
                      <line x1="8" y1="11" x2="16" y2="11" stroke="white" strokeWidth="1.5" />
                      <line x1="12" y1="11" x2="12" y2="17" stroke="white" strokeWidth="1.5" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="Mappage-detailInfoSection">
                <div className="Mappage-detailInfoRow">
                  <span className="Mappage-detailInfoLabel">نام متوفی:</span>
                  <span className="Mappage-detailInfoValue">{detailPerson.name}</span>
                </div>
                <div className="Mappage-detailInfoRow">
                  <span className="Mappage-detailInfoLabel">بلوک:</span>
                  <span className="Mappage-detailInfoValue">{detailPerson.section}</span>
                </div>
                <div className="Mappage-detailInfoRow">
                  <span className="Mappage-detailInfoLabel">ردیف:</span>
                  <span className="Mappage-detailInfoValue">{detailPerson.row}</span>
                </div>
                <div className="Mappage-detailInfoRow">
                  <span className="Mappage-detailInfoLabel">شماره قبر:</span>
                  <span className="Mappage-detailInfoValue">{detailPerson.number || '1'}</span>
                </div>
                <div className="Mappage-detailInfoRow">
                  <span className="Mappage-detailInfoLabel">استان:</span>
                  <span className="Mappage-detailInfoValue">{detailPerson.province}</span>
                </div>
                <div className="Mappage-detailInfoRow">
                  <span className="Mappage-detailInfoLabel">شهر:</span>
                  <span className="Mappage-detailInfoValue">{detailPerson.city}</span>
                </div>
                <div className="Mappage-detailInfoRow">
                  <span className="Mappage-detailInfoLabel">تاریخ فوت:</span>
                  <span className="Mappage-detailInfoValue">{detailPerson.deathDate}</span>
                </div>
              </div>

              <div className="Mappage-detailActions">
                <button
                  className="Mappage-detailRouteBtn"
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate('/detailpage', { state: { selectedPerson: detailPerson } });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M11.092 2.581a1 1 0 0 1 1.754 -.116l.062 .116l8.005 17.365c.198 .566 .05 1.196 -.378 1.615a1.53 1.53 0 0 1 -1.459 .393l-7.077 -2.398l-6.899 2.338a1.535 1.535 0 0 1 -1.52 -.231l-.112 -.1c-.398 -.386 -.556 -.954 -.393 -1.556l.047 -.15l7.97 -17.276z" />
                  </svg>
                  مسیریابی
                </button>
                <button
                  className="Mappage-detailMemoryBtn"
                  onClick={() => {
                    setShowMemoryOverlay(true);
                    setCurrentPage(1);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  خاطرات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Overlay */}
      {showImageOverlay && detailPerson?.image && (
        <div
          className="Mappage-imageOverlay"
          onClick={handleOverlayClose}
        >
          <div
            className="Mappage-imageOverlayContent"
            ref={imageContainerRef}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
          >
            <img
              src={detailPerson.image}
              alt={detailPerson.name}
              className="Mappage-imageOverlayImg"
              style={{
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                cursor: imageScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                transformOrigin: 'center center'
              }}
              draggable={false}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            />
          </div>
        </div>
      )}

      {/* Memory Overlay */}
      {showMemoryOverlay && detailPerson && (
        <div className="Mappage-memoryOverlay">
          <div className="Mappage-memoryOverlayContent">
            {/* Header with back arrow */}
            <div className="Mappage-memoryHeader">
              <h2 className="Mappage-memoryTitle">
                خاطرات مرحوم {detailPerson.name}
              </h2>
              <button
                className="Mappage-memoryBackBtn"
                onClick={() => setShowMemoryOverlay(false)}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="Mappage-memoryBody">
              {/* Write memory section */}
              <div className="Mappage-memoryWriteSection">
                <textarea
                  className="Mappage-memoryTextarea"
                  placeholder="خاطره خود را از این مرحوم بنویسید..."
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  rows={3}
                />
                <button
                  className="Mappage-memorySubmitBtn"
                  onClick={handleSubmitMemory}
                  disabled={!newMemory.trim()}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  ثبت خاطره
                </button>
                {submitted && (
                  <div className="Mappage-memorySubmitted">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A865F" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    خاطره با موفقیت ثبت شد
                  </div>
                )}
              </div>

              {/* Display memories section */}
              <div className="Mappage-memoryListSection">
                <div className="Mappage-memoryListHeader">
                  <span className="Mappage-memoryCount">
                    {getTotalMemories(detailPerson.id)} خاطره
                  </span>
                </div>

                <div className="Mappage-memoryList">
                  {getCurrentPageMemories(detailPerson.id).length === 0 ? (
                    <div className="Mappage-memoryEmpty">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#BCA371" strokeWidth="1.5">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      <p>هنوز خاطره‌ای ثبت نشده است</p>
                      <span>اولین خاطره را شما بنویسید</span>
                    </div>
                  ) : (
                    getCurrentPageMemories(detailPerson.id).map((memory, index) => {
                      const isPinned = isCurrentUserMemory(memory);
                      return (
                        <div
                          key={memory.id}
                          className={`Mappage-memoryItem ${isPinned ? 'pinned' : ''}`}
                        >
                          <div className="Mappage-memoryUserInfo">
                            <div className="Mappage-memoryAvatar">
                              {memory.userImage ? (
                                <img src={memory.userImage} alt={memory.userName} />
                              ) : (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="#0A865F" stroke="white" strokeWidth="1">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              )}
                            </div>
                            <div className="Mappage-memoryUserName">
                              {memory.userName}
                              {isPinned && (
                                <span className="Mappage-memoryPinnedBadge">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700" stroke="none">
                                    <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" />
                                  </svg>
                                  خاطره شما
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="Mappage-memoryText">{memory.text}</p>
                          <span className="Mappage-memoryTimestamp">
                            {new Date(memory.timestamp).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {getTotalMemories(detailPerson.id) > currentPage * MEMORIES_PER_PAGE && (
                  <button
                    className="Mappage-memoryShowMore"
                    onClick={handleShowMore}
                  >
                    نمایش بیشتر
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;