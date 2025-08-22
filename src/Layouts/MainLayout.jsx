import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";
import Footer from "../Components/Footer.jsx";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import "../styles/Hero.css";

const MainLayout = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  
  const [showDownArrow, setShowDownArrow] = useState(false);
  const [showUpArrow, setShowUpArrow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      const fullHeight = document.documentElement.scrollHeight;

      // Check if page is scrollable
      const isScrollable = fullHeight > windowHeight;

      if (!isScrollable) {
        setShowDownArrow(false);
        setShowUpArrow(false);
        return;
      }

      // Update arrows based on scroll position
      if (scrollPosition < fullHeight - windowHeight - 10) {
        setShowDownArrow(true);
        setShowUpArrow(false);
      } else {
        setShowDownArrow(false);
        setShowUpArrow(true);
      }
    };

    // Initial check when component mounts
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="main-layout">
      <Navbar />
      <main className="content">
        <Outlet />
      </main>
      {!isHomepage && <Footer />}

      <div className="scroll-buttons">
        {showDownArrow && (
          <button className="scroll-btn down" onClick={scrollToBottom}>
            <FaArrowDown />
          </button>
        )}
        {showUpArrow && (
          <button className="scroll-btn up" onClick={scrollToTop}>
            <FaArrowUp />
          </button>
        )}
      </div>
    </div>
  );
};

export default MainLayout;