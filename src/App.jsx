import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css';
import './App.css'
import { UserPage } from './components/UserPage'
import Loginpage2 from './components/Loginpage2'
import { AmountTable } from './components/AmountTable'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tablepage } from './components/Tablepage';
import { Accounts } from './components/Accounts';
import { Lookup } from './components/Lookup';
import { useEffect, useRef } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import Profilepage from './components/Profilepage';
import { History } from './components/History';
import { BASE_URL } from './config';
// import MagentaLogo from './assets/Magenta data visualisation on monitor.png';
import Faceicon from './assets/faceicon.png';
import DownArrowIcon from './assets/downarrow.png';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
// Dashboard layout: sidebar + header + the routed page content
function DashboardLayout() {
  const FONT_OPTIONS = [
    { label: '— Default (System) —', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif" },
    { label: 'Inter',                value: "'Inter', sans-serif" },
    { label: 'Roboto',               value: "'Roboto', sans-serif" },
    { label: 'Poppins',              value: "'Poppins', sans-serif" },
    { label: 'Outfit',               value: "'Outfit', sans-serif" },
    { label: 'Montserrat',           value: "'Montserrat', sans-serif" },
    { label: 'Nunito',               value: "'Nunito', sans-serif" },
    { label: 'Lato',                 value: "'Lato', sans-serif" },
    { label: 'Playwrite GB S',       value: "'Playwrite GB S', cursive" },
    { label: 'Merriweather',         value: "'Merriweather', serif" },
    { label: 'Fira Code',            value: "'Fira Code', monospace" },
  ];

  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const userProfileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userProfileRef.current && !userProfileRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  const navigate = useNavigate();
  const [username, setusername] = useState("User name")
  const [userphoto, setuserphoto] = useState(null);
  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || '#0d1b3e');
  const [selectedFont, setSelectedFont] = useState(
    localStorage.getItem('globalFont') || "'Playwrite GB S', cursive"
  );

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
    document.documentElement.style.setProperty('--navy', themeColor);
    document.documentElement.style.setProperty('--navy-mid', themeColor);
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  useEffect(() => {
    document.documentElement.style.setProperty('--global-font', selectedFont);
    localStorage.setItem('globalFont', selectedFont);
  }, [selectedFont]);

  useEffect(() => {

    const token = localStorage.getItem('token');
    console.log(token)
    if (token) {
      fetch(`${BASE_URL}/users/me/details`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.status_code === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            window.location.reload();
            return;
          }
          setusername(data?.data.full_name)
          setuserphoto(data?.data.photo_url)
          if (data?.data.role) {
            localStorage.setItem('user_role', data.data.role);
          }
        })
        .catch(error => console.error(error));
    }
  }, []);
  return (
    <div className="fullpage">
      <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <div id="navtitle">
          <div>
            <DotLottieReact
              src="https://lottie.host/903d518c-7432-4619-a861-77f077140680/gkrDPQG92O.lottie"
              loop
              autoplay
            />
          </div>
          <h3>Dashboard</h3>
          <button id='sidebar-close-btn' onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>

        <div id='navBtn'>
          <NavLink to="/dashboard" style={{ textDecoration: "none" }} onClick={() => setIsSidebarOpen(false)} end>
            <button>Home</button>
          </NavLink>
          <NavLink to="/table" style={{ textDecoration: "none" }} onClick={() => setIsSidebarOpen(false)}>
            <button>Orders</button>
          </NavLink>
          <NavLink to="/accounts" style={{ textDecoration: "none" }} onClick={() => setIsSidebarOpen(false)}>
            <button>Accounts</button>
          </NavLink>
          {(localStorage.getItem('user_role') === 'admin' || localStorage.getItem('user_role') === 'manager') && (
            <NavLink to="/Lookup" style={{ textDecoration: "none" }} onClick={() => setIsSidebarOpen(false)}>
              <button>Lookups</button>
            </NavLink>
          )}
          {/* <NavLink to="/AmountTable" style={{ textDecoration: "none" }} onClick={() => setIsSidebarOpen(false)}>
            <button>Amount table</button>
          </NavLink>
          <NavLink to="/history" style={{ textDecoration: "none" }} onClick={() => setIsSidebarOpen(false)}>
            <button>History</button>
          </NavLink> */}
        </div>

        {/* <div className='navfooter'>
           <DotLottieReact
      src="https://lottie.host/bf461d9f-d99a-4c23-b496-f5a915a00e42/xFMNTCu2FH.lottie"
      loop
      autoplay
    />
        </div> */}
      </div>

      <div className="pages">
        <div id='pageheader'>
          <button id='mobile-toggle' onClick={() => setIsSidebarOpen(!isSidebarOpen)}>⋮</button>
          <div id='header-search'>
            <span style={{ color: '#ccc', marginRight: '10px' }}>🔍</span>
            <input
              type="search"
              placeholder='Search Here'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>
          <div id='userprofile' ref={userProfileRef}>
            <img src={userphoto ? `${BASE_URL}/${userphoto}` : Faceicon} alt="profile" />
            <h3>{username}</h3>
            <button id='dropdown-btn' onClick={handleDropdown}><img src={DownArrowIcon} alt="" /></button>
            {
              showDropdown && (
                <div className='dropdown'>
                  {/* ── Theme colour ── */}
                  <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label htmlFor="themePicker" style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>Theme:</label>
                    <input
                      type="color"
                      id="themePicker"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer', padding: 0, background: 'transparent' }}
                      title="Change Theme Color"
                    />
                  </div>
                  <hr style={{ border: 'none', borderBottom: '1px solid #eee', margin: '5px 0' }} />
                  {/* ── Font picker ── */}
                  <div style={{ padding: '10px 10px 4px' }}>
                    <label htmlFor="fontPicker" style={{ fontSize: '13px', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Font:</label>
                    <select
                      id="fontPicker"
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '13px',
                        cursor: 'pointer',
                        background: '#fafafa',
                        color: '#333',
                        outline: 'none',
                        fontFamily: selectedFont,
                      }}
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <hr style={{ border: 'none', borderBottom: '1px solid #eee', margin: '5px 0' }} />
                  <button onClick={() => navigate('/profile')}>My Profile</button>

                  <button id='logout-btn' onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    navigate('/');
                  }}>Logout</button>
                  
                </div>
              )
            }
          </div>
        </div>

        <div className='otherpages'>
          <Routes>
            <Route path="/dashboard" element={<UserPage searchTerm={searchTerm} />} />
            <Route path="table" element={<Tablepage searchTerm={searchTerm} />} />
            <Route path="accounts" element={<Accounts searchTerm={searchTerm} />} />
            {(localStorage.getItem('user_role') === 'admin' || localStorage.getItem('user_role') === 'manager') ? (
              <Route path="Lookup" element={<Lookup searchTerm={searchTerm} />} />
            ) : (
              <Route path="Lookup" element={<Navigate to="/dashboard" replace />} />
            )}
            <Route path="profile" element={<Profilepage />} />
            <Route path="amounttable" element={<AmountTable searchTerm={searchTerm} />} />
            <Route path="history" element={<History searchTerm={searchTerm} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Login page — no sidebar/header */}
      <Route path="/" element={<Loginpage2 />} />

      {/* Dashboard and its nested pages protected by login */}
      <Route path="/*" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      } />

      {/* Catch-all → redirect to login */}
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );
}

export default App
