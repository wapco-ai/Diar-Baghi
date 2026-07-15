import React, { useState, useRef, useEffect } from 'react';
import logoPic5 from '../assets/images/pic5.png';
import pic1 from '../assets/images/pic1.png';
import pic2 from '../assets/images/pic2.png';
import pic3 from '../assets/images/pic3.png';
import pic4 from '../assets/images/pic4.png';
import pic6 from '../assets/images/pic6.png';
import Bird_Logo from '../assets/images/Bird_Logo.png';
import Logo from '../assets/images/logo4.png';
import '../styles/HelpPage.css';

// Dynamic imports for PDF functionality
let html2canvas = null;
let jsPDF = null;

const HelpPage = () => {
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSpiritualEffect, setShowSpiritualEffect] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [pdfReady, setPdfReady] = useState(false);
  const receiptRef = useRef(null);

  // New state for payment overlay (two-stage)
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
  const [overlayStage, setOverlayStage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDeceased, setSelectedDeceased] = useState(null);

  // Payment details state (stage 2)
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedAmountPreset, setSelectedAmountPreset] = useState(null);
  const [monthlyRepeat, setMonthlyRepeat] = useState(false);
  const [optionalMessage, setOptionalMessage] = useState('');
  const [notifyFamily, setNotifyFamily] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank');

  // Static data for deceased persons
  const deceasedData = [
    { id: 1, name: 'احمد', surname: 'رضایی', fullName: 'احمد رضایی', province: 'تهران', city: 'تهران', section: 'قطعه 12', deathDate: '1402/05/15', row: '5' },
    { id: 2, name: 'فاطمه', surname: 'حسینی', fullName: 'فاطمه حسینی', province: 'اصفهان', city: 'اصفهان', section: 'قطعه 7', deathDate: '1401/08/22', row: '3' },
    { id: 3, name: 'محمد', surname: 'کریمی', fullName: 'محمد کریمی', province: 'فارس', city: 'شیراز', section: 'قطعه 18', deathDate: '1403/01/10', row: '2' },
    { id: 4, name: 'زهرا', surname: 'محمدی', fullName: 'زهرا محمدی', province: 'خراسان رضوی', city: 'مشهد', section: 'قطعه 14', deathDate: '1400/12/05', row: '7' },
    { id: 5, name: 'علی', surname: 'اکبری', fullName: 'علی اکبری', province: 'تهران', city: 'ری', section: 'قطعه 5', deathDate: '1402/09/18', row: '1' },
    { id: 6, name: 'سارا', surname: 'احمدی', fullName: 'سارا احمدی', province: 'تهران', city: 'تهران', section: 'قطعه 3', deathDate: '1403/02/01', row: '4' },
  ];

  // Load PDF libraries dynamically
  useEffect(() => {
    const loadPDFLibraries = async () => {
      try {
        // Your existing PDF loading logic
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('خطا در ایجاد فایل PDF');
      }
    };

    loadPDFLibraries();
  }, []);

  // Payment options data
  const paymentOptions = [
    {
      id: 1,
      title: 'صدقه به نیت متوفی',
      image: pic1,
      amount: '۵۰۰۰۰ تومان'
    },
    {
      id: 2,
      title: 'نگهداری آرامستان',
      image: pic2,
      amount: '۱۰۰۰۰۰ تومان'
    },
    {
      id: 3,
      title: 'توسعه فضای سبز',
      image: pic3,
      amount: '۷۵۰۰۰ تومان'
    },
    {
      id: 4,
      title: 'امور خیریه مصوب',
      image: pic4,
      amount: '۱۲۰۰۰۰ تومان'
    }
  ];

  // Notifications data
  const notifications = [
    { id: 1, text: 'کاربری به نیت مرحوم احمد رضایی صدقه پرداخت کرد', amount: '۵۰۰۰۰ تومان' }
  ];

  // Create simplified spiritual stars effect
  const createSpiritualElements = () => {
    const elements = [];
    for (let i = 0; i < 40; i++) {
      elements.push({
        id: `star-${i}`,
        type: 'star',
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2,
        size: Math.random() * 20 + 10,
        duration: Math.random() * 2 + 1.5,
        rotation: Math.random() * 360
      });
    }
    for (let i = 0; i < 10; i++) {
      elements.push({
        id: `orb-${i}`,
        type: 'orb',
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 1.5,
        size: Math.random() * 30 + 15,
        duration: Math.random() * 3 + 2
      });
    }
    return elements;
  };

  const [spiritualElements, setSpiritualElements] = useState([]);

  // Open payment overlay
  const handleMainPayment = (paymentOption) => {
    setSelectedPayment(paymentOption);
    setShowPaymentOverlay(true);
    setOverlayStage(1);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedDeceased(null);
    setPaymentAmount('');
    setSelectedAmountPreset(null);
    setMonthlyRepeat(false);
    setOptionalMessage('');
    setNotifyFamily(false);
    setPaymentMethod('bank');
  };

  // Select a deceased person and move to stage 2
  const handleSelectDeceased = (person) => {
    setSelectedDeceased(person);
    setOverlayStage(2);
  };

  // Format number with commas (تومان)
  const formatPrice = (value) => {
    if (!value) return '';
    const num = value.replace(/,/g, '');
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleAmountChange = (e) => {
    let rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === '' || /^\d+$/.test(rawValue)) {
      setPaymentAmount(formatPrice(rawValue));
      setSelectedAmountPreset(null);
    }
  };

  const handlePresetAmount = (amount) => {
    setPaymentAmount(formatPrice(amount.toString()));
    setSelectedAmountPreset(amount);
  };

  // Handle payment submission - shows receipt
  const handleSubmitPayment = () => {
    if (!paymentAmount || parseInt(paymentAmount.replace(/,/g, '')) <= 0) {
      alert('لطفا مبلغ را وارد کنید');
      return;
    }
    setSelectedPayment({
      ...selectedPayment,
      amount: `${paymentAmount} تومان`,
      title: `صدقه به نیت ${selectedDeceased?.fullName || 'مرحوم'}`
    });
    setShowPaymentOverlay(false);
    setShowSpiritualEffect(true);
    setSpiritualElements(createSpiritualElements());
    setShowReceipt(true);
    setTimeout(() => {
      setShowSpiritualEffect(false);
      setSpiritualElements([]);
    }, 3000);
  };

  // Close receipt and go back to help page
  const handleCloseReceiptAndReturn = () => {
    setShowReceipt(false);
    setSelectedPayment(null);
    setShowPaymentOverlay(false);
    setOverlayStage(1);
    setSelectedDeceased(null);
  };

  useEffect(() => {
    const cards = document.querySelectorAll('.Helppage-paymentCard');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('Helppage-fadeIn');
      }, index * 100);
    });
  }, []);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) {
      alert('خطا: رسید یافت نشد');
      return;
    }

    try {
      let canvasLib = html2canvas;
      let pdfLib = jsPDF;

      if (!canvasLib) {
        const html2canvasModule = await import('html2canvas');
        canvasLib = html2canvasModule.default;
      }

      if (!pdfLib) {
        const jsPDFModule = await import('jspdf');
        pdfLib = jsPDFModule.default;
      }

      const receiptBox = document.querySelector('.Helppage-receiptBox');
      if (!receiptBox) {
        alert('خطا: بخش اطلاعات رسید یافت نشد');
        return;
      }

      const canvas = await canvasLib(receiptBox, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new pdfLib('p', 'mm', 'a4');
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPosition = (210 - imgWidth) / 2;
      const yPosition = 60;

      pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
      pdf.save(`رسید_صدقه_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('خطا در ایجاد فایل PDF: ' + error.message);
    }
  };

  const handleShare = async () => {
    if (!pdfReady || !receiptRef.current) {
      alert('سیستم اشتراک گذاری در حال بارگذاری است، لطفا چند لحظه دیگر تلاش کنید');
      return;
    }

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#E9D09D'
      });

      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'receipt.png', { type: 'image/png' });

        if (navigator.share) {
          try {
            await navigator.share({
              title: 'رسید صدقه',
              text: 'رسید پرداخت صدقه دیار باقی',
              files: [file]
            });
          } catch (shareError) {
            console.log('Error sharing:', shareError);
            await navigator.clipboard.writeText(
              `رسید صدقه دیار باقی\n\n` +
              `به نیت: مرحوم ${selectedDeceased?.fullName || 'احمد رضایی'}\n` +
              `مبلغ: ${selectedPayment?.amount}\n` +
              `تاریخ: ${getCurrentDate()}\n` +
              `شماره پیگیری: ${getTrackingNumber()}\n` +
              `طرح: ${selectedPayment?.title}`
            );
            alert('متن رسید در کلیپ بورد کپی شد');
          }
        } else {
          await navigator.clipboard.writeText(
            `رسید صدقه دیار باقی\n\n` +
            `به نیت: مرحوم ${selectedDeceased?.fullName || 'احمد رضایی'}\n` +
            `مبلغ: ${selectedPayment?.amount}\n` +
            `تاریخ: ${getCurrentDate()}\n` +
            `شماره پیگیری: ${getTrackingNumber()}\n` +
            `طرح: ${selectedPayment?.title}`
          );
          alert('متن رسید در کلیپ بورد کپی شد');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error sharing:', error);
      alert('خطا در اشتراک گذاری');
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('fa-IR');
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  };

  const getTrackingNumber = () => {
    return Math.floor(Math.random() * 90000000) + 10000000;
  };

  const renderSpiritualElement = (element) => {
    switch (element.type) {
      case 'star':
        const centerX = 50;
        const centerY = 50;
        const dx = element.left - centerX;
        const dy = element.top - centerY;
        const angle = Math.atan2(dy, dx);
        const moveX = Math.cos(angle) * 300;
        const moveY = Math.sin(angle) * 300;

        return (
          <div
            key={element.id}
            className="Helppage-spiritualStar"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration}s`,
              width: `${element.size}px`,
              height: `${element.size}px`,
              transform: `rotate(${element.rotation}deg)`,
              '--moveX': `${moveX}px`,
              '--moveY': `${moveY}px`
            }}
          >
            ✦
          </div>
        );
      case 'orb':
        return (
          <div
            key={element.id}
            className="Helppage-spiritualOrb"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration}s`,
              width: `${element.size}px`,
              height: `${element.size}px`
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="Helppage-container">
      {/* Header */}
      <div className="Helppage-header">
        <img src={Logo} alt="دیار باقی" className="Helppage-Logo" />
      </div>

      {/* Main Content */}
      <div className="Helppage-mainContent">
        {/* Top Logo */}
        <div className="Helppage-logoArea">
          <img src={logoPic5} alt="دیار باقی" className="Helppage-topLogo" />
        </div>

        {/* Payment Options Grid */}
        <div className="Helppage-paymentGrid">
          {paymentOptions.map((option) => (
            <div key={option.id} className="Helppage-paymentCard">
              <div className="Helppage-paymentCardContent">
                <div className="Helppage-paymentTextSection">
                  <h3 className="Helppage-paymentTitle">{option.title}</h3>
                  <button
                    className="Helppage-payButton"
                    onClick={() => {
                      if (option.id === 1) {
                        handleMainPayment(option);
                      }
                    }}
                  >
                    پرداخت
                  </button>
                </div>
                <div className="Helppage-paymentImageSection">
                  <img src={option.image} alt={option.title} className="Helppage-paymentImage" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notifications Section */}
        <div className="Helppage-notificationsSection">
          <div className="Helppage-notificationsList">
            {notifications.map((notif) => (
              <div key={notif.id} className="Helppage-notificationItem">
                <span className="Helppage-notificationText">{notif.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Overlay - Two Stage */}
      {showPaymentOverlay && (
        <div className="Helppage-overlay">
          <div className="Helppage-paymentOverlayContainer">
            {/* Stage Indicator */}
            <div className="Helppage-stageIndicator">
              <span className={`Helppage-stageStep ${overlayStage === 1 ? 'active' : ''}`}>مرحله 1</span>
              <span className="Helppage-stageLine"></span>
              <span className={`Helppage-stageStep ${overlayStage === 2 ? 'active' : ''}`}>مرحله 2</span>
            </div>

            {/* Return Button */}
            <button
              className="Helppage-overlayReturnButton"
              onClick={() => {
                if (overlayStage === 2) {
                  setOverlayStage(1);
                } else {
                  setShowPaymentOverlay(false);
                }
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#575555d3" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Stage 1: Search for deceased */}
            {overlayStage === 1 && (
              <div className="Helppage-stage1Content">
                <div className="Helppage-searchSection">
                  <div className="Helppage-searchHeader">
                    <h3>جستجوی نام متوفی</h3>
                  </div>
                  <div className="Helppage-searchBarContainer">
                    <div className="Helppage-searchInputWrapper">
                      <svg className="Helppage-searchInputIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E7840" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        className="Helppage-searchInput"
                        placeholder="جستجو بر اساس نام و نام خانوادگی ..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          const term = e.target.value.trim();
                          if (term === '') {
                            setSearchResults([]);
                          } else {
                            const results = deceasedData.filter(person =>
                              person.fullName.includes(term) ||
                              person.name.includes(term) ||
                              person.surname.includes(term)
                            );
                            setSearchResults(results);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Show results - appears automatically while typing */}
                {searchResults.length > 0 && (
                  <div className="Helppage-searchResults">
                    <h4>نتایج جستجو ({searchResults.length})</h4>
                    <div className="Helppage-resultsList">
                      {searchResults.map(person => (
                        <div key={person.id} className="Helppage-resultCard" onClick={() => handleSelectDeceased(person)}>
                          <div className="Helppage-resultInfo">
                            <span className="Helppage-resultName">{person.fullName}</span>
                            <span className="Helppage-resultDetails">{person.city}</span>
                            <span className="Helppage-resultDetails">{person.section} - ردیف {person.row}</span>
                            <span className="Helppage-resultDate">{person.deathDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results message */}
                {searchTerm && searchResults.length === 0 && (
                  <div className="Helppage-noResults">
                    <p>نتیجه‌ای برای "{searchTerm}" یافت نشد</p>
                  </div>
                )}
              </div>
            )}

            {/* Stage 2: Payment Details */}
            {overlayStage === 2 && selectedDeceased && (
              <div className="Helppage-stage2Content">
                {/* Header with bird logo */}
                <div className="Helppage-paymentHeader">
                  <img src={Bird_Logo} alt="bird logo" className="Helppage-birdLogo" />
                  <div className="Helppage-paymentHeaderText">
                    <div className="Helppage-paymentHeaderTitle">صدقه به نیت مرحوم</div>
                    <div className="Helppage-paymentHeaderName">{selectedDeceased.fullName}</div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="Helppage-amountSection">
                  <label className="Helppage-amountLabel">مبلغ (تومان)</label>
                  <div className="Helppage-amountInputWrapper">
                    <input
                      type="text"
                      className="Helppage-amountInput"
                      value={paymentAmount}
                      onChange={handleAmountChange}
                      placeholder="۰"
                    />
                    <span className="Helppage-currency">تومان</span>
                  </div>
                </div>

                {/* Preset Amount Buttons */}
                <div className="Helppage-presetAmounts">
                  {[10000, 20000, 50000, 100000].map(amount => (
                    <button
                      key={amount}
                      className={`Helppage-presetAmountBtn ${selectedAmountPreset === amount ? 'active' : ''}`}
                      onClick={() => handlePresetAmount(amount)}
                    >
                      {selectedAmountPreset === amount && (
                        <span className="Helppage-checkMark">✓</span>
                      )}
                      {new Intl.NumberFormat('en-US').format(amount)}
                    </button>
                  ))}
                </div>

                {/* Monthly Repeat Switch */}
                <div className="Helppage-toggleSection">
                  <button
                    className={`Helppage-toggleSwitch ${monthlyRepeat ? 'active' : ''}`}
                    onClick={() => setMonthlyRepeat(!monthlyRepeat)}
                  >
                    <span className="Helppage-toggleSlider"></span>
                  </button>
                  <span className="Helppage-toggleLabel">تکرار ماهانه</span>
                </div>

                {/* Optional Message */}
                <div className="Helppage-messageSection">
                  <label className="Helppage-messageLabel">پیام شما (اختیاری)</label>
                  <textarea
                    className="Helppage-messageInput"
                    value={optionalMessage}
                    onChange={(e) => setOptionalMessage(e.target.value)}
                    placeholder="خدایا رحمت فرا..."
                    rows={2}
                  />
                </div>

                {/* Notify Family Checkbox */}
                <div className="Helppage-checkboxSection">
                  <label className="Helppage-checkboxLabel">
                    <input
                      type="checkbox"
                      checked={notifyFamily}
                      onChange={(e) => setNotifyFamily(e.target.checked)}
                    />
                    <span>اطلاع رسانی به خانواده متوفی</span>
                  </label>
                </div>

                {/* Payment Method Selection */}
                <div className="Helppage-paymentMethodSection">
                  <label className="Helppage-paymentMethodLabel">پرداخت از</label>
                  <div className="Helppage-paymentMethodOptions">
                    <button
                      className={`Helppage-methodBtn ${paymentMethod === 'bank' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('bank')}
                    >
                      درگاه بانکی
                    </button>
                    <button
                      className={`Helppage-methodBtn ${paymentMethod === 'wallet' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('wallet')}
                    >
                      کیف پول
                    </button>
                  </div>
                </div>

                {/* Pay Button */}
                <button className="Helppage-finalPayButton" onClick={handleSubmitPayment}>
                  پرداخت {paymentAmount ? `${paymentAmount} تومان` : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spiritual Effect */}
      {showSpiritualEffect && (
        <div className="Helppage-spiritualEffect">
          <div className="Helppage-divineLight"></div>
          <div className="Helppage-spiritualElements">
            {spiritualElements.map(element => renderSpiritualElement(element))}
          </div>
        </div>
      )}

      {/* Receipt Overlay */}
      {showReceipt && selectedPayment && (
        <div className="Helppage-overlay">
          <div className="Helppage-receiptContainer" ref={receiptRef}>
            <button className="Helppage-closeButton" onClick={handleCloseReceiptAndReturn}>×</button>

            <div className="Helppage-receiptLogoArea">
              <img src={pic6} alt="بسم الله الرحمن الرحیم" className="Helppage-receiptLogo" />
            </div>

            <div className="Helppage-receiptHeader">
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
                    fill="#6BBE66"
                    d="M48,0c26.51,0,48,21.49,48,48S74.51,96,48,96S0,74.51,0,48 S21.49,0,48,0L48,0z M26.764,49.277c0.644-3.734,4.906-5.813,8.269-3.79c0.305,0.182,0.596,0.398,0.867,0.646l0.026,0.025 c1.509,1.446,3.2,2.951,4.876,4.443l1.438,1.291l17.063-17.898c1.019-1.067,1.764-1.757,3.293-2.101 c5.235-1.155,8.916,5.244,5.206,9.155L46.536,63.366c-2.003,2.137-5.583,2.332-7.736,0.291c-1.234-1.146-2.576-2.312-3.933-3.489 c-2.35-2.042-4.747-4.125-6.701-6.187C26.993,52.809,26.487,50.89,26.764,49.277L26.764,49.277z"
                  />
                </g>
              </svg>
              <h2 className="Helppage-receiptTitle">رسید صدقه</h2>
            </div>

            <div className="Helppage-receiptBox">
              <div className="Helppage-receiptRow">
                <span className="Helppage-receiptLabel">به نیت:</span>
                <span className="Helppage-receiptValue">مرحوم {selectedDeceased?.fullName || 'احمد رضایی'}</span>
              </div>
              <div className="Helppage-receiptRow">
                <span className="Helppage-receiptLabel">مبلغ:</span>
                <span className="Helppage-receiptValue">{selectedPayment.amount}</span>
              </div>
              <div className="Helppage-receiptRow">
                <span className="Helppage-receiptLabel">تاریخ:</span>
                <span className="Helppage-receiptValue">{getCurrentDate()} - ساعت {getCurrentTime()}</span>
              </div>
              <div className="Helppage-receiptRow">
                <span className="Helppage-receiptLabel">شماره پیگیری:</span>
                <span className="Helppage-receiptValue">{getTrackingNumber()}</span>
              </div>
              <div className="Helppage-receiptRow">
                <span className="Helppage-receiptLabel">طرح:</span>
                <span className="Helppage-receiptValue">{selectedPayment.title}</span>
              </div>
              {optionalMessage && (
                <div className="Helppage-receiptRow">
                  <span className="Helppage-receiptLabel">پیام:</span>
                  <span className="Helppage-receiptValue">{optionalMessage}</span>
                </div>
              )}
              {monthlyRepeat && (
                <div className="Helppage-receiptRow">
                  <span className="Helppage-receiptLabel">تکرار:</span>
                  <span className="Helppage-receiptValue">ماهانه</span>
                </div>
              )}
            </div>

            <div className="Helppage-receiptButtons">
              <button className="Helppage-receiptActionButton" onClick={handleShare}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                  <path d="M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                  <path d="M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                  <path d="M8.7 10.7l6.6 -3.4" />
                  <path d="M8.7 13.3l6.6 3.4" />
                </svg>
                اشتراک گذاری
              </button>
              <button className="Helppage-receiptActionButton" onClick={handleDownloadPDF}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                  <path d="M7 11l5 5l5 -5" />
                  <path d="M12 4l0 12" />
                </svg>
                دانلود PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPage;