// SearchPage.jsx - Updated with all data in Behesht Reza, Mashhad
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchPage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [sortBy, setSortBy] = useState('نزدیکترین');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [fadeIn, setFadeIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  // Static data for deceased persons - All in Behesht Reza, Mashhad
  const deceasedData = [
    // TEMPORARILY ROUTING SYSTEM - Priority person (highest priority for presentation)
    { id: 0, name: 'حمید رضا رحمانی میاندهی', surname: 'رحمانی میاندهی', fullName: 'حمید رضا رحمانی میاندهی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 30', deathDate: '1393/07/25', row: '13', number: '3', lat: 36.1675134665991, lng: 59.7000692302999, image: '/assets/images/s1.jpg' },
    { id: 1, name: 'حسین محمدی', surname: 'محمدی', fullName: 'حسین محمدی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 14', deathDate: '1401/06/28', row: '8', number: '12', lat: 36.1691, lng: 59.7016 },
    { id: 2, name: 'محمدرضا ابراهیمی', surname: 'ابراهیمی', fullName: 'محمدرضا ابرهیمی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 2', deathDate: '1398/07/23', row: '8', number: '12', lat: 36.1680, lng: 59.6992 },
    { id: 3, name: 'محمد کریمی', surname: 'کریمی', fullName: 'محمد کریمی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 18', deathDate: '1403/01/10', row: '2', number: '9', lat: 36.1670, lng: 59.7008 },
    { id: 4, name: 'زهرا محمدی', surname: 'محمدی', fullName: 'زهرا محمدی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 14', deathDate: '1400/12/05', row: '7', number: '4', lat: 36.1685, lng: 59.7002 },
    { id: 5, name: 'علی اکبری', surname: 'اکبری', fullName: 'علی اکبری', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 5', deathDate: '1402/09/18', row: '1', number: '15', lat: 36.1668, lng: 59.6995 },
    { id: 6, name: 'مریم احمدی', surname: 'احمدی', fullName: 'مریم احمدی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 12', deathDate: '1401/06/30', row: '4', number: '8', lat: 36.1679, lng: 59.7010 },
    { id: 7, name: 'رضا قاسمی', surname: 'قاسمی', fullName: 'رضا قاسمی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 2', deathDate: '1403/02/14', row: '6', number: '11', lat: 36.1688, lng: 59.7007 },
    { id: 8, name: 'سارا نوری', surname: 'نوری', fullName: 'سارا نوری', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 14', deathDate: '1400/10/25', row: '8', number: '2', lat: 36.1672, lng: 59.6990 },
    { id: 9, name: 'حسین موسوی', surname: 'موسوی', fullName: 'حسین موسوی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 18', deathDate: '1402/11/12', row: '3', number: '6', lat: 36.1690, lng: 59.7000 },
    { id: 10, name: 'نگار صادقی', surname: 'صادقی', fullName: 'نگار صادقی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 7', deathDate: '1401/04/08', row: '5', number: '14', lat: 36.1665, lng: 59.7009 },
    { id: 11, name: 'امیر حسینی', surname: 'حسینی', fullName: 'امیر حسینی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 12', deathDate: '1403/03/20', row: '2', number: '10', lat: 36.1692, lng: 59.7004 },
    { id: 12, name: 'لیلا کاظمی', surname: 'کاظمی', fullName: 'لیلا کاظمی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 5', deathDate: '1402/07/09', row: '4', number: '5', lat: 36.1676, lng: 59.7015 },
    { id: 13, name: 'مجید رحیمی', surname: 'رحیمی', fullName: 'مجید رحیمی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 2', deathDate: '1401/12/28', row: '1', number: '13', lat: 36.1683, lng: 59.6988 },
    { id: 14, name: 'پریسا عباسی', surname: 'عباسی', fullName: 'پریسا عباسی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 14', deathDate: '1400/09/17', row: '6', number: '1', lat: 36.1662, lng: 59.7003 },
    { id: 15, name: 'سعید مرادی', surname: 'مرادی', fullName: 'سعید مرادی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 18', deathDate: '1403/04/05', row: '7', number: '16', lat: 36.1695, lng: 59.6995 },
    { id: 16, name: 'مهسا رضایی', surname: 'رضایی', fullName: 'مهسا رضایی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 12', deathDate: '1402/10/03', row: '3', number: '9', lat: 36.1674, lng: 59.7020 },
    { id: 17, name: 'وحید علیپور', surname: 'علیپور', fullName: 'وحید علیپور', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 7', deathDate: '1401/05/14', row: '8', number: '7', lat: 36.1689, lng: 59.7012 },
    { id: 18, name: 'ندا محمدیان', surname: 'محمدیان', fullName: 'ندا محمدیان', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 5', deathDate: '1400/11/22', row: '2', number: '4', lat: 36.1660, lng: 59.6998 },
    { id: 19, name: 'بهرام شاهینی', surname: 'شاهینی', fullName: 'بهرام شاهینی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 14', deathDate: '1402/08/19', row: '5', number: '12', lat: 36.1698, lng: 59.7006 },
    { id: 20, name: 'گلناز احمدی', surname: 'احمدی', fullName: 'گلناز احمدی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 2', deathDate: '1403/06/01', row: '4', number: '8', lat: 36.1677, lng: 59.6985 },
    { id: 21, name: 'احمد رضایی', surname: 'رضایی', fullName: 'احمد رضایی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 12', deathDate: '1402/05/15', row: '5', number: '7', lat: 36.1678, lng: 59.7005 },
    { id: 22, name: 'فاطمه حسینی', surname: 'حسینی', fullName: 'فاطمه حسینی', province: 'خراسان رضوی', city: 'مشهد', section: 'بلوک 7', deathDate: '1401/08/22', row: '3', number: '12', lat: 36.1682, lng: 59.6998 }
  ];

  // Provinces data
  const provinces = [
    'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'خوزستان', 'مازندران',
    'گیلان', 'البرز', 'قم', 'کرمان', 'همدان', 'یزد'
  ];

  // Cities data based on province
  const citiesByProvince = {
    'تهران': ['تهران', 'ری', 'شهریار', 'اسلامشهر', 'قدس', 'ملارد'],
    'اصفهان': ['اصفهان', 'کاشان', 'خمینی شهر', 'نجف آباد', 'شاهین شهر', 'مبارکه'],
    'فارس': ['شیراز', 'مرودشت', 'کازرون', 'جهرم', 'فسا', 'داراب'],
    'خراسان رضوی': ['مشهد', 'نیشابور', 'سبزوار', 'تربت حیدریه', 'قوچان', 'کاشمر'],
    'خوزستان': ['اهواز', 'آبادان', 'خرمشهر', 'دزفول', 'بهبهان', 'مسجدسلیمان'],
    'مازندران': ['ساری', 'بابل', 'آمل', 'قائم‌شهر', 'بابلسر', 'نور'],
    'گیلان': ['رشت', 'انزلی', 'لاهیجان', 'رودسر', 'تالش', 'صومعه سرا'],
    'البرز': ['کرج', 'نظرآباد', 'هشتگرد', 'اشتهارد', 'طالقان'],
    'قم': ['قم', 'جعفریه', 'دستجرد'],
    'کرمان': ['کرمان', 'رفسنجان', 'سیرجان', 'بم', 'زرند', 'جیرفت'],
    'همدان': ['همدان', 'ملایر', 'نهاوند', 'تویسرکان', 'کبودرآهنگ'],
    'یزد': ['یزد', 'اردکان', 'میبد', 'بافق', 'ابرکوه', 'تفت']
  };

  // Sections
  const sections = ['بلوک 1', 'بلوک 2', 'بلوک 3', 'بلوک 4', 'بلوک 5', 'بلوک 6', 'بلوک 7', 'بلوک 8', 'بلوک 9', 'بلوک 10', 'بلوک 11', 'بلوک 12', 'بلوک 13', 'بلوک 14', 'بلوک 15', 'بلوک 16', 'بلوک 17', 'بلوک 18', 'بلوک 30'];

  // Persian months
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const persianDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const persianYears = [1390, 1391, 1392, 1393, 1394, 1395, 1396, 1397, 1398, 1399, 1400, 1401, 1402, 1403, 1404];

  const [selectedYear, setSelectedYear] = useState(1402);
  const [selectedMonth, setSelectedMonth] = useState('فروردین');
  const [selectedDay, setSelectedDay] = useState(1);

  // Custom dropdown component
  const CustomSelect = ({ options, value, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (disabled) {
      return (
        <div className="Searchpage-customSelect" ref={selectRef}>
          <div className="Searchpage-selectTrigger" style={{ background: '#f5f5f5', opacity: 0.7 }}>
            <span>{value || placeholder}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="Searchpage-customSelect" ref={selectRef}>
        <div className="Searchpage-selectTrigger" onClick={() => setIsOpen(!isOpen)}>
          <span>{value || placeholder}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {isOpen && (
          <div className="Searchpage-dropdownMenu">
            <div className="Searchpage-dropdownItem" onClick={() => { onChange(''); setIsOpen(false); }}>
               {placeholder}
            </div>
            {options.map(option => (
              <div
                key={option}
                className="Searchpage-dropdownItem"
                onClick={() => { onChange(option); setIsOpen(false); }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleBack = () => {
    navigate('/Mainpage');
  };

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  const handleSearch = () => {
    // Check if search name is empty - MANDATORY FIELD
    if (!searchName || searchName.trim() === '') {
      showErrorMessage('لطفا نام متوفی را وارد کنید');
      return;
    }

    let results = [...deceasedData];

    // Filter by name - MANDATORY
    results = results.filter(person =>
      person.fullName.toLowerCase().includes(searchName.toLowerCase()) ||
      person.name.toLowerCase().includes(searchName.toLowerCase()) ||
      person.surname.toLowerCase().includes(searchName.toLowerCase())
    );

    // Filter by date (optional)
    if (selectedDate && selectedDate !== '') {
      results = results.filter(person => person.deathDate === selectedDate);
    }

    // Filter by province (optional)
    if (selectedProvince && selectedProvince !== '') {
      results = results.filter(person => person.province === selectedProvince);
    }

    // Filter by city (optional)
    if (selectedCity && selectedCity !== '') {
      results = results.filter(person => person.city === selectedCity);
    }

    // Filter by section (optional)
    if (selectedSection && selectedSection !== '') {
      results = results.filter(person => person.section === selectedSection);
    }

    // Sort results
    if (sortBy === 'نزدیکترین') {
      results.sort((a, b) => new Date(b.deathDate) - new Date(a.deathDate));
    } else if (sortBy === 'قابل نسودر') {
      results.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    setSearchResults(results);
    setShowResults(true);
  };

  const handleNavigateToMap = (person) => {
    // Save the selected person to sessionStorage
    sessionStorage.setItem('selectedPerson', JSON.stringify(person));
    // Also pass via state for immediate use
    navigate('/mappage', { state: { selectedPerson: person } });
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  const formatDate = (year, month, day) => {
    const monthIndex = persianMonths.indexOf(month) + 1;
    return `${year}/${monthIndex.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
  };

  const handleDateSelect = () => {
    const formattedDate = formatDate(selectedYear, selectedMonth, selectedDay);
    setSelectedDate(formattedDate);
    setShowDatePicker(false);
  };

  return (
    <div className={`Searchpage-container ${fadeIn ? 'fade-in' : ''}`}>
      {/* Header */}
      <div className="Searchpage-header">
        <h1 className="Searchpage-headerTitle">جستجوی نام متوفی</h1>
        <button className="SearchPage-backButton" onClick={handleBack}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="Searchpage-mainContent">
        {/* Search Input - MANDATORY FIELD */}
        <div className={`Searchpage-searchInputContainer ${showError ? 'error-shake' : ''}`}>
          <svg className="Searchpage-searchIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A865F" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={`Searchpage-searchInput ${showError ? 'error-border' : ''}`}
            placeholder="نام و نام خانوادگی متوفی ..."
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              if (showError) setShowError(false);
            }}
          />
        </div>

        {/* Error Notification */}
        {showError && (
          <div className="Searchpage-errorNotification">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Date Field */}
        <div className="Searchpage-fieldContainer">
          <div className="Searchpage-fieldLabel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A865F" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>تاریخ فوت </span>
          </div>
          <div className="Searchpage-fieldValue" onClick={() => setShowDatePicker(!showDatePicker)}>
            <span>{selectedDate || 'انتخاب تاریخ'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {showDatePicker && (
            <div className="Searchpage-datePicker">
              <div className="Searchpage-datePickerHeader">
                <button onClick={() => setShowDatePicker(false)}>لغو</button>
                <button onClick={handleDateSelect}>تایید</button>
              </div>
              <div className="Searchpage-datePickerContent">
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                  {persianYears.map(year => (<option key={year} value={year}>{year}</option>))}
                </select>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                  {persianMonths.map(month => (<option key={month} value={month}>{month}</option>))}
                </select>
                <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))}>
                  {persianDays.map(day => (<option key={day} value={day}>{day}</option>))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Province Field */}
        <div className="Searchpage-fieldContainer">
          <div className="Searchpage-fieldLabel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A865F" strokeWidth="2">
              <path d="M12 2a10 10 0 0 0-10 10c0 5 10 12 10 12s10-7 10-12a10 10 0 0 0-10-10z" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            <span>استان </span>
          </div>
          <CustomSelect
            options={provinces}
            value={selectedProvince}
            onChange={setSelectedProvince}
            placeholder="همه استان‌ها"
          />
        </div>

        {/* City Field */}
        <div className="Searchpage-fieldContainer">
          <div className="Searchpage-fieldLabel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A865F" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>شهر </span>
          </div>
          <CustomSelect
            options={selectedProvince ? citiesByProvince[selectedProvince] || [] : []}
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder="همه شهرها"
            disabled={!selectedProvince}
          />
        </div>

        {/* Section Field */}
        <div className="Searchpage-fieldContainer">
          <div className="Searchpage-fieldLabel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A865F" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
            <span>بلوک </span>
          </div>
          <CustomSelect
            options={sections}
            value={selectedSection}
            onChange={setSelectedSection}
            placeholder="همه  بلوک ها"
          />
        </div>

        {/* Sort Buttons */}
        <div className="Searchpage-sortContainer">
          <button
            className={`Searchpage-sortButton ${sortBy === 'قابل نسودر' ? 'active' : ''}`}
            onClick={() => setSortBy('قابل نسودر')}
          >
            قابل نسودر
          </button>
          <button
            className={`Searchpage-sortButton ${sortBy === 'نزدیکترین' ? 'active' : ''}`}
            onClick={() => setSortBy('نزدیکترین')}
          >
            نزدیکترین
          </button>
        </div>

        {/* Search Button */}
        <button className="Searchpage-mainSearchButton" onClick={handleSearch}>
          جستجو
        </button>
      </div>

      {/* Results Overlay - Full screen */}
      {showResults && (
        <div className="Searchpage-fullOverlay">
          <div className="Searchpage-resultsContainer">
            <button className="Searchpage-backButton" onClick={handleCloseResults}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            <h2 className="Searchpage-resultsTitle">نتایج جستجو ({searchResults.length})</h2>

            <div className="Searchpage-resultsList">
              {searchResults.length > 0 ? (
                searchResults.map(person => (
                  <div key={person.id} className="Searchpage-resultItem">
                    <div className="Searchpage-resultInfo">
                      <h3>{person.fullName}</h3>
                      <p>{person.province} - {person.city}</p>
                      <p className="Searchpage-resultDetail">{person.section} - ردیف {person.row} - شماره {person.number || '1'}</p>
                      <p className="Searchpage-resultDate">{person.deathDate}</p>
                    </div>
                    <button
                      className="Searchpage-navigateButton"
                      onClick={() => handleNavigateToMap(person)}
                    >
                      مسیر یابی
                    </button>
                  </div>
                ))
              ) : (
                <div className="Searchpage-noResults">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <circle cx="12" cy="16" r="0.5" fill="#999" stroke="none" />
                  </svg>
                  <p>نتیجه‌ای یافت نشد</p>
                  <p className="Searchpage-noResultsHint">لطفا با عبارت دیگری جستجو کنید</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;