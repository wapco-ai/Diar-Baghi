import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FavouritePage.css';

const FavouritePage = () => {
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // TEMPORARY FUNCTION FOR SESSION OF FAVOURITE PLACES - START
  // Load favourites from sessionStorage with a consistent key
  const loadFavouritesFromSession = () => {
    const savedFavourites = sessionStorage.getItem('favourites_list');
    if (savedFavourites) {
      return JSON.parse(savedFavourites);
    }
    return [];
  };

  // Save favourites to sessionStorage
  const saveFavouritesToSession = (favouritesData) => {
    sessionStorage.setItem('favourites_list', JSON.stringify(favouritesData));
  };
  // TEMPORARY FUNCTION FOR SESSION OF FAVOURITE PLACES - END

  useEffect(() => {
    // TEMPORARY: Load favourites from sessionStorage
    const savedFavourites = loadFavouritesFromSession();
    setFavourites(savedFavourites);
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
        setDeletingId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const filteredFavourites = favourites.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.section.includes(searchTerm) ||
      item.province.includes(searchTerm);
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'reserved' && item.isReserved) ||
      (selectedFilter === 'saved' && !item.isReserved);
    return matchesSearch && matchesFilter;
  });

  const handleRemoveFavourite = (id, name) => {
    // Show confirmation toast
    setDeletingId(id);
    setToastMessage({
      type: 'confirm',
      text: `آیا از حذف "${name}" اطمینان دارید؟`,
      actions: {
        confirm: () => {
          // Perform the deletion
          const updated = favourites.filter(item => item.id !== id);
          setFavourites(updated);
          // TEMPORARY: Save to sessionStorage
          saveFavouritesToSession(updated);
          
          // Show success toast
          setToastMessage({
            type: 'success',
            text: `مزار "${name}" با موفقیت حذف شد`
          });
          setDeletingId(null);
        },
        cancel: () => {
          setToastMessage(null);
          setDeletingId(null);
        }
      }
    });
  };

  const handleNavigateToMap = (item) => {
    navigate('/mappage', { state: { selectedPerson: item } });
  };

  const getStatusBadge = (item) => {
    if (item.isReserved) {
      return <span className="FavouritePage-statusBadge reserved">رزرو شده</span>;
    }
    return <span className="FavouritePage-statusBadge saved">ذخیره شده</span>;
  };

  return (
    <div className="FavouritePage-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`FavouritePage-toast ${toastMessage.type}`}>
          <div className="FavouritePage-toastContent">
            <span className="FavouritePage-toastText">{toastMessage.text}</span>
            {toastMessage.actions && (
              <div className="FavouritePage-toastActions">
                <button 
                  className="FavouritePage-toastConfirmBtn"
                  onClick={toastMessage.actions.confirm}
                >
                  بله، حذف شود
                </button>
                <button 
                  className="FavouritePage-toastCancelBtn"
                  onClick={toastMessage.actions.cancel}
                >
                  انصراف
                </button>
              </div>
            )}
            {!toastMessage.actions && (
              <button 
                className="FavouritePage-toastCloseBtn"
                onClick={() => setToastMessage(null)}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="FavouritePage-header">
        <div className="FavouritePage-headerSpacer" />
        <h1 className="FavouritePage-headerTitle">مزارهای من</h1>
        <button className="FavouritePage-backBtn" onClick={() => navigate('/MainPage')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="FavouritePage-stats">
        <div className="FavouritePage-statItem">
          <span className="FavouritePage-statNumber">{favourites.length}</span>
          <span className="FavouritePage-statLabel">کل مزارها</span>
        </div>
        <div className="FavouritePage-statItem">
          <span className="FavouritePage-statNumber">{favourites.filter(f => f.isReserved).length}</span>
          <span className="FavouritePage-statLabel">رزرو شده</span>
        </div>
        <div className="FavouritePage-statItem">
          <span className="FavouritePage-statNumber">{favourites.filter(f => !f.isReserved).length}</span>
          <span className="FavouritePage-statLabel">ذخیره شده</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="FavouritePage-toolbar">
        <div className="FavouritePage-searchContainer">
          <svg className="FavouritePage-searchIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5a4a" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="FavouritePage-searchInput"
            placeholder="جستجو در مزارها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="FavouritePage-filters">
          <button
            className={`FavouritePage-filterBtn ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            همه
          </button>
          <button
            className={`FavouritePage-filterBtn ${selectedFilter === 'reserved' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('reserved')}
          >
            رزرو شده
          </button>
          <button
            className={`FavouritePage-filterBtn ${selectedFilter === 'saved' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('saved')}
          >
            ذخیره شده
          </button>
        </div>
      </div>

      {/* Favourites List */}
      <div className="FavouritePage-list">
        {filteredFavourites.length > 0 ? (
          filteredFavourites.map((item) => (
            <div key={item.id} className={`FavouritePage-card ${deletingId === item.id ? 'deleting' : ''}`}>
              <div className="FavouritePage-cardImage">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="FavouritePage-cardImagePlaceholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#BF9A61" stroke="white" strokeWidth="1">
                      <rect x="6" y="8" width="12" height="12" rx="1" />
                      <path d="M12 4v4" stroke="white" strokeWidth="2" />
                      <circle cx="12" cy="6" r="2" fill="white" />
                      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="6">{item.row}/{item.number}</text>
                    </svg>
                  </div>
                )}
                {getStatusBadge(item)}
              </div>
              <div className="FavouritePage-cardContent">
                <h3>{item.name}</h3>
                <p className="FavouritePage-cardSection">{item.section} - ردیف {item.row} - شماره {item.number}</p>
                <p className="FavouritePage-cardLocation">{item.province} - {item.city}</p>
                <p className="FavouritePage-cardDate">تاریخ فوت: {item.deathDate}</p>
                {item.isReserved && item.reservationDate && (
                  <p className="FavouritePage-cardReservationDate">تاریخ رزرو: {item.reservationDate}</p>
                )}
                <div className="FavouritePage-cardActions">
                  <button className="FavouritePage-cardMapBtn" onClick={() => handleNavigateToMap(item)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                      <path d="M8 2v16" />
                      <path d="M16 6v16" />
                    </svg>
                    مشاهده روی نقشه
                  </button>
                  <button 
                    className="FavouritePage-cardRemoveBtn" 
                    onClick={() => handleRemoveFavourite(item.id, item.name)}
                    disabled={deletingId === item.id}
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="FavouritePage-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#BF9A61" strokeWidth="1.5">
              <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
            </svg>
            <p>هیچ مزار ذخیره‌ای وجود ندارد</p>
            <p className="FavouritePage-emptySub">برای ذخیره مزار، از بخش جستجو یا نقشه استفاده کنید</p>
            <button className="FavouritePage-emptyBtn" onClick={() => navigate('/SearchPage')}>
              جستجوی مزار
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavouritePage;