import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Gallery from './pages/Gallery.jsx';
import LoginRegister from './pages/LoginRegister.jsx';
import Upload from './pages/Upload.jsx';
import PhotoDetail from './pages/PhotoDetail.jsx';
import { api } from './api.js';

export default function App() {
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    api('/auth/me')
      .then(setUser)
      .catch((err) => {
        if (err.status !== 401)
          setMessage('Your account could not be loaded. Refresh to try again.');
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  async function logout() {
    setLoggingOut(true);
    try {
      await api('/auth/logout', { method: 'POST' });
      setUser(null);
      setMessage('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoggingOut(false);
    }
  }
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Navbar
        user={user}
        loading={loading}
        onLogout={logout}
        loggingOut={loggingOut}
      />
      <main id="main" className="container">
        {message && (
          <p className="error" role="alert">
            {message}
          </p>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route
            path="/login"
            element={
              loading ? (
                <p className="notice">Checking your account…</p>
              ) : (
                <LoginRegister user={user} onAuthenticated={setUser} />
              )
            }
          />
          <Route
            path="/upload"
            element={<Upload user={user} loading={loading} />}
          />
          <Route
            path="/photos/:id"
            element={<PhotoDetail key={pathname} user={user} />}
          />
          <Route
            path="*"
            element={
              <div className="page">
                <h1>Page not found</h1>
                <Link to="/gallery">Return to gallery</Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer>
        <div className="container">
          <Link className="brand" to="/">
            Alzikrayat
          </Link>
          <span>A shared photo journal</span>
        </div>
      </footer>
    </>
  );
}
