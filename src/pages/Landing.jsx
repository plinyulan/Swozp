import React, { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "./Landing.css";

export default function Landing({ onNavigate }) {
  const { user } = useAuth();
  const headerRef = useRef(null);
  const revealRef = useRef(null);

  // ถ้า login แล้วเด้งไปหน้า home
  useEffect(() => {
    if (user) onNavigate("home");
  }, [user, onNavigate]);

  // Header มีเงาเมื่อ scroll
  useEffect(() => {
    const onScroll = () => {
      if (!headerRef.current) return;
      headerRef.current.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // เอฟเฟกต์ fade-in เมื่อเลื่อนเจอ feature card
  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("reveal--in");
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (user) return null;

  return (
    <div className="page">
      {/* ========== Header ========== */}
      <header ref={headerRef} className="site-header">
        <div className="site-header__inner">
          <button
            className="logo"
            onClick={() => onNavigate?.("home")}
            aria-label="กลับหน้าแรก"
          >
            <span className="logo__chunk">SWO</span>
            <span className="logo__z">Z</span>
            <span className="logo__chunk">P</span>
          </button>

          <nav className="main-nav">
            <a href="#about" className="main-nav__link">
              เกี่ยวกับเรา
            </a>
            <a href="#learn" className="main-nav__link">
              เรียนรู้เพิ่มเติม
            </a>
            <a href="#security" className="main-nav__link">
              ความปลอดภัย
            </a>
          </nav>
        </div>
      </header>

      {/* ========== Hero ========== */}
      <section id="hero" className="hero">
        {/* ถ้าอยากใช้รูปของตัวเอง ให้แก้ url ใน CSS (.hero__bg) */}
        <div className="hero__bg" />
        <div className="hero__content">
          <h1 className="hero__title">“ SWOZP ”</h1>
          <p className="hero__desc">
            Swozp is a platform for people who love to swap items, helping
            reduce waste and build a better world.
          </p>
          <div className="hero__actions">
            <button
              className="btn btn--primary"
              onClick={() => onNavigate?.("login")}
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </section>

      {/* ========== Feature (รูปซ้าย + กล่องขวาซ้อน) ========== */}
      <section id="about" className="feature">
        <div className="feature__image">
          <img
            src="/image/tv.png"
            alt="Second-hand items"
            className="feature__img"
            loading="lazy"
          />
        </div>

        <div
          ref={revealRef}
          className="feature__card feature__card--overlay reveal"
        >
          <h3 className="feature__card-title">Every swap gives things</h3>
          <p className="feature__card-desc">
          Each exchange is more than just trading stuff — it’s about giving forgotten items a second chance and reducing waste that harms our world.
          When you swap, you help save resources, connect with others, and keep good things in use.
          Together, we can make simple changes that lead to a cleaner, kinder planet.
          </p>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="site-footer">
        <div className="site-footer__grid">
          <div className="footer-left">
            <div className="footer-logo__z">Z</div>
            <p className="footer-desc">
              Simple and easy to use website to make it easy to track parcels
              from multiple carriers in one place. Users can receive real-time
              parcel updates without switching multiple websites.
            </p>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <ul>
              <li>
                <a href="mailto:Email@kmitl.ac.th">Email@kmitl.ac.th</a>
              </li>
              <li>www.Swozp.com</li>
              <li>Tel: 08x-xxx-xxxx</li>
            </ul>
            <div className="social">
              <a className="social__link" aria-label="Facebook" href="#" />
              <a className="social__link" aria-label="Twitter" href="#" />
              <a className="social__link" aria-label="LinkedIn" href="#" />
              <a className="social__link" aria-label="Instagram" href="#" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
