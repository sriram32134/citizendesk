import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import MobileNumberModal from "../components/Home/MobileNumberModal";
import LoginModal from "../components/common/LoginModal";
import FeedbackModal from "../components/common/FeedbackModal";
import VroLogin from "./VroLogin";
import menubar from "../assets/menubar.png"
import officericon from "/src/assets/officer.png"

function Home() {
  const [showTrackPopup, setShowTrackPopup] = useState(false);
  const [showVroLogin, setShowVroLogin] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [officer, setOfficer] = useState(null);

  const navigate = useNavigate();
  const profileRef = useRef(null);

  /* Load officer session */
  useEffect(() => {
    const savedOfficer = localStorage.getItem("officer");
    if (savedOfficer) setOfficer(JSON.parse(savedOfficer));
  }, []);

  /* Close profile dropdown on outside click */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("officer");
    setOfficer(null);
    setShowProfileMenu(false);
    setShowMobileMenu(false);
    navigate("/");
  };

  const navLinkStyle =
    "nav-link fw-bold px-3 mx-1 border-0 bg-transparent nav-tab-hover";

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "#f4f7f9" }}
    >
      {/* ================= HEADER ================= */}
      <header className="sticky-top shadow-sm" style={{ zIndex: 100 }}>
        <div className="container d-flex justify-content-between align-items-center py-3">

          {/* LEFT SIDE (Mobile Menu + Logo) */}
          <div className="d-flex align-items-center gap-3">

            {/* ☰ Mobile Menu Button */}
            <button
              className="btn d-lg-none text-white fs-3 p-0"
              onClick={() => setShowMobileMenu(true)}
            >
              <img src={menubar} alt="Menu" className="w-100 h-70" style={{ width: 35, height: 35 }} />
            </button>

            <Link to="/" className="text-decoration-none d-flex align-items-center">
              <div
                className="text-white rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48, backgroundColor: "#003366" }}
              >
                🏛️
              </div>
              <div>
                <h3 className="fw-bolder m-0 text-white">CitizenDesk</h3>
                <small className="text-white-50 fw-bold">
                  GOVERNMENT OF INDIA
                </small>
              </div>
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <nav className="d-none d-lg-block">
            <ul className="nav align-items-center gap-3">

              {!officer && (
                <>
                  <li><Link className={navLinkStyle} to="/latest-news">Latest News</Link></li>
                  <li><Link className={navLinkStyle} to="/raise-complaint">Report Issue</Link></li>
                  <li>
                    <button className={navLinkStyle} onClick={() => setShowTrackPopup(true)}>
                      Track Status
                    </button>
                  </li>
                  <li>
                    <button className={navLinkStyle} onClick={() => setShowVroLogin(true)}>
                      Officer Login
                    </button>
                  </li>
                </>
              )}

              {officer && (
                <li className="position-relative" ref={profileRef}>
                  <button
                    className="btn d-flex align-items-center gap-2 bg-transparent border-0 text-white fw-bold"
                    onClick={() => setShowProfileMenu((p) => !p)}
                  >
                    <img
                      src={officericon}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: 35, height: 35 }}
                    />
                    <span className="text-white">Hello, Govt Officer ▾</span>
                  </button>

                  {showProfileMenu && (
                    <div
                      className="position-absolute end-0 mt-2 rounded shadow-lg"
                      style={{ minWidth: 200, backgroundColor: "#1f2933" }}
                    >
                      <Link
                        to="/admin-dashboard"
                        className="d-block px-4 py-3 text-white text-decoration-none border-bottom border-secondary"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        className="w-100 text-start px-4 py-3 bg-transparent border-0 text-danger fw-bold"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex-grow-1">
        <Outlet context={{ setShowTrackPopup }} />
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="pt-5" style={{ backgroundColor: "#001a33" }}>
        <div className="container pb-4 text-white">
          <div className="row gy-4">
            <div className="col-md-4">
              <h5 className="fw-bold">CitizenDesk</h5>
              <p className="text-white-50 small">
                National Grievance Redressal Platform powered by Digital India.
              </p>
              {!officer && (
                <button
                  className="btn btn-sm rounded-pill fw-bold"
                  style={{ backgroundColor: "#ff9933", color: "#000" }}
                  onClick={() => setShowFeedback(true)}
                >
                  Share Feedback
                </button>
              )}
            </div>

            <div className="col-md-4">
              <h6 className="fw-bold">Quick Links</h6>
              <ul className="list-unstyled">
                <li><Link to="/" className="text-white-50">Home</Link></li>
                <li><Link to="/latest-news" className="text-white-50">Public Schemes</Link></li>
              </ul>
            </div>

            <div className="col-md-4">
              <h6 className="fw-bold">Contact</h6>
              <p className="small text-white-50">help@citizendesk.gov.in</p>
              <p className="small text-white-50">1800-11-4556</p>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= MOBILE BACKDROP ================= */}
      <div
        className={`mobile-backdrop ${showMobileMenu ? "show" : ""}`}
        onClick={() => setShowMobileMenu(false)}
      />

      {/* ================= MOBILE SLIDING DRAWER ================= */}
      <div className={`mobile-drawer ${showMobileMenu ? "open" : ""}`}>
        <div className="drawer-header">
          <button
            className="btn text-white fs-4"
            onClick={() => setShowMobileMenu(false)}
          >
            <strong>←</strong>
          </button>
          <strong className="fw-bold text-white">Menu</strong>
        </div>

        <div className="drawer-links drawer-boxed-links">

          {!officer && (
            <>
              <Link to="/" onClick={() => setShowMobileMenu(false)}><strong>Home →</strong></Link>
              <Link to="/latest-news" onClick={() => setShowMobileMenu(false)}><strong>Latest News →</strong></Link>
              <Link to="/raise-complaint" onClick={() => setShowMobileMenu(false)}><strong>Report Issue →</strong></Link>
              <button onClick={() => { setShowTrackPopup(true); setShowMobileMenu(false); }}>
                <strong>Track Status →</strong>
              </button>
              <button onClick={() => { setShowVroLogin(true); setShowMobileMenu(false); }}>
                <strong>Officer Login →</strong>
              </button>
              <button onClick={() => { setShowFeedback(true); setShowMobileMenu(false); }}>
                <strong>Share Feedback →</strong>
              </button>
            </>
          )}

          {officer && (
            <>
              <Link to="/admin-dashboard" onClick={() => setShowMobileMenu(false)}>
                <strong>Dashboard →</strong>
              </Link>
              <button className="text-danger" onClick={handleLogout}>
                <strong>Logout →</strong>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {showTrackPopup && (
        <MobileNumberModal
          onClose={() => setShowTrackPopup(false)}
          onSubmit={(m) => navigate("/history", { state: { mobileNumber: m } })}
        />
      )}

      {showVroLogin && (
        <LoginModal onClose={() => setShowVroLogin(false)}>
          <VroLogin
            onLogin={() => {
              const saved = localStorage.getItem("officer");
              if (saved) setOfficer(JSON.parse(saved));
              setShowVroLogin(false);
            }}
          />
        </LoginModal>
      )}

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  );
}

export default Home;
