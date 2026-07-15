import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ReminderPage.css';

const ReminderPage = () => {
  const navigate = useNavigate();

  // --- State for Favourites List View ---
  const [favourites, setFavourites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailPerson, setDetailPerson] = useState(null);

  // --- State for Reminder Settings View ---
  const [selectedGrave, setSelectedGrave] = useState(null);
  const [reminderSettings, setReminderSettings] = useState({
    anniversary: true,
    monthly: true,
    fridayNights: true,
    ramadan: false,
    qadrNights: false,
  });

  // --- Single Date & Time State ---
  const [reminderDateTime, setReminderDateTime] = useState({
    hour: '۰۱',
    minute: '۱۸',
    second: '۲۰',
    ampm: 'ق.ظ',
    year: 1403,
    month: 1,
    day: 1,
  });

  const [sendMethods, setSendMethods] = useState({
    appNotification: true,
    sms: true,
  });
  const [customMessage, setCustomMessage] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState(['', '', '']);
  const [showSuggestedTexts, setShowSuggestedTexts] = useState(false);
  const [showReminderView, setShowReminderView] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Jalali Month Names ---
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  // --- Persian Numbers ---
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  const toPersianNumber = (num) => {
    return String(num).replace(/\d/g, d => persianNumbers[parseInt(d)]);
  };

  // --- Generate Persian Hours (01-12) ---
  const persianHours = Array.from({ length: 12 }, (_, i) => toPersianNumber(i + 1).padStart(2, '۰'));

  // --- Generate Persian Minutes/Seconds (00-59) ---
  const persianMinutes = Array.from({ length: 60 }, (_, i) => toPersianNumber(i).padStart(2, '۰'));

  // --- Generate Persian Years (1390-1410) ---
  const persianYears = Array.from({ length: 21 }, (_, i) => 1390 + i);

  // --- Generate Persian Days (1-31) ---
  const persianDays = Array.from({ length: 31 }, (_, i) => i + 1);

  // --- AM/PM Persian options ---
  const ampmOptions = ['ق.ظ', 'ب.ظ'];

  // --- Suggested Texts (PERSIAN) ---
  const suggestedTexts = [
    'پروردگارا، او را بیامرز و بر او رحم کن و او را عافیت بخش و از او درگذر',
    'خداوندا، بر آرامگاه او رحمت و برکت نازل فرما',
    'خداوندا، قبر او را باغی از باغ‌های بهشت قرار ده',
    'خداوندا، او را در هنگام پرسش ثابت قدم بدار و بر او آرامش نازل فرما',
    'خداوندا، بر اهل قبور ما ببخش و به آنان رحم کن',
    'خداوندا، درجه او را در میان هدایت‌یافتگان بالا ببر',
    'خداوندا، قبر او را گشاده گردان و در آن برایش نور قرار ده',
    'خداوندا، بر آرامگاه او نوری از نور خود بتابان',
    'خداوندا، او و پدر و مادرش و اهل خانه‌اش را بیامرز',
    'خداوندا، قبر او را به رحمت خود روشن گردان',
    'خداوندا، او را از عذاب قبر نجات بخش و به بهشت برین وارد کن',
    'خداوندا، بر او باران رحمت خود را بباران و او را مشمول مغفرت خود قرار ده',
  ];

  // --- Load favourites from sessionStorage ---
  const loadFavouritesFromSession = () => {
    const savedFavourites = sessionStorage.getItem('favourites_list');
    if (savedFavourites) {
      return JSON.parse(savedFavourites);
    }
    return [];
  };

  useEffect(() => {
    const savedFavourites = loadFavouritesFromSession();
    const savedOnly = savedFavourites.filter(item => !item.isReserved);
    setFavourites(savedOnly);
  }, []);

  // --- Filter favourites ---
  const filteredFavourites = favourites.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.section.includes(searchTerm) ||
      item.province.includes(searchTerm);
    return matchesSearch;
  });

  // --- Handlers ---
  const handleOpenReminder = (grave) => {
    setSelectedGrave(grave);
    setShowReminderView(true);
  };

  const handleBackToFavourites = () => {
    setShowReminderView(false);
    setSelectedGrave(null);
  };

  const handleOpenDetail = (person) => {
    setDetailPerson(person);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setDetailPerson(null);
  };

  const handleToggleReminder = (key) => {
    setReminderSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDateTimeChange = (field, value) => {
    setReminderDateTime(prev => ({ ...prev, [field]: value }));
  };

  const handleSendMethodToggle = (key) => {
    setSendMethods(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePhoneChange = (index, value) => {
    const newPhones = [...phoneNumbers];
    newPhones[index] = value;
    setPhoneNumbers(newPhones);
  };

  const handleAddPhone = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const handleRemovePhone = (index) => {
    if (phoneNumbers.length > 1) {
      const newPhones = phoneNumbers.filter((_, i) => i !== index);
      setPhoneNumbers(newPhones);
    }
  };

  const handleSaveSettings = () => {
    if (!customMessage.trim()) {
      alert('لطفاً متن دلخواه را وارد کنید');
      return;
    }
    setSavedMessage('تنظیمات با موفقیت ذخیره شد');
    setTimeout(() => setSavedMessage(''), 3000);
    console.log('Settings saved:', { reminderSettings, reminderDateTime, sendMethods, customMessage, phoneNumbers });
  };

  const handleSelectSuggestedText = (text) => {
    setCustomMessage(text);
    setShowSuggestedTexts(false);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const formatDateForDisplay = () => {
    const { year, month, day } = reminderDateTime;
    return `${toPersianNumber(day)} ${persianMonths[month - 1]} ${toPersianNumber(year)}`;
  };

  // --- CustomSelect Component (same as SearchPage) ---
  const CustomSelect = ({ options, value, onChange, placeholder }) => {
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

    return (
      <div className="ReminderPage-customSelect" ref={selectRef}>
        <div className="ReminderPage-selectTrigger" onClick={() => setIsOpen(!isOpen)}>
          <span>{value || placeholder}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {isOpen && (
          <div className="ReminderPage-dropdownMenu">
            {options.map(option => (
              <div
                key={option}
                className="ReminderPage-dropdownItem"
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

  return (
    <div className="ReminderPage-container">

      {/* ========== VIEW 1: FAVOURITES LIST ========== */}
      {!showReminderView && (
        <>
          <div className="ReminderPage-header">
            <div className="ReminderPage-headerSpacer" />
            <h1 className="ReminderPage-headerTitle">مزارهای ذخیره شده</h1>
            <button className="ReminderPage-backBtn" onClick={() => navigate('/MainPage')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          <div className="ReminderPage-toolbar">
            <div className="ReminderPage-searchContainer">
              <svg className="ReminderPage-searchIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="ReminderPage-searchInput"
                placeholder="جستجو در مزارها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="ReminderPage-list">
            {filteredFavourites.length > 0 ? (
              filteredFavourites.map((item) => (
                <div key={item.id} className="ReminderPage-card">
                  <div className="ReminderPage-cardContent">
                    <div className="ReminderPage-cardHeader">
                      <div className="ReminderPage-cardImageSmall">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="ReminderPage-cardRealImage" />
                        ) : (
                          <div className="ReminderPage-cardImagePlaceholderSmall">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="#BF9A61" stroke="white" strokeWidth="1">
                              <rect x="6" y="8" width="12" height="12" rx="1" />
                              <path d="M12 4v4" stroke="white" strokeWidth="2" />
                              <circle cx="12" cy="6" r="2" fill="white" />
                              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="6">{item.row}/{item.number}</text>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ReminderPage-cardInfo">
                        <h3>{item.name}</h3>
                        <p className="ReminderPage-cardSection">{item.section} - ردیف {item.row} - شماره {item.number}</p>
                        <p className="ReminderPage-cardLocation">{item.province} - {item.city}</p>
                        <p className="ReminderPage-cardDate">تاریخ فوت: {item.deathDate}</p>
                      </div>
                    </div>
                    <div className="ReminderPage-cardActions2">
                      <button className="ReminderPage-cardReminderBtn" onClick={() => handleOpenReminder(item)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        تنظیم و یادآوری
                      </button>
                      <button className="ReminderPage-cardDetailBtn" onClick={() => handleOpenDetail(item)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-invoice"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M19 12v7a1.78 1.78 0 0 1 -3.1 1.4a1.65 1.65 0 0 0 -2.6 0a1.65 1.65 0 0 1 -2.6 0a1.65 1.65 0 0 0 -2.6 0a1.78 1.78 0 0 1 -3.1 -1.4v-14a2 2 0 0 1 2 -2h7l5 5v4.25" /></svg>
                        جزئیات
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="ReminderPage-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#BF9A61" strokeWidth="1.5">
                  <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
                </svg>
                <p>هیچ مزار ذخیره‌ای وجود ندارد</p>
                <p className="ReminderPage-emptySub">برای ذخیره مزار، از بخش جستجو یا نقشه استفاده کنید</p>
                <button className="ReminderPage-emptyBtn" onClick={() => navigate('/SearchPage')}>
                  جستجوی مزار
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========== VIEW 2: REMINDER SETTINGS ========== */}
      {showReminderView && selectedGrave && (
        <div className="ReminderPage-reminderView">
          <div className="ReminderPage-reminderHeaders">
            <h2 className="ReminderPage-reminderTitle">یادآوری‌های هوشمند</h2>
            <button className="ReminderPage-reminderBackBtn" onClick={handleBackToFavourites}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          <div className="ReminderPage-userInfo">
            <div className="ReminderPage-userAvatar">
              {selectedGrave.image ? (
                <img src={selectedGrave.image} alt={selectedGrave.name} className="ReminderPage-userAvatarImg" />
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <div className="ReminderPage-userName">
              <h3>مرحوم {selectedGrave.name}</h3>
            </div>
          </div>

          {/* Reminder Toggles */}
          <div className="ReminderPage-reminderSection">
            <div className="ReminderPage-reminderItem">
              <span className="ReminderPage-reminderLabel">یادآوری سالگرد</span>
              <div className="ReminderPage-toggleWrapper" onClick={() => handleToggleReminder('anniversary')}>
                <div className={`ReminderPage-toggleCustom ${reminderSettings.anniversary ? 'active' : ''}`}>
                  <div className="ReminderPage-toggleCircle"></div>
                </div>
              </div>
            </div>

            <div className="ReminderPage-reminderItem">
              <span className="ReminderPage-reminderLabel">یادآوری ماه‌گرد</span>
              <div className="ReminderPage-toggleWrapper" onClick={() => handleToggleReminder('monthly')}>
                <div className={`ReminderPage-toggleCustom ${reminderSettings.monthly ? 'active' : ''}`}>
                  <div className="ReminderPage-toggleCircle"></div>
                </div>
              </div>
            </div>

            <div className="ReminderPage-reminderItem">
              <span className="ReminderPage-reminderLabel">شب‌های جمعه</span>
              <div className="ReminderPage-toggleWrapper" onClick={() => handleToggleReminder('fridayNights')}>
                <div className={`ReminderPage-toggleCustom ${reminderSettings.fridayNights ? 'active' : ''}`}>
                  <div className="ReminderPage-toggleCircle"></div>
                </div>
              </div>
            </div>

            <div className="ReminderPage-reminderItem">
              <span className="ReminderPage-reminderLabel">ماه رمضان</span>
              <div className="ReminderPage-toggleWrapper" onClick={() => handleToggleReminder('ramadan')}>
                <div className={`ReminderPage-toggleCustom ${reminderSettings.ramadan ? 'active' : ''}`}>
                  <div className="ReminderPage-toggleCircle"></div>
                </div>
              </div>
            </div>

            <div className="ReminderPage-reminderItem">
              <span className="ReminderPage-reminderLabel">لیالی قدر</span>
              <div className="ReminderPage-toggleWrapper" onClick={() => handleToggleReminder('qadrNights')}>
                <div className={`ReminderPage-toggleCustom ${reminderSettings.qadrNights ? 'active' : ''}`}>
                  <div className="ReminderPage-toggleCircle"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Single Date & Time Selection */}
          <div className="ReminderPage-datetimeSection">
            <h4 className="ReminderPage-datetimeTitle">تاریخ و ساعت یادآوری</h4>

            {/* Time Selection - Using CustomSelect */}
            <div className="ReminderPage-timeSelection">
              <div className="ReminderPage-timeRow">
                <div className="ReminderPage-timeCol">
                  <label>ساعت</label>
                  <CustomSelect
                    options={persianHours}
                    value={reminderDateTime.hour}
                    onChange={(val) => handleDateTimeChange('hour', val)}
                    placeholder="ساعت"
                  />
                </div>
                <div className="ReminderPage-timeCol">
                  <label>دقیقه</label>
                  <CustomSelect
                    options={persianMinutes}
                    value={reminderDateTime.minute}
                    onChange={(val) => handleDateTimeChange('minute', val)}
                    placeholder="دقیقه"
                  />
                </div>
                <div className="ReminderPage-timeCol">
                  <label>ثانیه</label>
                  <CustomSelect
                    options={persianMinutes}
                    value={reminderDateTime.second}
                    onChange={(val) => handleDateTimeChange('second', val)}
                    placeholder="ثانیه"
                  />
                </div>
                <div className="ReminderPage-timeCol">
                  <label>قبل/بعد</label>
                  <CustomSelect
                    options={ampmOptions}
                    value={reminderDateTime.ampm}
                    onChange={(val) => handleDateTimeChange('ampm', val)}
                    placeholder="ق.ظ/ب.ظ"
                  />
                </div>
              </div>
            </div>

            {/* Date Selection - Dropdown style */}
            <div className="ReminderPage-dateSelection">
              <div className="ReminderPage-dateDisplay" onClick={toggleDatePicker}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{formatDateForDisplay()}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {showDatePicker && (
                <div className="ReminderPage-datePickerDropdown">
                  <div className="ReminderPage-datePickerHeader">
                    <span>انتخاب تاریخ</span>
                    <button onClick={() => setShowDatePicker(false)}>✕</button>
                  </div>
                  <div className="ReminderPage-datePickerRow">
                    <div className="ReminderPage-datePickerCol">
                      <label>سال</label>
                      <CustomSelect
                        options={persianYears.map(year => toPersianNumber(year))}
                        value={toPersianNumber(reminderDateTime.year)}
                        onChange={(val) => {
                          const yearNum = parseInt(val.replace(/[۰-۹]/g, d => String('0123456789'.indexOf(d))));
                          handleDateTimeChange('year', yearNum);
                        }}
                        placeholder="سال"
                      />
                    </div>
                    <div className="ReminderPage-datePickerCol">
                      <label>ماه</label>
                      <CustomSelect
                        options={persianMonths}
                        value={persianMonths[reminderDateTime.month - 1]}
                        onChange={(val) => {
                          const monthIndex = persianMonths.indexOf(val) + 1;
                          handleDateTimeChange('month', monthIndex);
                        }}
                        placeholder="ماه"
                      />
                    </div>
                    <div className="ReminderPage-datePickerCol">
                      <label>روز</label>
                      <CustomSelect
                        options={persianDays.map(day => toPersianNumber(day))}
                        value={toPersianNumber(reminderDateTime.day)}
                        onChange={(val) => {
                          const dayNum = parseInt(val.replace(/[۰-۹]/g, d => String('0123456789'.indexOf(d))));
                          handleDateTimeChange('day', dayNum);
                        }}
                        placeholder="روز"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Send Methods */}
          <div className="ReminderPage-sendSection">
            <h4 className="ReminderPage-sendTitle">روش ارسال</h4>
            <div className="ReminderPage-sendItems">
              <div className="ReminderPage-sendItem">
                <label className="ReminderPage-sendLabel">
                  <input
                    type="checkbox"
                    checked={sendMethods.appNotification}
                    onChange={() => handleSendMethodToggle('appNotification')}
                  />
                  نوتيفيکيشن اپ
                </label>
              </div>

              <div className="ReminderPage-sendItem">
                <label className="ReminderPage-sendLabel">
                  <input
                    type="checkbox"
                    checked={sendMethods.sms}
                    onChange={() => handleSendMethodToggle('sms')}
                  />
                  پیامک
                </label>
              </div>
            </div>
            <div className="ReminderPage-messageSection">
              <label className="ReminderPage-messageLabel">
                متن دلخواه <span className="ReminderPage-required">*</span>
              </label>
              <textarea
                className={`ReminderPage-messageTextarea ${!customMessage.trim() ? 'error' : ''}`}
                placeholder="متن دلخواه خود را برای یادآوری وارد کنید..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />

              <button
                className="ReminderPage-suggestedBtn"
                onClick={() => setShowSuggestedTexts(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                نمایش متن های پیشنهادی
              </button>
            </div>
          </div>


          {/* Phone Number Inputs */}
          <div className="ReminderPage-phoneSection">
            <label className="ReminderPage-phoneLabel">شماره موبایل برای ارسال پیامک</label>

            {phoneNumbers.map((phone, index) => (
              <div key={index} className="ReminderPage-phoneInputWrapper">
                <input
                  type="tel"
                  className="ReminderPage-phoneInput"
                  placeholder="شماره تلفن مورد نظر را وارد کنید"
                  value={phone}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                />
                {phoneNumbers.length > 1 && (
                  <button
                    className="ReminderPage-phoneRemoveBtn"
                    onClick={() => handleRemovePhone(index)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentcolor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            <button
              className="ReminderPage-phoneAddBtn"
              onClick={handleAddPhone}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              افزودن شماره جدید
            </button>
          </div>

          {/* Save Button */}
          <button
            className="ReminderPage-saveBtn"
            onClick={handleSaveSettings}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            ذخیره تنظیمات
          </button>

          {savedMessage && (
            <div className="ReminderPage-savedMessage">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {savedMessage}
            </div>
          )}
        </div>
      )}

      {/* ========== SUGGESTED TEXTS OVERLAY ========== */}
      {showSuggestedTexts && (
        <div className="ReminderPage-suggestedOverlay">
          <div className="ReminderPage-suggestedContent">
            <button
              className="ReminderPage-suggestedBackBtn"
              onClick={() => setShowSuggestedTexts(false)}
            >

              بازگشت
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h3 className="ReminderPage-suggestedTitle">متن های پیشنهادی</h3>
            <div className="ReminderPage-suggestedList">
              {suggestedTexts.map((text, index) => (
                <div
                  key={index}
                  className="ReminderPage-suggestedItem"
                  onClick={() => handleSelectSuggestedText(text)}
                >
                  <p>{text}</p>
                  <button className="ReminderPage-suggestedSelectBtn">
                    انتخاب
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== DETAIL MODAL ========== */}
      {showDetailModal && detailPerson && (
        <div className="ReminderPage-detailModalOverlay" onClick={handleCloseDetail}>
          <div className="ReminderPage-detailModalContent" onClick={(e) => e.stopPropagation()}>
            <div className="ReminderPage-detailModalHeader">
              <h3>جزئیات مزار</h3>
            </div>
            <div className="ReminderPage-detailModalBody">
              <div className="ReminderPage-detailImageContainer">
                <div className="ReminderPage-detailGraveImage">
                  {detailPerson.image ? (
                    <img src={detailPerson.image} alt={detailPerson.name} className="ReminderPage-detailRealImage" />
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

              <div className="ReminderPage-detailInfoSection">
                <div className="ReminderPage-detailInfoRow">
                  <span className="ReminderPage-detailInfoLabel">نام متوفی:</span>
                  <span className="ReminderPage-detailInfoValue">{detailPerson.name}</span>
                </div>
                <div className="ReminderPage-detailInfoRow">
                  <span className="ReminderPage-detailInfoLabel">قطعه:</span>
                  <span className="ReminderPage-detailInfoValue">{detailPerson.section}</span>
                </div>
                <div className="ReminderPage-detailInfoRow">
                  <span className="ReminderPage-detailInfoLabel">ردیف:</span>
                  <span className="ReminderPage-detailInfoValue">{detailPerson.row}</span>
                </div>
                <div className="ReminderPage-detailInfoRow">
                  <span className="ReminderPage-detailInfoLabel">شماره قبر:</span>
                  <span className="ReminderPage-detailInfoValue">{detailPerson.number || '1'}</span>
                </div>
                <div className="ReminderPage-detailInfoRow">
                  <span className="ReminderPage-detailInfoLabel">استان:</span>
                  <span className="ReminderPage-detailInfoValue">{detailPerson.province}</span>
                </div>
                <div className="ReminderPage-detailInfoRow">
                  <span className="ReminderPage-detailInfoLabel">شهر:</span>
                  <span className="ReminderPage-detailInfoValue">{detailPerson.city}</span>
                </div>
                <div className="ReminderPage-detailInfoRow">
                  <span className="ReminderPage-detailInfoLabel">تاریخ فوت:</span>
                  <span className="ReminderPage-detailInfoValue">{detailPerson.deathDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderPage;