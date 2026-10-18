import React, { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiHeart,
  FiSend,
  FiCheck,
  FiMaximize2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUpRight,
  FiCompass,
} from 'react-icons/fi';
import { submitInvitationRsvp } from '../../../../store/invitationSlice';
import AudioPlayer from '../../sections/AudioPlayer';
import PartyUpload from '../../sections/PartyUpload';
import CoupleName from '../../components/CoupleName';
import ringCoverImage from '../../../../assets/images/begandy-demo/ring-cover.png';
import ringFilmVideo from '../../../../assets/images/begandy-demo/ring-film.mp4';
import heroPortrait from '../../../../assets/images/begandy-demo/hero-per.png';
import './index.css';

const rise = {
  hidden: { opacity: 0, y: 28 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};
const stagger = { hidden: {}, shown: { transition: { staggerChildren: 0.12 } } };
const reveal = { once: true, amount: 0.18 };

const calculateTime = (target) => {
  const diff = new Date(target).getTime() - Date.now();
  if (!target || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
};

const buildMapsUrl = (event = {}) => {
  if (event.map_url) return event.map_url;
  const query = [event.venue, event.location, event.address].filter(Boolean).join(', ');
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : '';
};

// Botanical Rose Section Divider (Artistic Gilded Floral Flourish)
const EditorialDivider = ({ className = '' }) => (
  <div className={`chic-editorial-divider ${className}`} aria-hidden="true">
    <span className="chic-divider-line" />
    <svg viewBox="0 0 64 22" className="chic-divider-rose-svg">
      <defs>
        <linearGradient id="divRoseGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e5c57a" />
          <stop offset="50%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#e5c57a" />
        </linearGradient>
      </defs>
      {/* Left Rose Leaf */}
      <path d="M22,11 C15,6 8,10 5,11 C10,14 17,14 22,11 Z" fill="url(#divRoseGold)" opacity="0.8" />
      {/* Right Rose Leaf */}
      <path d="M42,11 C49,6 56,10 59,11 C54,14 47,14 42,11 Z" fill="url(#divRoseGold)" opacity="0.8" />
      {/* Rosebud Petals */}
      <path d="M27,11 C26,5 31,3 32,7 C33,3 38,5 37,11 Z" fill="url(#divRoseGold)" opacity="0.9" />
      {/* Center Blooming Rose */}
      <circle cx="32" cy="11" r="5.5" fill="none" stroke="url(#divRoseGold)" strokeWidth="1.2" />
      <path
        d="M29,10 C30,7 34,7 35,10 C36,12 33,14 31,13 C30,12 30,10 32,10"
        fill="none"
        stroke="url(#divRoseGold)"
        strokeWidth="1.2"
      />
      <circle cx="32" cy="11" r="1.5" fill="#fff8e7" />
    </svg>
    <span className="chic-divider-line" />
  </div>
);

// Bespoke Hand-Crafted Gilded Botanical Rose Corner Flourish
const RoseCornerFlourish = ({ position = 'tl' }) => (
  <div className={`chic-rose-corner chic-rose-${position}`} aria-hidden="true">
    <svg viewBox="0 0 90 90" className="rose-corner-svg">
      <defs>
        <linearGradient id={`roseGoldGrad-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8e7" />
          <stop offset="25%" stopColor="#ffd700" />
          <stop offset="60%" stopColor="#d4af37" />
          <stop offset="85%" stopColor="#a3761e" />
          <stop offset="100%" stopColor="#ffd700" />
        </linearGradient>
      </defs>
      {/* Corner Outer Flourish Line */}
      <path
        d="M6,84 C6,38 38,6 84,6"
        fill="none"
        stroke={`url(#roseGoldGrad-${position})`}
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity="0.6"
      />
      {/* Main Floral Swirl Stem */}
      <path
        d="M10,75 C10,34 34,10 75,10"
        fill="none"
        stroke={`url(#roseGoldGrad-${position})`}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Botanical Rose Leaves along Top Vine */}
      <path
        d="M45,10 C50,4 62,3 64,12 C56,15 48,14 45,10 Z"
        fill={`url(#roseGoldGrad-${position})`}
        opacity="0.75"
      />
      <path
        d="M58,10 C62,7 70,6 72,12"
        fill="none"
        stroke={`url(#roseGoldGrad-${position})`}
        strokeWidth="0.8"
      />
      {/* Budding Rose on Top Edge */}
      <circle cx="78" cy="10" r="3.5" fill={`url(#roseGoldGrad-${position})`} />
      <path d="M75,10 C77,7 81,7 82,10 C80,12 76,12 75,10 Z" fill="#6a0a22" />

      {/* Botanical Rose Leaves along Left Vine */}
      <path
        d="M10,45 C4,50 3,62 12,64 C15,56 14,48 10,45 Z"
        fill={`url(#roseGoldGrad-${position})`}
        opacity="0.75"
      />
      <path
        d="M10,58 C7,62 6,70 12,72"
        fill="none"
        stroke={`url(#roseGoldGrad-${position})`}
        strokeWidth="0.8"
      />
      {/* Budding Rose on Left Edge */}
      <circle cx="10" cy="78" r="3.5" fill={`url(#roseGoldGrad-${position})`} />
      <path d="M10,75 C7,77 7,81 10,82 C12,80 12,76 10,75 Z" fill="#6a0a22" />

      {/* Central Majestic Corner Rose (Layered Blooming Petals) */}
      <g transform="translate(24, 24)">
        {/* Calyx / Sepals */}
        <path d="M-6,-2 C-14,-8 -12,-16 -4,-12 Z" fill={`url(#roseGoldGrad-${position})`} opacity="0.65" />
        <path d="M-2,-6 C-8,-14 -16,-12 -12,-4 Z" fill={`url(#roseGoldGrad-${position})`} opacity="0.65" />
        <path d="M6,2 C14,8 12,16 4,12 Z" fill={`url(#roseGoldGrad-${position})`} opacity="0.65" />
        <path d="M2,6 C8,14 16,12 12,4 Z" fill={`url(#roseGoldGrad-${position})`} opacity="0.65" />
        
        {/* Outer Rose Petals */}
        <circle cx="0" cy="0" r="14" fill="none" stroke={`url(#roseGoldGrad-${position})`} strokeWidth="1.2" />
        <path
          d="M-12,0 C-12,-8 -6,-13 0,-13 C6,-13 12,-8 12,0 C12,8 6,13 0,13 C-6,13 -12,8 -12,0 Z"
          fill="none"
          stroke={`url(#roseGoldGrad-${position})`}
          strokeWidth="1.4"
          opacity="0.9"
        />
        {/* Intermediate Rose Petals (Spiral Bloom) */}
        <path
          d="M-9,-3 C-7,-10 3,-10 8,-5 C11,0 7,9 1,9 C-5,9 -10,3 -7,-3"
          fill="none"
          stroke={`url(#roseGoldGrad-${position})`}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Inner Heart of the Rose */}
        <path
          d="M-4,-2 C-2,-6 4,-5 5,-1 C6,3 1,6 -2,5 C-4,4 -5,0 -3,-2"
          fill={`url(#roseGoldGrad-${position})`}
          stroke="#55051d"
          strokeWidth="0.6"
        />
        <circle cx="0" cy="0" r="2" fill="#fff8e7" />
      </g>

      {/* Little Gilded Sparkle Stars */}
      <polygon points="40,24 41.5,27 44,28 41.5,29 40,32 38.5,29 36,28 38.5,27" fill={`url(#roseGoldGrad-${position})`} />
      <polygon points="24,40 25.5,43 28,44 25.5,45 24,48 22.5,45 20,44 22.5,43" fill={`url(#roseGoldGrad-${position})`} />
    </svg>
  </div>
);

// Gilded Botanical Rose Medallion (Watermark for Burgundy Cards)
const RoseWatermarkMedallion = ({ className = '' }) => (
  <div className={`chic-rose-watermark ${className}`} aria-hidden="true">
    <svg viewBox="0 0 240 240" className="rose-watermark-svg">
      <defs>
        <radialGradient id="watermarkRoseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(229, 197, 122, 0.28)" />
          <stop offset="40%" stopColor="rgba(197, 153, 51, 0.12)" />
          <stop offset="80%" stopColor="rgba(116, 14, 45, 0.05)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="wmRoseGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8e7" />
          <stop offset="50%" stopColor="#e5c57a" />
          <stop offset="100%" stopColor="#ffd700" />
        </linearGradient>
      </defs>
      {/* Background Soft Glow */}
      <circle cx="120" cy="120" r="115" fill="url(#watermarkRoseGlow)" />
      {/* Dotted Filigree Ring */}
      <circle cx="120" cy="120" r="105" fill="none" stroke="url(#wmRoseGold)" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.35" />
      <circle cx="120" cy="120" r="95" fill="none" stroke="url(#wmRoseGold)" strokeWidth="0.6" opacity="0.25" />
      
      {/* 8 Botanical Acanthus Leaves Radiating outward */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 120 120)`}>
          <path
            d="M120,38 C114,54 112,74 120,90 C128,74 126,54 120,38 Z"
            fill="none"
            stroke="url(#wmRoseGold)"
            strokeWidth="0.8"
            opacity="0.3"
          />
          <path d="M120,38 L120,90" stroke="url(#wmRoseGold)" strokeWidth="0.5" opacity="0.25" />
          <circle cx="120" cy="32" r="2.5" fill="url(#wmRoseGold)" opacity="0.4" />
        </g>
      ))}

      {/* Layered English Garden Rose Petals */}
      <g transform="translate(120, 120)">
        {/* Tier 1 - Outermost Grand Petals */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path
            key={deg}
            transform={`rotate(${deg})`}
            d="M-28,-40 C-10,-55 10,-55 28,-40 C38,-20 32,-2 0,0 C-32,-2 -38,-20 -28,-40 Z"
            fill="none"
            stroke="url(#wmRoseGold)"
            strokeWidth="1.1"
            opacity="0.45"
          />
        ))}
        {/* Tier 2 - Mid Petals */}
        {[30, 90, 150, 210, 270, 330].map((deg) => (
          <path
            key={deg}
            transform={`rotate(${deg})`}
            d="M-20,-28 C-8,-38 8,-38 20,-28 C28,-14 22,0 0,0 C-22,0 -28,-14 -20,-28 Z"
            fill="none"
            stroke="url(#wmRoseGold)"
            strokeWidth="1.2"
            opacity="0.55"
          />
        ))}
        {/* Tier 3 - Inner Rose Swirl */}
        <path
          d="M-15,-6 C-12,-18 6,-18 14,-9 C20,0 14,14 2,14 C-10,14 -18,4 -13,-7 C-9,-15 3,-14 9,-7 C12,0 7,9 0,9 C-6,9 -10,3 -7,-3"
          fill="none"
          stroke="url(#wmRoseGold)"
          strokeWidth="1.4"
          opacity="0.65"
        />
        {/* Rose Core Bud */}
        <circle cx="0" cy="0" r="3.5" fill="url(#wmRoseGold)" opacity="0.75" />
      </g>
    </svg>
  </div>
);

// Botanical Wall Engraving (3-Rose Spray matching user reference)
const WallRoseSprayMural = ({ className = '', flip = false }) => (
  <div
    className={`chic-wall-rose-mural ${flip ? 'is-flipped' : ''} ${className}`}
    aria-hidden="true"
  >
    <svg viewBox="0 0 320 460" className="wall-mural-svg">
      <defs>
        <linearGradient id={`muralGold-${flip ? 'r' : 'l'}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.85" />
          <stop offset="30%" stopColor="#ffd700" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#d4af37" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a3761e" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Main Flowing Vine Stems */}
      <path
        d="M 60,30 C 80,90 120,160 170,220 C 210,270 230,330 250,420"
        fill="none"
        stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M 120,150 C 90,180 50,210 30,260"
        fill="none"
        stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M 210,280 C 240,295 280,310 295,350"
        fill="none"
        stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Tendril Spirals */}
      <path
        d="M 60,30 C 50,15 65,5 75,15 C 80,22 75,32 65,30"
        fill="none"
        stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
        strokeWidth="1.4"
      />
      <path
        d="M 250,420 C 265,445 250,455 240,448 C 232,440 240,428 252,430"
        fill="none"
        stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
        strokeWidth="1.4"
      />

      {/* Leaf Clusters with Veins (Artistic Stencil Leaves) */}
      {/* Cluster 1: Top */}
      <path
        d="M 85,55 C 65,40 50,55 58,72 C 72,70 85,62 85,55 Z"
        fill={`url(#muralGold-${flip ? 'r' : 'l'})`}
        opacity="0.8"
      />
      <path
        d="M 98,70 C 105,48 125,48 122,68 C 112,74 102,74 98,70 Z"
        fill={`url(#muralGold-${flip ? 'r' : 'l'})`}
        opacity="0.8"
      />
      {/* Cluster 2: Mid-Left */}
      <path
        d="M 130,175 C 95,170 85,195 105,210 C 120,200 130,188 130,175 Z"
        fill={`url(#muralGold-${flip ? 'r' : 'l'})`}
        opacity="0.8"
      />
      <path
        d="M 45,235 C 20,230 15,255 35,268 C 50,258 55,248 45,235 Z"
        fill={`url(#muralGold-${flip ? 'r' : 'l'})`}
        opacity="0.75"
      />
      {/* Cluster 3: Mid-Right */}
      <path
        d="M 205,200 C 228,180 245,195 235,215 C 218,218 208,210 205,200 Z"
        fill={`url(#muralGold-${flip ? 'r' : 'l'})`}
        opacity="0.8"
      />
      <path
        d="M 230,260 C 255,250 270,268 258,285 C 242,282 235,272 230,260 Z"
        fill={`url(#muralGold-${flip ? 'r' : 'l'})`}
        opacity="0.8"
      />
      {/* Cluster 4: Bottom */}
      <path
        d="M 225,360 C 200,365 195,390 215,400 C 228,388 232,375 225,360 Z"
        fill={`url(#muralGold-${flip ? 'r' : 'l'})`}
        opacity="0.75"
      />
      <path
        d="M 265,370 C 290,365 300,388 285,405 C 270,398 265,385 265,370 Z"
        fill={`url(#muralGold-${flip ? 'r' : 'l'})`}
        opacity="0.75"
      />

      {/* ROSE 1: Top-Left Bloom (Medium Rose) */}
      <g transform="translate(100, 110)">
        <circle cx="0" cy="0" r="32" fill="rgba(35, 3, 14, 0.4)" stroke={`url(#muralGold-${flip ? 'r' : 'l'})`} strokeWidth="1" opacity="0.4" />
        <path
          d="M -26,-10 C -32,-30 -8,-36 0,-30 C 12,-36 32,-28 28,-8 C 36,8 24,28 8,28 C -8,32 -28,24 -26,-10 Z"
          fill="none"
          stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
          strokeWidth="2.2"
        />
        <path
          d="M -20,-8 C -22,-22 -4,-24 0,-18 C 8,-24 22,-18 18,-4 C 24,8 14,20 0,20 C -14,20 -22,8 -20,-8 Z"
          fill="none"
          stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
          strokeWidth="2"
        />
        <path
          d="M -12,-4 C -14,-14 2,-14 6,-8 C 12,0 4,12 -4,11 C -10,10 -13,0 -8,-6 C -4,-10 3,-8 5,-4 C 6,0 2,4 -1,4 C -4,4 -5,0 -3,-2"
          fill="none"
          stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="0" cy="0" r="2.5" fill="#fff8e7" />
      </g>

      {/* ROSE 2: Center Grand Bloom (Largest Frontal Rose) */}
      <g transform="translate(170, 230)">
        <circle cx="0" cy="0" r="46" fill="rgba(35, 3, 14, 0.4)" stroke={`url(#muralGold-${flip ? 'r' : 'l'})`} strokeWidth="1.2" opacity="0.4" />
        <path
          d="M -40,-15 C -46,-40 -12,-48 0,-40 C 14,-48 46,-38 42,-12 C 52,12 36,40 10,42 C -12,46 -42,34 -40,-15 Z"
          fill="none"
          stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
          strokeWidth="2.6"
        />
        <path
          d="M -30,-12 C -34,-30 -8,-34 0,-26 C 10,-34 32,-26 28,-8 C 34,10 24,30 2,30 C -20,30 -32,12 -30,-12 Z"
          fill="none"
          stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
          strokeWidth="2.2"
        />
        <path
          d="M -20,-8 C -22,-20 -4,-22 0,-16 C 8,-22 22,-16 18,-4 C 22,8 14,18 0,18 C -14,18 -22,6 -20,-8 Z"
          fill="none"
          stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
          strokeWidth="2"
        />
        <path
          d="M -13,-4 C -15,-14 3,-14 7,-8 C 13,0 5,12 -4,11 C -11,10 -14,0 -9,-6 C -5,-10 3,-8 5,-4 C 6,0 2,4 -1,4"
          fill="none"
          stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="0" cy="0" r="3" fill="#fff8e7" />
      </g>

      {/* ROSE 3: Lower-Right Bloom (Small Rose) */}
      <g transform="translate(235, 340)">
        <circle cx="0" cy="0" r="26" fill="rgba(35, 3, 14, 0.4)" stroke={`url(#muralGold-${flip ? 'r' : 'l'})`} strokeWidth="0.8" opacity="0.4" />
        <path
          d="M -22,-8 C -26,-24 -6,-28 0,-22 C 10,-28 26,-20 22,-6 C 28,8 18,22 6,22 C -6,24 -22,18 -22,-8 Z"
          fill="none"
          stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
          strokeWidth="2"
        />
        <path
          d="M -15,-6 C -16,-16 -2,-18 0,-12 C 6,-18 16,-12 14,-3 C 18,6 10,14 0,14 C -10,14 -16,4 -15,-6 Z"
          fill="none"
          stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
          strokeWidth="1.8"
        />
        <path
          d="M -9,-3 C -10,-10 2,-10 5,-5 C 9,0 4,8 -2,8 C -7,8 -9,0 -6,-4 C -3,-7 2,-6 3,-3 C 4,0 1,3 -1,3"
          fill="none"
          stroke={`url(#muralGold-${flip ? 'r' : 'l'})`}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="0" cy="0" r="2" fill="#fff8e7" />
      </g>
    </svg>
  </div>
);

// Minimalist Continuous One-Line Rose Frieze (Architectural Wall Carving matching user reference)
const ContinuousLineRoseFrieze = ({ className = '' }) => (
  <div className={`chic-wall-frieze ${className}`} aria-hidden="true">
    <svg viewBox="0 0 1200 130" preserveAspectRatio="none" className="wall-frieze-svg">
      <defs>
        <linearGradient id="friezeLineGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(212, 175, 55, 0)" />
          <stop offset="25%" stopColor="rgba(229, 197, 122, 0.45)" />
          <stop offset="50%" stopColor="rgba(255, 235, 180, 0.85)" />
          <stop offset="75%" stopColor="rgba(229, 197, 122, 0.45)" />
          <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
        </linearGradient>
      </defs>
      <path
        d="M 0,65 L 510,65 C 525,65 536,58 540,48 C 545,34 532,22 520,32 C 510,42 516,74 544,82 C 560,86 582,80 588,68 C 572,66 560,48 568,32 C 577,14 610,10 626,22 C 635,32 632,48 618,54 C 602,60 585,48 593,37 C 598,28 614,30 616,37 C 618,44 606,48 600,46 M 622,37 C 638,24 660,28 668,44 C 677,62 660,82 638,85 C 616,87 597,80 588,68 M 638,82 C 652,86 668,78 674,66 C 680,53 674,36 660,26 C 642,13 614,10 586,14 C 558,18 540,32 536,48 M 674,66 C 684,78 705,80 720,65 L 1200,65"
        fill="none"
        stroke="url(#friezeLineGold)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);



// High-Fashion Section Heading
const EditorialSectionHeading = ({ kicker, title }) => (
  <motion.header variants={rise} className="chic-section-header">
    {kicker ? <p className="chic-header-kicker">{kicker}</p> : null}
    <h2 className="chic-header-title">{title}</h2>
    <EditorialDivider />
  </motion.header>
);



// Bespoke Royal Heart Key Jewel (Pure 24K Gold Vector Art)
const RoyalHeartKey = () => (
  <div className="royal-heart-key-assembly" aria-hidden="true">
    <svg viewBox="0 0 140 180" className="royal-heart-key-svg">
      <defs>
        <linearGradient id="heartKeyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8e7" />
          <stop offset="18%" stopColor="#ffd700" />
          <stop offset="45%" stopColor="#e5c57a" />
          <stop offset="70%" stopColor="#b38428" />
          <stop offset="88%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#fff8e7" />
        </linearGradient>

        <linearGradient id="heartKeyDarkGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#855f19" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#68470e" />
        </linearGradient>

        <radialGradient id="heartKeyAuraGrad" cx="50%" cy="38%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 215, 0, 0.55)" />
          <stop offset="60%" stopColor="rgba(212, 175, 55, 0.2)" />
          <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
        </radialGradient>
      </defs>

      {/* Ambient Radial Halo */}
      <circle cx="70" cy="58" r="54" fill="url(#heartKeyAuraGrad)" />

      {/* Pulsing Concentric Gold Halo Ring */}
      <circle
        cx="70"
        cy="52"
        r="44"
        fill="none"
        stroke="url(#heartKeyGold)"
        strokeWidth="0.8"
        strokeDasharray="3 3"
        opacity="0.65"
        className="key-svg-halo-ring"
      />

      {/* Top Royal Crown on the Heart */}
      <path
        d="M58,18 L64,24 L70,12 L76,24 L82,18 L79,28 L61,28 Z"
        fill="url(#heartKeyGold)"
        stroke="url(#heartKeyDarkGold)"
        strokeWidth="0.5"
      />
      <circle cx="58" cy="17" r="1.5" fill="#ffffff" />
      <circle cx="70" cy="11" r="2" fill="#ffffff" />
      <circle cx="82" cy="17" r="1.5" fill="#ffffff" />

      {/* The Outer Gilded Heart Bow */}
      <path
        d="M70,30 C56,12 30,22 30,48 C30,70 56,90 70,102 C84,90 110,70 110,48 C110,22 84,12 70,30 Z"
        fill="none"
        stroke="url(#heartKeyGold)"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Beaded / Filigree Heart */}
      <path
        d="M70,37 C59,22 38,29 38,49 C38,66 60,82 70,92 C80,82 102,66 102,49 C102,29 81,22 70,37 Z"
        fill="none"
        stroke="url(#heartKeyGold)"
        strokeWidth="1.2"
        strokeDasharray="2 3"
        opacity="0.85"
      />

      {/* Center Keyhole & Diamond inside Heart */}
      <circle cx="70" cy="50" r="5.5" fill="url(#heartKeyDarkGold)" stroke="url(#heartKeyGold)" strokeWidth="1" />
      <polygon points="68,52 66,66 74,66 72,52" fill="url(#heartKeyDarkGold)" />
      <polygon points="70,45 72,49 76,50 72,51 70,55 68,51 64,50 68,49" fill="#ffffff" />

      {/* Collar Rings between Heart & Shaft */}
      <rect x="63" y="103" width="14" height="3.5" rx="1.7" fill="url(#heartKeyGold)" stroke="url(#heartKeyDarkGold)" strokeWidth="0.5" />
      <rect x="61" y="108" width="18" height="4" rx="2" fill="url(#heartKeyGold)" stroke="url(#heartKeyDarkGold)" strokeWidth="0.5" />

      {/* Fluted Key Stem / Shaft */}
      <rect x="66" y="112" width="8" height="48" rx="1.5" fill="url(#heartKeyGold)" stroke="url(#heartKeyDarkGold)" strokeWidth="0.8" />
      <line x1="70" y1="113" x2="70" y2="158" stroke="#fff8e7" strokeWidth="1" opacity="0.8" />

      {/* Decorative Mid-Shaft Ring */}
      <circle cx="70" cy="132" r="5" fill="none" stroke="url(#heartKeyGold)" strokeWidth="1.2" />

      {/* Antique Key Bit (The Teeth) at Bottom with Heart Cutout */}
      <path
        d="M74,142 L86,142 C87,142 88,143 88,144 L88,156 C88,157 87,158 86,158 L74,158 Z"
        fill="url(#heartKeyGold)"
        stroke="url(#heartKeyDarkGold)"
        strokeWidth="0.8"
      />
      <path
        d="M82,146 C80,144 78,145 78,147 C78,150 82,152 82,152 C82,152 86,150 86,147 C86,145 84,144 82,146 Z"
        fill="#120106"
      />
      <rect x="80" y="153" width="4.5" height="3" fill="#120106" />

      {/* Bottom Finial Bead */}
      <circle cx="70" cy="162" r="2.8" fill="url(#heartKeyGold)" stroke="url(#heartKeyDarkGold)" strokeWidth="0.5" />
    </svg>
  </div>
);

const BurgundyTemplate = ({ invitation, invitationPath }) => {
  const dispatch = useDispatch();
  const { rsvpLoading, rsvpSuccess, rsvpError } = useSelector((state) => state.invitation);

  const isArabic = invitation?.locale === 'ar';
  const hero = invitation?.hero || {};
  const event = invitation?.event || {};
  const story = invitation?.love_story || {};
  const gallery = invitation?.gallery || {};
  const footer = invitation?.footer || {};
  const countdown = invitation?.countdown || {};
  const rsvp = invitation?.rsvp || {};

  const groomName = invitation?.groom_name || '';
  const brideName = invitation?.bride_name || '';
  const couple = invitation?.couple_display_name || [groomName, brideName].filter(Boolean).join(' & ');
  const hasBothNames = Boolean(groomName && brideName);

  const heroEnabled = hero.is_enabled !== false;
  const eventEnabled = event.is_enabled !== false;
  const storyEnabled = story.is_enabled !== false;
  const galleryEnabled = gallery.is_enabled !== false;
  const countdownEnabled = countdown.is_enabled !== false && Boolean(countdown.target_date);
  const rsvpEnabled = rsvp.is_enabled !== false;
  const footerEnabled = footer.is_enabled !== false;

  const galleryImages = useMemo(() => gallery.image_urls || [], [gallery.image_urls]);
  const storyEvents = useMemo(() => story.events || [], [story.events]);



  // Video Opener State: 'idle' -> 'playing' (5s only) -> 'revealed'
  const [openerState, setOpenerState] = useState('idle');
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);

  const [audioStartSignal, setAudioStartSignal] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState(() => calculateTime(countdown.target_date));
  useEffect(() => {
    if (!countdown.target_date) return undefined;
    const interval = setInterval(() => {
      setTimeLeft(calculateTime(countdown.target_date));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown.target_date]);

  // RSVP Form State
  const [guestName, setGuestName] = useState('');
  const [attendance, setAttendance] = useState('yes');
  const [guestCount, setGuestCount] = useState(1);
  const [guestMessage, setGuestMessage] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Lock body scroll while opener is active so user cannot scroll underneath in background
  useEffect(() => {
    if (openerState !== 'revealed') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    } else {
      document.body.style.overflow = '';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
    }
  }, [openerState]);

  // Skip or auto-finish after exactly 5s
  const finishOpener = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (e) {}
    }
    setOpenerState('revealed');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Start 5-second video experience with key turn unlocking animation
  const handleOpenClick = () => {
    if (openerState !== 'idle') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setOpenerState('unlocking');
    setAudioStartSignal((s) => s + 1);

    confetti({
      particleCount: 26,
      spread: 50,
      origin: { y: 0.58 },
      colors: ['#ffd700', '#fff8e7', '#e5c57a', '#740e2d'],
    });

    setTimeout(() => {
      setOpenerState('playing');
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }

      // Exactly 5 seconds video limit
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        finishOpener();
      }, 5000);
    }, 450);
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setVideoProgress(Math.min(100, (cur / 5) * 100));
      if (cur >= 5) {
        finishOpener();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim() || rsvpLoading) return;

    dispatch(
      submitInvitationRsvp({
        publicPath: invitationPath,
        rsvpData: {
          name: guestName.trim(),
          attending: attendance === 'yes',
          guests_count: Number(guestCount) || 1,
          phone: guestPhone.trim() || undefined,
          message: guestMessage.trim() || undefined,
        },
      }),
    ).then((action) => {
      if (action.meta?.requestStatus === 'fulfilled') {
        setFormSubmitted(true);
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { y: 0.7 },
          colors: ['#e5c57a', '#f5ece1', '#740e2d', '#ffffff'],
        });
      }
    });
  };

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((idx) => (idx + 1) % galleryImages.length);
  };
  const prevImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((idx) => (idx - 1 + galleryImages.length) % galleryImages.length);
  };

  const mapsUrl = buildMapsUrl(event);

  return (
    <div className="chic-burgundy-atelier" dir={isArabic ? 'rtl' : 'ltr'}>
      <AudioPlayer invitation={invitation} playSignal={audioStartSignal} />

      {/* =====================================================================
          1. 5-SECOND RING BOX VIDEO OPENER WITH ULTRA-CHIC JEWEL OPEN BUTTON
          ===================================================================== */}
      <AnimatePresence
        onExitComplete={() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
      >
        {openerState !== 'revealed' && (
          <motion.div
            className={`chic-video-opener-stage is-${openerState}`}
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.05,
              filter: 'blur(12px)',
              transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] },
            }}
          >
            {/* Desktop Ambient Blurred Backdrop */}
            <div className="opener-ambient-backdrop" aria-hidden="true">
              <img
                src={invitation?.loading?.image || ringCoverImage}
                alt=""
                className="ambient-backdrop-img"
              />
              <div className="ambient-backdrop-veil" />
            </div>

            {/* Standard Mobile Phone Viewport (Dimensions 9:16 locked across all devices) */}
            <div className="opener-phone-viewport">
              {/* The Video & Cover Container: Authentic Ring Box Footage */}
              <div className="opener-media-chamber">
                <img
                  src={invitation?.loading?.image || ringCoverImage}
                  alt=""
                  className={`opener-cover-poster ${openerState === 'playing' ? 'is-faded' : ''}`}
                />
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  preload="auto"
                  onTimeUpdate={handleVideoTimeUpdate}
                  className={`opener-ring-film ${openerState === 'playing' ? 'is-active' : ''}`}
                >
                  <source
                    src={invitation?.loading?.video_url || ringFilmVideo}
                    type="video/mp4"
                  />
                </video>
                <div className="opener-media-vignette" />
              </div>

              {/* If Video is playing: Pure Cinematic Video with Bottom Gold Hairline (Tap anywhere to reveal) */}
              {openerState === 'playing' && (
                <div
                  className="opener-playback-hud"
                  onClick={finishOpener}
                  role="button"
                  tabIndex={0}
                  aria-label={isArabic ? 'انقر للمتابعة' : 'Tap to reveal'}
                >
                  <div className="opener-hairline-progress">
                    <div
                      className="opener-progress-fill"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Floating Interface: Header & Royal Heart Key Permanently Locked on Box */}
              {(openerState === 'idle' || openerState === 'unlocking') && (
                <div className="opener-floating-interface">
                  {/* Floating Gilded Proclamation */}
                  <motion.div
                    className="opener-floating-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.1 }}
                  >
                    <div className="opener-filigree-mark">
                      <span className="filigree-line" />
                      <span className="filigree-gem">✦</span>
                      <span className="filigree-line" />
                    </div>
                    <p className="opener-floating-kicker">
                      {isArabic ? 'دعوة زفاف خاصة' : 'WEDDING INVITATION'}
                    </p>
                    <h1 className="opener-floating-names">
                      {couple || `${groomName} & ${brideName}`}
                    </h1>
                    {event.date ? (
                      <p className="opener-floating-date">{event.date}</p>
                    ) : null}
                  </motion.div>

                  {/* Royal Golden Heart Key directly on the Velvet Ring Box */}
                  <motion.div
                    className={`opener-button-anchor ${openerState === 'unlocking' ? 'is-turning' : ''}`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <button
                      type="button"
                      className="chic-heart-key-btn"
                      onClick={handleOpenClick}
                      aria-label={isArabic ? 'افتح الدعوة بمفتاح القلب' : 'Unlock Invitation'}
                    >
                      <RoyalHeartKey />
                      <span className="heart-key-action-badge">
                        <span className="key-badge-sparkle">✦</span>
                        <span className="key-badge-text">
                          {invitation?.loading?.open_prompt
                            || (isArabic ? 'افتح بمفتاح القلب' : 'UNLOCK INVITATION')}
                        </span>
                        <span className="key-badge-sparkle">✦</span>
                      </span>
                    </button>

                    <span className="heart-key-hint">
                      {isArabic ? 'المس المفتاح لفتح العلبة' : 'TOUCH KEY TO UNLOCK'}
                    </span>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          2. BESPOKE ROYAL HERALDRY HERO (NON-AI, EDITORIAL COUTURE)
          ===================================================================== */}
      {heroEnabled ? (
        <section id="chic-hero" className="chic-hero-cover full-bleed-hero">
          {/* Full-bleed background image covering the entire first section (Clear, luminous photo) */}
          <div className="chic-hero-backdrop-chamber">
            <img
              src={invitation?.hero?.image || heroPortrait}
              alt={couple}
              className="chic-hero-backdrop-img"
            />
            <div className="chic-hero-backdrop-overlay" />
          </div>

          <motion.div
            className="chic-hero-container"
            initial="hidden"
            animate={openerState === 'revealed' ? 'shown' : 'hidden'}
            variants={stagger}
          >
            {/* Top Royal Filigree Ribbon Directly on Photo */}
            <motion.div variants={rise} className="chic-hero-ribbon">
              <span className="hero-ribbon-line" />
              <span className="hero-ribbon-gem">✦</span>
              <span className="hero-ribbon-text">
                {isArabic ? 'دعوة زفاف خاصة' : 'ROYAL WEDDING INVITATION'}
              </span>
              <span className="hero-ribbon-gem">✦</span>
              <span className="hero-ribbon-line" />
            </motion.div>

            {/* Sacred Basmala Directly on Photo */}
            <motion.div variants={rise} className="chic-hero-basmala">
              <p className="basmala-calligraphy">
                {isArabic
                  ? 'بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ'
                  : 'IN THE NAME OF GOD'}
              </p>
              {isArabic ? (
                <p className="quranic-verse">
                  ﴿ وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ﴾
                </p>
              ) : null}
            </motion.div>

            {/* Invitation Lead Line */}
            <motion.p variants={rise} className="chic-hero-invite-lead">
              {hero.kicker || (isArabic ? 'يسرنا دعوتكم لمشاركتنا فرحة العمر واكتمال بهجتنا' : 'Together with their families, request the pleasure of your company')}
            </motion.p>

            {/* Couple Names - Grand Centerpiece Typography directly on photo */}
            <motion.div variants={rise} className="chic-hero-grand-names">
              {hasBothNames ? (
                <div className="grand-names-row">
                  <h1 className="hero-name-primary">{groomName}</h1>
                  <div className="hero-ampersand-ornament">
                    <span className="ornament-feather" />
                    <span className="ornament-char">{isArabic ? 'و' : '&'}</span>
                    <span className="ornament-feather" />
                  </div>
                  <h1 className="hero-name-primary">{brideName}</h1>
                </div>
              ) : (
                <h1 className="hero-name-primary single-headline">
                  {couple || groomName || brideName}
                </h1>
              )}
            </motion.div>

            {/* Editorial Jewelry Flourish Divider */}
            <motion.div variants={rise} className="chic-hero-flourish-divider">
              <span className="flourish-bar" />
              <span className="flourish-diamond">◆</span>
              <span className="flourish-crown-star">✦</span>
              <span className="flourish-diamond">◆</span>
              <span className="flourish-bar" />
            </motion.div>

            {/* Hero Body Sentiment */}
            {hero.body ? (
              <motion.p variants={rise} className="chic-hero-sentiment">
                {hero.body}
              </motion.p>
            ) : (
              <motion.p variants={rise} className="chic-hero-sentiment">
                {isArabic
                  ? 'نسعد ونفخر بمشاركتكم لنا هذه اللحظة الاستثنائية، واكتمال بهجتنا بوجودكم'
                  : 'We look forward to celebrating this sacred beginning surrounded by the love of our dearest ones'}
              </motion.p>
            )}

            {/* Royal Floating Date & Time Cluster Directly on Photo */}
            {event.date || event.time ? (
              <motion.div variants={rise} className="chic-hero-date-cluster">
                <div className="date-cluster-chip">
                  <FiCalendar className="date-cluster-icon" />
                  <span className="date-cluster-text">{event.date}</span>
                </div>
                {event.time ? (
                  <>
                    <span className="date-cluster-sep">✦</span>
                    <div className="date-cluster-chip">
                      <FiClock className="date-cluster-icon" />
                      <span className="date-cluster-text">{event.time}</span>
                    </div>
                  </>
                ) : null}
              </motion.div>
            ) : null}

            {/* Bottom Scroll Cue */}
            <motion.a
              variants={rise}
              href="#chic-details"
              className="chic-hero-scroll-cue"
              aria-label="Scroll to details"
            >
              <span className="scroll-cue-text">
                {isArabic ? 'تفاصيل الحفل والمراسم' : 'EXPLORE CELEBRATION'}
              </span>
              <span className="scroll-cue-icon">▾</span>
            </motion.a>
          </motion.div>
        </section>
      ) : null}

      {/* =====================================================================
          3. FORMAL INVITATION STATIONERY CARD (THE CEREMONY & BANQUET)
          ===================================================================== */}
      {eventEnabled ? (
        <section id="chic-details" className="chic-section details-section">
          {/* Wall Relief Engravings in Empty Burgundy Space */}
          <ContinuousLineRoseFrieze />
          <WallRoseSprayMural className="mural-flank-top-left" />
          <WallRoseSprayMural className="mural-flank-mid-right" flip={true} />
          <motion.div
            className="chic-shell"
            initial="hidden"
            whileInView="shown"
            viewport={reveal}
            variants={stagger}
          >
            <EditorialSectionHeading
              kicker={event.kicker || (isArabic ? 'المراسم والاحتفال' : 'CELEBRATION ITINERARY')}
              title={event.title || (isArabic ? 'تفاصيل الحفل' : 'The Wedding Details')}
            />

            {/* Letterpress Stationery Card */}
            <motion.div variants={rise} className="chic-stationery-card">
              <RoseCornerFlourish position="tl" />
              <RoseCornerFlourish position="tr" />
              <RoseCornerFlourish position="bl" />
              <RoseCornerFlourish position="br" />
              <RoseWatermarkMedallion />
              <div className="card-debossed-gold-border" />
              <div className="card-inner-pad">
                <p className="stationery-subline">
                  {isArabic
                    ? 'بقلوب تملؤها المودة، يطيب لنا حضوركم ومشاركتنا هذه اللحظة الاستثنائية'
                    : 'Request the honor of your presence to celebrate their sacred union'}
                </p>

                <div className="stationery-details-grid">
                  {/* Date Column */}
                  {event.date ? (
                    <div className="stationery-item">
                      <span className="stationery-item-icon"><FiCalendar /></span>
                      <span className="stationery-item-kicker">
                        {event.day_label || (isArabic ? 'التاريخ المبارك' : 'DATE')}
                      </span>
                      <strong className="stationery-item-value">{event.date}</strong>
                    </div>
                  ) : null}

                  {/* Time Column */}
                  {event.time ? (
                    <div className="stationery-item">
                      <span className="stationery-item-icon"><FiClock /></span>
                      <span className="stationery-item-kicker">
                        {isArabic ? 'التوقيت' : 'TIME'}
                      </span>
                      <strong className="stationery-item-value">{event.time}</strong>
                    </div>
                  ) : null}

                  {/* Venue Column */}
                  <div className="stationery-item full-span">
                    <span className="stationery-item-icon"><FiMapPin /></span>
                    <span className="stationery-item-kicker">
                      {event.venue_label || (isArabic ? 'مكان الاحتفال' : 'VENUE')}
                    </span>
                    <strong className="stationery-item-value">
                      {event.venue || (isArabic ? 'القاعة الكبرى الملكية' : 'Grand Ballroom')}
                    </strong>
                    {event.location ? (
                      <p className="stationery-location-text">{event.location}</p>
                    ) : null}
                    {event.address ? (
                      <p className="stationery-address-text">{event.address}</p>
                    ) : null}

                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="chic-map-link-btn"
                      >
                        <FiCompass className="map-btn-icon" />
                        <span>{event.open_location || (isArabic ? 'فتح موقع القاعة على خرائط Google' : 'Navigate via Google Maps')}</span>
                        <FiArrowUpRight className="map-arrow-icon" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      ) : null}

      {/* =====================================================================
          4. UNTRADITIONAL SWISS HOROLOGY COUNTDOWN
          ===================================================================== */}
      {countdownEnabled ? (
        <section className="chic-section countdown-section">
          {/* Wall Relief Continuous Line Rose Frieze */}
          <ContinuousLineRoseFrieze />
          <motion.div
            className="chic-shell"
            initial="hidden"
            whileInView="shown"
            viewport={reveal}
            variants={stagger}
          >
            <EditorialSectionHeading
              kicker={isArabic ? 'موعدنا يقترب' : 'MOMENTS UNTIL FOREVER'}
              title={countdown.title || (isArabic ? 'العد التنازلي' : 'The Countdown')}
            />

            {/* Haute Horlogerie Royal Chronometer Suite */}
            <motion.div variants={rise} className="chic-royal-chronometer">
              <RoseCornerFlourish position="tl" />
              <RoseCornerFlourish position="br" />
              <RoseWatermarkMedallion />

              {/* Celestial Crown Header */}
              <div className="chronometer-astral-crown" aria-hidden="true">
                <span className="astral-line" />
                <span className="astral-star">✦</span>
                <span className="astral-motto">
                  {isArabic ? 'اللحظات المتبقية حتى اللقاء المبارك' : 'MOMENTS UNTIL OUR FOREVER BEGINS'}
                </span>
                <span className="astral-star">✦</span>
                <span className="astral-line" />
              </div>

              {/* 4 Architectural Jewel Pods (Mobile-Engineered 4-Column Grid) */}
              <div className="chronometer-pods-grid">
                {[
                  { label: isArabic ? 'أيام' : 'DAYS', value: timeLeft.days },
                  { label: isArabic ? 'ساعات' : 'HOURS', value: timeLeft.hours },
                  { label: isArabic ? 'دقائق' : 'MINUTES', value: timeLeft.minutes },
                  { label: isArabic ? 'ثواني' : 'SECONDS', value: timeLeft.seconds },
                ].map((slot, index) => (
                  <div key={slot.label} className={`chronometer-pod ${index === 3 ? 'is-seconds' : ''}`}>
                    <div className="pod-halo-glow" />
                    
                    {/* Architectural Corner Jewels */}
                    <span className="pod-corner-pip pip-tl" />
                    <span className="pod-corner-pip pip-tr" />
                    <span className="pod-corner-pip pip-bl" />
                    <span className="pod-corner-pip pip-br" />

                    <div className="pod-content">
                      <strong className="pod-num">
                        {String(slot.value).padStart(2, '0')}
                      </strong>
                      <span className="pod-lbl">{slot.label}</span>
                    </div>

                    {index === 3 && (
                      <span className="pod-live-pulse-dot" title="Live ticker" />
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Inscription */}
              <p className="chronometer-epilogue">
                <span className="epilogue-gem">✦</span>
                <span>
                  {isArabic
                    ? 'كل ثانية تمضي تقربنا من فرحة العمر بلقائكم'
                    : 'Every passing second brings us closer to celebrating with you'}
                </span>
                <span className="epilogue-gem">✦</span>
              </p>
            </motion.div>
          </motion.div>
        </section>
      ) : null}

      {/* =====================================================================
          5. OUR STORY TIMELINE (EDITORIAL CHAPTERS)
          ===================================================================== */}
      {storyEnabled && storyEvents.length > 0 ? (
        <section className="chic-section story-section">
          {/* Wall Relief Spray on Left Flank */}
          <WallRoseSprayMural className="mural-flank-bottom-left" />
          <motion.div
            className="chic-shell"
            initial="hidden"
            whileInView="shown"
            viewport={reveal}
            variants={stagger}
          >
            <EditorialSectionHeading
              kicker={story.kicker || (isArabic ? 'فصول حكايتنا' : 'CHAPTERS OF LOVE')}
              title={story.title || (isArabic ? 'قصة حبنا' : 'Our Story')}
            />

            <div className="chic-story-flow">
              {storyEvents.map((item, index) => (
                <motion.article
                  key={`${item.date}-${index}`}
                  variants={rise}
                  className="chic-story-entry"
                >
                  <RoseCornerFlourish position="tr" />
                  <div className="story-meta-col">
                    <span className="story-index-tag">CH. 0{index + 1}</span>
                    <time className="story-date-tag">{item.date}</time>
                  </div>
                  <div className="story-body-col">
                    <h3 className="story-entry-title">{item.title}</h3>
                    {item.desc ? (
                      <p className="story-entry-desc">{item.desc}</p>
                    ) : null}
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </section>
      ) : null}

      {/* =====================================================================
          6. PHOTO GALLERY (EDITORIAL FASHION SPREAD)
          ===================================================================== */}
      {galleryEnabled && galleryImages.length > 0 ? (
        <section className="chic-section gallery-section">
          <motion.div
            className="chic-shell"
            initial="hidden"
            whileInView="shown"
            viewport={reveal}
            variants={stagger}
          >
            <EditorialSectionHeading
              kicker={isArabic ? 'ألبوم الذكريات الملكية' : 'HAUTE COUTURE ARCHIVE'}
              title={gallery.title || (isArabic ? 'معرض الصور الخالدة' : 'The Visual Gallery')}
            />

            <div className="chic-royal-gallery-suite">
              {/* Grand Arched Masterpiece Showcase */}
              <motion.div variants={rise} className="chic-gallery-stage">
                <div className="gallery-master-frame">
                  <div className="gallery-frame-debossed-border" />
                  <RoseCornerFlourish position="tl" />
                  <RoseCornerFlourish position="tr" />
                  <RoseCornerFlourish position="bl" />
                  <RoseCornerFlourish position="br" />

                  {/* Active Display Image */}
                  <div
                    className="gallery-master-viewport"
                    onClick={() => openLightbox(activePhotoIndex)}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={galleryImages[activePhotoIndex]}
                        src={galleryImages[activePhotoIndex]}
                        alt={`Masterpiece ${activePhotoIndex + 1}`}
                        className="gallery-master-img"
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </AnimatePresence>

                    {/* Master Overlay with Plate Tag and Fullscreen Prompt */}
                    <div className="gallery-master-veil">
                      <span className="gallery-plate-badge">
                        <span className="plate-sparkle">✦</span>
                        <span>
                          {isArabic
                            ? `لوحة ${activePhotoIndex + 1} من ${galleryImages.length}`
                            : `PLATE 0${activePhotoIndex + 1} OF 0${galleryImages.length}`}
                        </span>
                        <span className="plate-sparkle">✦</span>
                      </span>

                      <button
                        type="button"
                        className="gallery-fullscreen-chip"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(activePhotoIndex);
                        }}
                        aria-label={isArabic ? 'عرض بكامل الشاشة' : 'View Fullscreen'}
                      >
                        <FiMaximize2 className="chip-icon" />
                        <span>{isArabic ? 'تكبير بكامل الشاشة' : 'Fullscreen'}</span>
                      </button>
                    </div>

                    {/* Nav Arrows on Masterpiece */}
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="gallery-stage-nav is-prev"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePhotoIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
                          }}
                          aria-label="Previous photo"
                        >
                          <FiChevronLeft />
                        </button>
                        <button
                          type="button"
                          className="gallery-stage-nav is-next"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePhotoIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
                          }}
                          aria-label="Next photo"
                        >
                          <FiChevronRight />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Interactive Archival Filmstrip / Thumbnails Ribbon */}
                {galleryImages.length > 1 && (
                  <div className="gallery-thumbnails-ribbon">
                    {galleryImages.map((imgUrl, idx) => (
                      <button
                        key={`${imgUrl}-thumb-${idx}`}
                        type="button"
                        className={`gallery-thumb-chip ${idx === activePhotoIndex ? 'is-active' : ''}`}
                        onClick={() => setActivePhotoIndex(idx)}
                        aria-label={`Select photo ${idx + 1}`}
                      >
                        <div className="thumb-arch-wrap">
                          <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                          <span className="thumb-index-tag">0{idx + 1}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </section>
      ) : null}

      {/* =====================================================================
          7. PERSONAL LETTER FROM COUPLE
          ===================================================================== */}
      {event.description || hero.body ? (
        <section className="chic-section letter-section">
          <motion.div
            className="chic-shell"
            initial="hidden"
            whileInView="shown"
            viewport={reveal}
            variants={stagger}
          >
            <motion.div variants={rise} className="chic-love-note-card">
              <RoseCornerFlourish position="tl" />
              <RoseCornerFlourish position="tr" />
              <RoseWatermarkMedallion />
              <span className="note-mini-kicker">
                {isArabic ? 'كلمة من القلب' : 'A BESPOKE NOTE'}
              </span>
              <EditorialDivider className="note-divider" />
              <p className="note-text">
                {event.description || hero.body}
              </p>
              <div className="note-signature-line">
                <CoupleName value={couple} ampersandClassName="text-[#d4af37]" />
              </div>
            </motion.div>
          </motion.div>
        </section>
      ) : null}

      {/* =====================================================================
          8. MODERN RSVP FORM (REPLY CARD)
          ===================================================================== */}
      {rsvpEnabled ? (
        <section className="chic-section rsvp-section">
          {/* Wall Relief Frieze & Spray on Right Flank */}
          <ContinuousLineRoseFrieze />
          <WallRoseSprayMural className="mural-flank-bottom-right" flip={true} />
          <motion.div
            className="chic-shell"
            initial="hidden"
            whileInView="shown"
            viewport={reveal}
            variants={stagger}
          >
            <EditorialSectionHeading
              kicker={rsvp.kicker || (isArabic ? 'تأكيد الحضور' : 'RÉPONDEZ S\'IL VOUS PLAÎT')}
              title={rsvp.title || (isArabic ? 'هل ستشاركونا الفرحة؟' : 'RSVP Card')}
            />

            <motion.div variants={rise} className="chic-rsvp-envelope">
              <RoseCornerFlourish position="tl" />
              <RoseCornerFlourish position="tr" />
              <RoseCornerFlourish position="bl" />
              <RoseCornerFlourish position="br" />
              <RoseWatermarkMedallion />
              {formSubmitted || rsvpSuccess ? (
                <div className="chic-rsvp-success">
                  <span className="success-check-badge"><FiCheck /></span>
                  <h3>{rsvp.thanks || (isArabic ? 'تم تأكيد الرد بنجاح!' : 'Your Response Has Been Received!')}</h3>
                  <p>
                    {attendance === 'yes'
                      ? (rsvp.yes_reply || (isArabic ? 'نسعد ونفخر بحضوركم ومشاركتنا أجمل اللحظات.' : 'We cannot wait to celebrate this special day with you.'))
                      : (rsvp.no_reply || (isArabic ? 'نشكر لكم مشاعركم الطيبة ونتمنى لكم كل التوفيق.' : 'Thank you for letting us know and for your warm wishes.'))}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="chic-rsvp-form">
                  {rsvpError ? <div className="chic-form-error">{rsvpError}</div> : null}

                  {/* Attendance Choice Buttons */}
                  <div className="chic-attendance-toggle">
                    <button
                      type="button"
                      className={`toggle-option ${attendance === 'yes' ? 'is-selected' : ''}`}
                      onClick={() => setAttendance('yes')}
                    >
                      <span className="toggle-bullet" />
                      <span>{isArabic ? 'يشرفني الحضور بكل سرور' : 'Joyfully Accepts'}</span>
                    </button>
                    <button
                      type="button"
                      className={`toggle-option ${attendance === 'no' ? 'is-selected' : ''}`}
                      onClick={() => setAttendance('no')}
                    >
                      <span className="toggle-bullet" />
                      <span>{isArabic ? 'أعتذر عن الحضور' : 'Regretfully Declines'}</span>
                    </button>
                  </div>

                  <div className="chic-inputs-row">
                    <div className="chic-input-field">
                      <label>{isArabic ? 'الاسم الكريم' : 'Full Name'} *</label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder={isArabic ? 'أدخل اسمك بالكامل' : 'Your name'}
                        className="chic-text-input"
                      />
                    </div>

                    <div className="chic-input-field">
                      <label>{isArabic ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}</label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder={isArabic ? '01xxxxxxxxx' : '+1 (555) 000-0000'}
                        className="chic-text-input"
                      />
                    </div>

                    {attendance === 'yes' ? (
                      <div className="chic-input-field">
                        <label>{isArabic ? 'عدد المرافقين' : 'Number of Guests'}</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={guestCount}
                          onChange={(e) => setGuestCount(e.target.value)}
                          className="chic-text-input"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="chic-input-field full">
                    <label>{isArabic ? 'رسالة تهنئة للعروسين' : 'Personal Wishes (Optional)'}</label>
                    <textarea
                      rows={3}
                      value={guestMessage}
                      onChange={(e) => setGuestMessage(e.target.value)}
                      placeholder={isArabic ? 'أطيب الأمنيات بحياة سعيدة ومباركة...' : 'Leave a note for the couple...'}
                      className="chic-text-input chic-textarea"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={rsvpLoading}
                    className="chic-submit-btn"
                  >
                    <FiSend />
                    <span>
                      {rsvpLoading
                        ? (isArabic ? 'جاري الإرسال...' : 'Sending...')
                        : (isArabic ? 'إرسال الرد' : 'Send RSVP')}
                    </span>
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </section>
      ) : null}

      {/* =====================================================================
          9. GUEST PHOTO UPLOAD
          ===================================================================== */}
      <PartyUpload invitation={invitation} invitationPath={invitationPath} />

      {/* =====================================================================
          10. REFINED FOOTER
          ===================================================================== */}
      {footerEnabled ? (
        <footer className="chic-editorial-footer">
          <p className="footer-monogram">
            <CoupleName value={couple} ampersandClassName="text-[#d4af37]" />
          </p>
          <p className="footer-closing-note">
            {[footer.date, footer.made_with, footer.for_day, footer.text].filter(Boolean).join(' ')
              || (isArabic
                ? 'شكراً لكم، نسعد بحضوركم واكتمال فرحتنا بكم'
                : 'Thank you for celebrating this sacred milestone with us')}
          </p>
          <FiHeart className="footer-heart-gem" />
        </footer>
      ) : null}

      {/* =====================================================================
          11. LIGHTBOX MODAL
          ===================================================================== */}
      {lightboxIndex !== null ? (
        <div
          className="chic-lightbox-portal"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="lightbox-close-icon"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <FiX />
          </button>

          {galleryImages.length > 1 ? (
            <>
              <button
                type="button"
                className="lightbox-arrow is-left"
                onClick={prevImage}
                aria-label="Previous"
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                className="lightbox-arrow is-right"
                onClick={nextImage}
                aria-label="Next"
              >
                <FiChevronRight />
              </button>
            </>
          ) : null}

          <div className="lightbox-center-wrap" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryImages[lightboxIndex]}
              alt={`View ${lightboxIndex + 1}`}
              className="lightbox-view-img"
            />
            <span className="lightbox-page-indicator">
              {lightboxIndex + 1} / {galleryImages.length}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BurgundyTemplate;
