import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import logo from '../assets/images/main_logo2.png';
import feedbackLogo from '../assets/images/logo4.png';
import c1 from '../assets/images/c1.png';
import c2 from '../assets/images/c2.png';
import c3 from '../assets/images/c3.png';
import '../styles/MainPage.css';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

const MainPage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState('خانه');
  const [mapError, setMapError] = useState(false);
  const fileInputRef = useRef(null);

  // --- Carousel State ---
  const [currentSlide, setCurrentSlide] = useState(2);
  const [fadeState, setFadeState] = useState('visible');
  const slides = [c3, c2, c1];
  const slideChangeTimeout = useRef(null);
  const fadeTimeout = useRef(null);

  // --- Feedback Form State ---
  const [feedbackAnswers, setFeedbackAnswers] = useState({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    q6: null,
    q7: null,
    q8: null,
  });
  const [additionalOpinion, setAdditionalOpinion] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);

  // --- Profile State ---
  const [userPhone, setUserPhone] = useState('۰۹۱۲۳۴۵۶۷۸۹');
  const [userName, setUserName] = useState('کاربر دیار باقی');
  const [userNationalId, setUserNationalId] = useState('۱۲۳۴۵۶۷۸۹۰');
  const [userBirthDate, setUserBirthDate] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState(userPhone);
  const [editName, setEditName] = useState(userName);
  const [editNationalId, setEditNationalId] = useState(userNationalId);
  const [editBirthDate, setEditBirthDate] = useState(userBirthDate);
  const [profileImage, setProfileImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Settings State ---
  const [settings, setSettings] = useState({
    language: 'fa',
    dateFormat: 'shamsi',
    notifications: true,
    nightMode: false,
    themeColor: 'green',
  });

  // New survey questions as specified (with "بود" and "بودند" removed)
  const feedbackQuestions = [
    { 
      id: 'q1', 
      text: 'نحوه برخورد، همراهی و همدلی کارکنان و پرسنل مجموعه با شما و خانواده محترم چگونه بود؟',
      options: ['خیلی خوب', 'خوب', 'متوسط', 'ضعیف', 'بسیار ضعیف']
    },
    { 
      id: 'q2', 
      text: 'سرعت انجام مراحل اداری و امور مربوط به متوفی در واحد پذیرش چگونه بود؟',
      options: ['خیلی خوب', 'خوب', 'برخی مراحل خوب', 'معطل شدیم', 'بسیار کند']
    },
    { 
      id: 'q3', 
      text: 'میزان پاسخگویی شفاف کارکنان و دسترسی به آنان در هنگام نیاز و درخواست شما چگونه بود؟',
      options: ['خیلی خوب', 'خوب', 'فقط برخی کارکنان خوب', 'ضعیف', 'برخوردی نداشتم']
    },
    { 
      id: 'q4', 
      text: 'به نظر شما آراستگی آرامستان در بخش های فضای سبز، سرویس های بهداشتی و نمازخانه ها چگونه بود ؟',
      options: ['خیلی خوب', 'خوب', 'دقت نکردم', 'معمولی', 'ضعیف']
    },
    { 
      id: 'q5', 
      text: 'کیفیت و کمیت خدمات عمرانی مانند بلوک های جدید، پارکینگهای خودرو و پارکهای بازی کودکان چگونه بود؟',
      options: ['خیلی خوب', 'خوب', 'استفاده نکردم', 'معمولی', 'ضعیف']
    },
    { 
      id: 'q6', 
      text: 'کیفیت و کمیت ارائه خدمات در مرکز اعزام آمبولانس(کیفیت خودرو، اخلاق و رفتار راننده، تاخیر و معطلی و...) چگونه بود؟',
      options: ['خیلی خوب', 'خوب', 'استفاده نکردم', 'معمولی', 'ضعیف']
    },
    { 
      id: 'q7', 
      text: 'در مجموع میزان رضایت شما از نتایج خدمات ارائه شده در مراحل تجهیز میت (تغسیل،تکفین و تدفین) چگونه بود؟',
      options: ['خیلی خوب', 'خوب', 'متوسط', 'ضعیف', 'بسیار ضعیف']
    },
    { 
      id: 'q8', 
      text: 'به نظر شما در مقایسه با سال و سالیان قبل، بطور کلی محیط آرامستان و خدمات مربوط به متوفی چه تغییراتی داشته است؟',
      options: ['بسیار بهتر شده', 'بهتر شده', 'فرقی نداشته', 'بدتر شده', 'نظری ندارم']
    },
  ];

  const handleFeedbackChange = (questionId, value) => {
    setFeedbackAnswers(prev => ({ ...prev, [questionId]: value }));
    setFeedbackError(false);
  };

  const handleSubmitFeedback = () => {
    const allAnswered = Object.values(feedbackAnswers).every(answer => answer !== null);
    if (!allAnswered) {
      setFeedbackError(true);
      return;
    }
    setFeedbackError(false);
    setFeedbackSubmitted(true);
    console.log('Feedback submitted:', { feedbackAnswers, additionalOpinion });

    setTimeout(() => {
      setActiveMenu('خانه');
      setFeedbackSubmitted(false);
      setFeedbackAnswers({
        q1: null,
        q2: null,
        q3: null,
        q4: null,
        q5: null,
        q6: null,
        q7: null,
        q8: null,
      });
      setAdditionalOpinion('');
    }, 3000);
  };

  // --- Profile Handlers ---
  const handleSaveProfile = () => {
    setUserPhone(editPhone);
    setUserName(editName);
    setUserNationalId(editNationalId);
    setUserBirthDate(editBirthDate);
    setIsEditingProfile(false);
    setShowDatePicker(false);
  };

  const handleCancelEdit = () => {
    setEditPhone(userPhone);
    setEditName(userName);
    setEditNationalId(userNationalId);
    setEditBirthDate(userBirthDate);
    setIsEditingProfile(false);
    setShowDatePicker(false);
  };

  const handleLogout = () => {
    if (window.confirm('آیا از خروج از حساب کاربری خود مطمئن هستید؟')) {
      alert('شما از حساب کاربری خود خارج شدید');
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // --- Profile Image Handlers ---
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'نامشخص';
    const year = date.year;
    const month = date.month.number < 10 ? `0${date.month.number}` : date.month.number;
    const day = date.day < 10 ? `0${date.day}` : date.day;
    return `${year}/${month}/${day}`;
  };

  // --- Carousel Handlers with Fade Effect ---
  const goToSlide = (index) => {
    if (index === currentSlide) return;

    setFadeState('fading');

    if (slideChangeTimeout.current) {
      clearTimeout(slideChangeTimeout.current);
    }
    if (fadeTimeout.current) {
      clearTimeout(fadeTimeout.current);
    }

    fadeTimeout.current = setTimeout(() => {
      setCurrentSlide(index);
      setFadeState('visible');
    }, 300);
  };

  const nextSlide = () => {
    const nextIndex = (currentSlide + 1) % slides.length;
    goToSlide(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (slideChangeTimeout.current) {
        clearTimeout(slideChangeTimeout.current);
      }
      if (fadeTimeout.current) {
        clearTimeout(fadeTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeMenu === 'خانه') {
        const nextIndex = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(nextIndex);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeMenu, currentSlide, slides.length]);

  // --- Map Initialization ---
  useEffect(() => {
    if (activeMenu !== 'نقشه') return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      try {
        const mapStyle = 'https://tiles.stadiamaps.com/styles/alidade_smooth.json';

        mapRef.current = new maplibregl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          attributionControl: false, 
          center: [59.696200, 36.167699],
          zoom: 14,
        });

        mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        mapRef.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
        mapRef.current.addControl(new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }), 'top-right');

        mapRef.current.on('load', () => {
          if (mapRef.current) {
            mapRef.current.touchZoomRotate.enable();
            mapRef.current.scrollZoom.enable();
            mapRef.current.dragRotate.enable();
            mapRef.current.keyboard.enable();
            mapRef.current.doubleClickZoom.enable();
          }
        });

        mapRef.current.on('error', () => {
          setMapError(true);
        });

      } catch (err) {
        console.error('Failed to initialize map:', err);
        setMapError(true);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeMenu]);

  // --- Menu Items Configuration ---
  const menuItems = [
    { id: 'پروفایل', label: 'پروفایل', icon: 'profile' },
    { id: 'نظر سنجی', label: 'نظر سنجی', icon: 'feedback' },
    { id: 'نقشه', label: 'نقشه', icon: 'map' },
    { id: 'خانه', label: 'خانه', icon: 'home' },
  ];

  const handleNavigateToHelp = () => navigate('/HelpPage');
  const handleNavigateToSearch = () => navigate('/SearchPage');
  const handleNavigateToGrave = () => navigate('/GraveReservation');
  const handleNavigateToFavourites = () => navigate('/FavouritePage');
  const handleNavigateToReminder = () => navigate('/ReminderPage');

  const renderMenuIcon = (iconType, isActive) => {
    const unselectedColor = '#3E6958';
    const selectedColor = '#D7B770';
    const color = isActive ? selectedColor : unselectedColor;

    switch (iconType) {
      case 'home':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case 'map':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
            <path d="M8 2v16" />
            <path d="M16 6v16" />
          </svg>
        );
      case 'services':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case 'feedback':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case 'profile':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    // --- Profile Tab Content ---
    if (activeMenu === 'پروفایل') {
      return (
        <div className="Mainpage-profileContainer">
          <div className="Mainpage-profileHeader">
            <div className="warm-glow warm-glow-1"></div>
            <div className="warm-glow warm-glow-2"></div>
            <div className="Mainpage-profileAvatar" onClick={handleAvatarClick}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="Mainpage-profileAvatarImage" />
              ) : (
                <svg width="50" height="50" viewBox="0 0 24 24" fill="#2c5a4a" stroke="white" strokeWidth="1">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
              <div className="Mainpage-profileAvatarOverlay">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="Mainpage-profileAvatarInput"
              />
            </div>
            <div className="Mainpage-profileUserInfo">
              <h2>{userName}</h2>
              <p>{userPhone}</p>
              <span className="Mainpage-profileBadge">کاربر فعال</span>
            </div>
          </div>

          <div className="Mainpage-profileActions">
            <button className="Mainpage-profileActionBtn" onClick={() => navigate('/FavouritePage')}>
              <div className="Mainpage-profileActionIcon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8">
                  <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
                </svg>
              </div>
              <span>مزارهای ذخیره شده </span>
            </button>
            <button className="Mainpage-profileActionBtn" onClick={() => setActiveMenu('نظر سنجی')}>
              <div className="Mainpage-profileActionIcon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <span>نظرسنجی</span>
            </button>
            <button className="Mainpage-profileActionBtn">
              <div className="Mainpage-profileActionIcon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-amigo"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M9.591 3.635l-7.13 14.082c-1.712 3.38 1.759 5.45 3.69 3.573l1.86 -1.81c3.142 -3.054 4.959 -2.99 8.039 .11l1.329 1.337c2.372 2.387 5.865 .078 4.176 -3.225l-7.195 -14.067c-1.114 -2.18 -3.666 -2.18 -4.77 0" /></svg>
              </div>
              <span>پشتیبانی</span>
            </button>
          </div>

          <div className="Mainpage-profileSection">
            <div className="Mainpage-sectionHeader">
              <h3>اطلاعات حساب کاربری</h3>
              <div className="Mainpage-sectionLine"></div>
            </div>
            <div className="Mainpage-profileInfoRow">
              <span className="Mainpage-profileInfoLabel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                نام کاربری
              </span>
              {isEditingProfile ? (
                <input
                  type="text"
                  className="Mainpage-profileInput username-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  dir="rtl"
                />
              ) : (
                <span className="Mainpage-profileInfoValue">{userName}</span>
              )}
            </div>
            <div className="Mainpage-profileInfoRow">
              <span className="Mainpage-profileInfoLabel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8">
                  <path d="M4 4h16v16H4z" />
                  <path d="M4 8h16" />
                  <path d="M8 4v16" />
                </svg>
                شماره موبایل
              </span>
              {isEditingProfile ? (
                <input
                  type="text"
                  className="Mainpage-profileInput phone-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  dir="ltr"
                />
              ) : (
                <span className="Mainpage-profileInfoValue">{userPhone}</span>
              )}
            </div>
            <div className="Mainpage-profileInfoRow">
              <span className="Mainpage-profileInfoLabel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                کد ملی
              </span>
              {isEditingProfile ? (
                <input
                  type="text"
                  className="Mainpage-profileInput national-id-input"
                  value={editNationalId}
                  onChange={(e) => setEditNationalId(e.target.value)}
                  dir="ltr"
                  maxLength="10"
                />
              ) : (
                <span className="Mainpage-profileInfoValue">{userNationalId}</span>
              )}
            </div>
            <div className="Mainpage-profileInfoRow">
              <span className="Mainpage-profileInfoLabel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="3" y1="14" x2="21" y2="14" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                  <line x1="7" y1="14" x2="7" y2="18" />
                  <line x1="11" y1="14" x2="11" y2="18" />
                  <line x1="15" y1="14" x2="15" y2="18" />
                </svg>
                تاریخ تولد
              </span>
              {isEditingProfile ? (
                <div className="Mainpage-datePickerWrapper">
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    value={editBirthDate}
                    onChange={(date) => {
                      if (date) {
                        setEditBirthDate(date);
                      }
                    }}
                    format="YYYY/MM/DD"
                    containerClassName="Mainpage-datePickerContainer"
                    render={(value, openCalendar) => (
                      <div
                        className="Mainpage-datePickerTrigger"
                        onClick={openCalendar}
                      >
                        <span>{editBirthDate ? formatDate(editBirthDate) : 'انتخاب تاریخ'}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7a6a4a" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    )}
                  />
                </div>
              ) : (
                <span className="Mainpage-profileInfoValue">
                  {userBirthDate ? formatDate(userBirthDate) : 'نامشخص'}
                </span>
              )}
            </div>
            {isEditingProfile ? (
              <div className="Mainpage-profileEditActions">
                <button className="Mainpage-profileSaveBtn" onClick={handleSaveProfile}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  ذخیره
                </button>
                <button className="Mainpage-profileCancelBtn" onClick={handleCancelEdit}>انصراف</button>
              </div>
            ) : (
              <button className="Mainpage-profileEditBtn" onClick={() => setIsEditingProfile(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                ویرایش اطلاعات
              </button>
            )}
          </div>

          <div className="Mainpage-profileSection">
            <div className="Mainpage-sectionHeader">
              <h3>تنظیمات</h3>
              <div className="Mainpage-sectionLine"></div>
            </div>

            <div className="Mainpage-profileMenuItem">
              <div className="Mainpage-profileMenuItemLeft">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>تاریخ و زمان</span>
              </div>
              <div className="Mainpage-profileMenuItemRight">
                <button
                  className={`Mainpage-settingBtn ${settings.dateFormat === 'shamsi' ? 'active' : ''}`}
                  onClick={() => handleSettingChange('dateFormat', 'shamsi')}
                >
                  شمسی
                </button>
                <button
                  className={`Mainpage-settingBtn ${settings.dateFormat === 'miladi' ? 'active' : ''}`}
                  onClick={() => handleSettingChange('dateFormat', 'miladi')}
                >
                  میلادی
                </button>
              </div>
            </div>

            <div className="Mainpage-profileMenuItem">
              <div className="Mainpage-profileMenuItemLeft">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>زبان</span>
              </div>
              <div className="Mainpage-profileMenuItemRight language-options">
                <button
                  className={`Mainpage-settingBtn ${settings.language === 'fa' ? 'active' : ''}`}
                  onClick={() => handleSettingChange('language', 'fa')}
                >
                  فارسی
                </button>
                <button
                  className={`Mainpage-settingBtn ${settings.language === 'en' ? 'active' : ''}`}
                  onClick={() => handleSettingChange('language', 'en')}
                >
                  English
                </button>
                <button
                  className={`Mainpage-settingBtn ${settings.language === 'ur' ? 'active' : ''}`}
                  onClick={() => handleSettingChange('language', 'ur')}
                >
                  اردو
                </button>
                <button
                  className={`Mainpage-settingBtn ${settings.language === 'ar' ? 'active' : ''}`}
                  onClick={() => handleSettingChange('language', 'ar')}
                >
                  العربية
                </button>
              </div>
            </div>

            <div className="Mainpage-profileMenuItem">
              <div className="Mainpage-profileMenuItemLeft">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>اعلان‌ها</span>
              </div>
              <div className="Mainpage-profileMenuItemRight">
                <button
                  className={`Mainpage-settingBtn ${settings.notifications ? 'active' : ''}`}
                  onClick={() => handleSettingChange('notifications', !settings.notifications)}
                >
                  {settings.notifications ? 'فعال' : 'غیرفعال'}
                </button>
              </div>
            </div>

            <div className="Mainpage-profileMenuItem">
              <div className="Mainpage-profileMenuItemLeft">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8">
                  <path d="M12 2v4" />
                  <path d="M12 22v-4" />
                  <path d="M4 12H2" />
                  <path d="M22 12h-2" />
                  <path d="M19.07 4.93l-2.83 2.83" />
                  <path d="M4.93 19.07l2.83-2.83" />
                  <path d="M19.07 19.07l-2.83-2.83" />
                  <path d="M4.93 4.93l2.83 2.83" />
                </svg>
                <span>حالت شب</span>
              </div>
              <div className="Mainpage-profileMenuItemRight">
                <button
                  className={`Mainpage-settingBtn ${settings.nightMode ? 'active' : ''}`}
                  onClick={() => handleSettingChange('nightMode', !settings.nightMode)}
                >
                  {settings.nightMode ? 'فعال' : 'غیرفعال'}
                </button>
              </div>
            </div>

            <div className="Mainpage-profileMenuItem">
              <div className="Mainpage-profileMenuItemLeft">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a10 10 0 0 1 0 20" />
                  <path d="M12 2a10 10 0 0 0 0 20" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
                <span>رنگ تم</span>
              </div>
              <div className="Mainpage-profileMenuItemRight">
                <button
                  className={`Mainpage-colorBtn ${settings.themeColor === 'green' ? 'active' : ''}`}
                  style={{ background: '#05543E' }}
                  onClick={() => handleSettingChange('themeColor', 'green')}
                />
                <button
                  className={`Mainpage-colorBtn ${settings.themeColor === 'gold' ? 'active' : ''}`}
                  style={{ background: '#BF9A61' }}
                  onClick={() => handleSettingChange('themeColor', 'gold')}
                />
                <button
                  className={`Mainpage-colorBtn ${settings.themeColor === 'dark' ? 'active' : ''}`}
                  style={{ background: '#1a1a2e' }}
                  onClick={() => handleSettingChange('themeColor', 'dark')}
                />
                <button
                  className={`Mainpage-colorBtn ${settings.themeColor === 'blue' ? 'active' : ''}`}
                  style={{ background: '#1a6a8a' }}
                  onClick={() => handleSettingChange('themeColor', 'blue')}
                />
              </div>
            </div>
          </div>

          <button className="Mainpage-profileLogoutBtn" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            خروج از حساب کاربری
          </button>
        </div>
      );
    }

    // --- Feedback Tab Content ---
    if (activeMenu === 'نظر سنجی') {
      return (
        <div className="Mainpage-feedbackContainer">
          <div className="Mainpage-feedbackHero">
            <div className="Mainpage-feedbackHeroPattern">
              <svg className="Mainpage-patternSvg" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path d="M0,0 L20,10 L40,0 L60,10 L80,0 L100,10 L120,0 L140,10 L160,0 L180,10 L200,0 L200,100 L180,90 L160,100 L140,90 L120,100 L100,90 L80,100 L60,90 L40,100 L20,90 L0,100 Z" fill="rgba(255,255,255,0.08)" />
                <path d="M0,20 L20,30 L40,20 L60,30 L80,20 L100,30 L120,20 L140,30 L160,20 L180,30 L200,20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <path d="M0,60 L20,70 L40,60 L60,70 L80,60 L100,70 L120,60 L140,70 L160,60 L180,70 L200,60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              </svg>
            </div>
            <img src={feedbackLogo} alt="دیار باقی" className="Mainpage-feedbackLogo4" />
          </div>

          <div className="Mainpage-feedbackFormWrapper">
            <div className="Mainpage-feedbackForm">
              <div className="Mainpage-formOrnament">
                <svg width="60" height="20" viewBox="0 0 120 20" className="Mainpage-ornamentTop">
                  <path d="M0,10 Q15,0 30,10 Q45,20 60,10 Q75,0 90,10 Q105,20 120,10" fill="none" stroke="#BF9A61" strokeWidth="1.5" />
                  <path d="M10,10 L20,5 L30,10 L40,5 L50,10 L60,5 L70,10 L80,5 L90,10 L100,5 L110,10" fill="none" stroke="#EDD79D" strokeWidth="1" />
                </svg>
              </div>

              <div className="Mainpage-formTitle">
                <h2>فرم نظرسنجی</h2>
                <p>نظرات ارزشمند شما به بهبود خدمات ما کمک می‌کند</p>
              </div>

              {feedbackSubmitted ? (
                <div className="Mainpage-feedbackSuccess">
                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#BF9A61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p>نظرات شما با موفقیت ثبت شد</p>
                  <p className="Mainpage-feedbackSuccessSub">در حال انتقال به صفحه اصلی...</p>
                </div>
              ) : (
                <>
                  {feedbackError && (
                    <div className="Mainpage-feedbackErrorMsg">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      لطفاً به تمام سوالات پاسخ دهید
                    </div>
                  )}

                  {feedbackQuestions.map((question, idx) => (
                    <div key={question.id} className="Mainpage-feedbackQuestion">
                      <div className="Mainpage-questionNumber">{idx + 1}</div>
                      <p className="Mainpage-questionText">{question.text}</p>
                      <div className="Mainpage-ratingOptions">
                        {question.options.map((optionLabel, optionIndex) => {
                          const optionValue = optionIndex + 1;
                          return (
                            <label
                              key={optionValue}
                              className={`Mainpage-ratingLabel ${feedbackAnswers[question.id] === optionValue ? 'selected' : ''
                                }`}
                              onClick={() => handleFeedbackChange(question.id, optionValue)}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={optionValue}
                                checked={feedbackAnswers[question.id] === optionValue}
                                onChange={() => {}}
                                className="Mainpage-ratingRadio"
                              />
                              <span>{optionLabel}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="Mainpage-feedbackQuestion">
                    <div className="Mainpage-questionNumber">۹</div>
                    <p className="Mainpage-questionText">
                      در پایان چنانچه انتقاد یا پیشنهاد و مورد خاصی جهت پیگیری دارید مرقوم بفرمایید. (مطالب شما نزد ما به امانت می ماند)
                    </p>
                    <textarea
                      className="Mainpage-feedbackTextarea"
                      placeholder="لطفاً انتقاد، پیشنهاد یا مورد خاص خود را با ما به اشتراک بگذارید..."
                      value={additionalOpinion}
                      onChange={(e) => setAdditionalOpinion(e.target.value)}
                      rows={5}
                    />
                  </div>

                  <button className="Mainpage-feedbackSubmitBtn" onClick={handleSubmitFeedback}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13" />
                      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                    ثبت نظرات
                  </button>
                </>
              )}

              <div className="Mainpage-formOrnamentBottom">
                <svg width="80" height="16" viewBox="0 0 160 16" className="Mainpage-ornamentBottom">
                  <path d="M0,8 C20,0 40,16 60,8 C80,0 100,16 120,8 C140,0 160,8 160,8" fill="none" stroke="#BF9A61" strokeWidth="1.2" />
                  <circle cx="80" cy="8" r="3" fill="#EDD79D" stroke="#BF9A61" strokeWidth="1" />
                  <circle cx="40" cy="8" r="2" fill="none" stroke="#BF9A61" strokeWidth="1" />
                  <circle cx="120" cy="8" r="2" fill="none" stroke="#BF9A61" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- Map Tab Content ---
    if (activeMenu === 'نقشه') {
      return (
        <div className="Mainpage-mapOnlyContainer">
          <div className="Mainpage-logoArea">
            <img src={logo} alt="دیار باقی" className="Mainpage-logo-c" />
          </div>

          <div className="Mainpage-mapSection">
            {mapError ? (
              <div className="Mainpage-mapPlaceholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#BCA371" strokeWidth="1.5">
                  <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                  <path d="M8 2v16" />
                  <path d="M16 6v16" />
                </svg>
                <p>نقشه در حال بارگذاری...</p>
              </div>
            ) : (
              <div ref={mapContainerRef} className="Mainpage-mapContainer" />
            )}
          </div>
        </div>
      );
    }

    // --- Home Tab Content (with Carousel) ---
    if (activeMenu === 'خانه') {
      return (
        <>
          <div className="Mainpage-logoArea">
            <img src={logo} alt="دیار باقی" className="Mainpage-logo-c" />
          </div>

          <div className="Mainpage-searchContainer">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A5F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="Mainpage-searchIcon">
              <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
              <path d="M21 21l-6 -6" />
            </svg>
            <input
              type="text"
              placeholder="جستجوی نام متوفی..."
              className="Mainpage-searchInput"
              onClick={() => navigate('/SearchPage')}
              readOnly
            />
          </div>

          <div className="Mainpage-carouselSection">
            <div className="Mainpage-carouselContainer">
              <button className="Mainpage-carouselArrow Mainpage-carouselArrowLeft" onClick={nextSlide}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div className="Mainpage-carouselSlide">
                <img
                  src={slides[currentSlide]}
                  alt={`Slide ${currentSlide - 1}`}
                  className={`Mainpage-carouselImage ${fadeState === 'fading' ? 'fade-out' : 'fade-in'}`}
                />
              </div>

              <button className="Mainpage-carouselArrow Mainpage-carouselArrowRight" onClick={prevSlide}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="Mainpage-carouselDots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`Mainpage-carouselDot ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>

          <div className="Mainpage-servicesGrid">
            <div className="Mainpage-serviceCard" onClick={handleNavigateToGrave}>
              <div className="Mainpage-serviceIcon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                  <path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2" />
                  <path d="M9 12h6" />
                  <path d="M9 16h6" />
                </svg>
              </div>
              <span className="Mainpage-serviceLabel">رزرو قبر</span>
            </div>

            <div className="Mainpage-serviceCard">
              <div className="Mainpage-serviceIcon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 122.88 121.1" width="28" height="28">
                  <defs>
                    <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#BF984F" />
                      <stop offset="100%" stopColor="#E9C675" />
                    </linearGradient>
                  </defs>
                  <g>
                    <path fill="url(#goldGradient2)" d="M62.89,56.03c1.11-0.35,2.34-0.25,3.72,0.37l10.4,7.87c2.26,1.71,4.24,3.78,2.73,6.9 c-0.51,1.06-1.4,2.1-2.38,3.49l-0.53,0.75c-1.97,2.8-2.61,2-5.71,1.83c0.56,13.37,1.75,27.82-2.64,40.88 c-0.87,2.7-3.32,3.44-6.95,2.71l-6.1-2.03c4.11-6.14,6.16-13.85,6.44-22.89c-3.46,8.58-6.8,16.96-10.68,20.86l-6.28-2.08 c0.61-3.05,1.05-5.43,0.35-6.9l-4.07,4.24l-9.33-5.77c6.36-3.36,11.62-7.87,15.6-13.73c-6.69,5.01-12.76,8.1-18.14,8.99 c-2.75,0.83-4.49,0.35-5.16-1.53c-0.48-1.34-0.05-1.77,0.81-2.86c1.11-1.41,2.61-2.67,4.35-3.79c-3.13,1.1-4.64,0.95-6.37,1.51 c-4.9,1.59-9.94-1.86-8.26-6.9c1.07-3.23,3.54-3.09,6.67-4.07l5.42-1.69c-5.19,0.28-10.32,0.45-15.02-0.25 c-5.4-0.8-5.31-0.99-8.24-5.38c-3.94-5.91-6.25-11.45,2.52-9.16c16.73,3.18,33.56,5.34,51.25-0.98c-0.76-1.32-0.9-2.57-0.5-3.73 C57.37,60.94,61.13,56.58,62.89,56.03L62.89,56.03z M113.8,2.42L74.45,51.53c-4.71,6.68,3.2,11.91,8.39,5.64l39.2-49.27 C125.12,1.86,119.13-3.16,113.8,2.42L113.8,2.42z" />
                  </g>
                </svg>
              </div>
              <span className="Mainpage-serviceLabel">خدمات مزار</span>
            </div>

            <div className="Mainpage-serviceCard" onClick={handleNavigateToSearch}>
              <div className="Mainpage-serviceIcon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                  <path d="M12 17l-1 -4l-4 -1l9 -4l-4 9" />
                </svg>
              </div>
              <span className="Mainpage-serviceLabel">مسیریابی</span>
            </div>

            <div className="Mainpage-serviceCard" onClick={handleNavigateToFavourites}>
              <div className="Mainpage-serviceIcon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="url(#goldGradient)" stroke="none">
                  <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
                </svg>
              </div>
              <span className="Mainpage-serviceLabel">مزارهای من</span>
            </div>

            <div className="Mainpage-serviceCard" onClick={handleNavigateToReminder}>
              <div className="Mainpage-serviceIcon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="url(#goldGradient)" stroke="none">
                  <path d="M14.235 19c.865 0 1.322 1.024 .745 1.668a3.992 3.992 0 0 1 -2.98 1.332a3.992 3.992 0 0 1 -2.98 -1.332c-.552 -.616 -.158 -1.579 .634 -1.661l.11 -.006h4.471z" />
                  <path d="M12 2c1.358 0 2.506 .903 2.875 2.141l.046 .171l.008 .043a8.013 8.013 0 0 1 4.024 6.069l.028 .287l.019 .289v2.931l.021 .136a3 3 0 0 0 1.143 1.847l.167 .117l.162 .099c.86 .487 .56 1.766 -.377 1.864l-.116 .006h-16c-1.028 0 -1.387 -1.364 -.493 -1.87a3 3 0 0 0 1.472 -2.063l.021 -.143l.001 -2.97a8 8 0 0 1 3.821 -6.454l.248 -.146l.01 -.043a3.003 3.003 0 0 1 2.562 -2.29l.182 -.017l.176 -.004z" />
                </svg>
              </div>
              <span className="Mainpage-serviceLabel">یادآوری‌ها</span>
            </div>

            <div className="Mainpage-serviceCard" onClick={handleNavigateToHelp}>
              <div className="Mainpage-serviceIcon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="url(#goldGradient)" stroke="none">
                  <path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" />
                </svg>
              </div>
              <span className="Mainpage-serviceLabel">نیکو کاری</span>
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="Mainpage-placeholder">
        <p>در حال توسعه...</p>
      </div>
    );
  };

  return (
    <div className="Mainpage-container">
      <div className={`Mainpage-content ${activeMenu === 'نظر سنجی' ? 'feedback-content' : ''}`}>
        {renderContent()}
      </div>

      <div className="Mainpage-bottomMenu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`Mainpage-menuItem ${activeMenu === item.id ? 'Mainpage-active' : ''}`}
            onClick={() => setActiveMenu(item.id)}
          >
            {renderMenuIcon(item.icon, activeMenu === item.id)}
            <span className="Mainpage-menuLabel">{item.label}</span>
          </div>
        ))}
      </div>

      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BF984F" />
            <stop offset="100%" stopColor="#E9C675" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default MainPage;