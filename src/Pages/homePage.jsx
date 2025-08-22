import React from 'react';
import '../styles/Hero.css';
import choirImage from '../assets/logo1.jpg'; // Circular image


const Hero = () => {


  return (
    <div className="hero-section">
      <div className="hero-overlay">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Wellbeing <br />of a family</h1>
            <p>
              To advance the choir's commitment and achieve its 
              prime goal of evangelizing through music, family of 
              singers also aims at promoting good family 
              relationships grounded in Christian values.
            </p>

          </div>
          <div className="hero-image">
            <img src={choirImage} alt="Choir" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;