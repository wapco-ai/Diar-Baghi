import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/Main_Logo2.png';
import '../styles/LangPage.css';

// Hardcoded languages
const languages = [
  { id: 1, code: 'fa', name: 'فارسی', english_name: 'Persian', direction: 'rtl' },
  { id: 2, code: 'en', name: 'English', english_name: 'English', direction: 'ltr' },
  { id: 3, code: 'ar', name: 'العربية', english_name: 'Arabic', direction: 'rtl' },
  { id: 4, code: 'ur', name: 'اردو', english_name: 'Urdu', direction: 'rtl' },
];

const LangPage = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(1);

  const handleLanguageSelect = (langId) => {
    setSelectedLanguage(langId);
  };

  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationFinished(true);
    }, 5000); // 3s pause + 2s movement

    return () => clearTimeout(timer);
  }, []);


  const handleLogin = () => {
    if (selectedLanguage) {
      const selected = languages.find((l) => l.id === selectedLanguage);
      if (selected) {
        localStorage.setItem('appLanguage', selected.code);
        localStorage.setItem('appDirection', selected.direction);
      }
      navigate('/MainPage');
    }
  };


  return (
    <div className="lang-page-container">
      <div className={`logo-animation-wrapper ${animationFinished ? "finished" : ""}`}>
        <div className="page-overlay"></div>

        <img
          src={logo}
          alt="دیار باقی"
          className={`lang-logo ${animationFinished ? "finished" : ""}`}
        />
      </div>

      <div className={`lang-page-content ${animationFinished ? "show" : ""}`}>
        <div className="lang-welcome-text">
          <h1 className="welcome-heading">خوش آمدید</h1>
          <p className="welcome-paragraph">لطفاً زبان مورد نظر خود را انتخاب کنید</p>
        </div>

        <div className="lang-options-list">
          {languages.map((lang, index) => (
            <div
              style={{ animationDelay: `${index * 0.2}s` }}
              key={lang.id}
              className={`lang-option fade-item ${selectedLanguage === lang.id ? 'selected' : ''}`}
              onClick={() => handleLanguageSelect(lang.id)}
            >
              <div className="selection-circle">
                {selectedLanguage === lang.id && <div className="inner-circle" />}
              </div>
              <div className="lang-text-container">
                <span className={`lang-code lang-code-${lang.code?.toLowerCase()}`}>
                  ({lang.code?.toUpperCase()})
                </span>
                <span className={`lang-name ${lang.direction === 'ltr' ? 'force-rtl' : ''}`}>
                  {lang.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className={`lang-login-btn ${!selectedLanguage ? 'disabled' : ''}`}
        disabled={!selectedLanguage}
        onClick={handleLogin}
      >
        ورود
      </button>
    </div>
  );
};

export default LangPage;