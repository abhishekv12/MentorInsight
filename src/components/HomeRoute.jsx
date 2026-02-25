import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// Import all redesigned sections
import Hero from "./Hero";
import { VideoSection, FeaturesShowcase } from "./Videoandfeatures";
import BentoShowcase from "./BentoShowcase";
import CtaSection from "./CtaSection";
import Footer from "./Footer";

// ============================================================
// HomeRoute.jsx
// Design system: Refined Luxury Minimalism
//   --ink:    #0a0a0b  (near-black background)
//   --cream:  #f5f0eb  (warm off-white text)
//   --accent: #4a4af4  (single indigo accent — used sparingly)
// Fonts: Cormorant Garamond (headlines) + Manrope (body) + DM Mono (data/labels)
//
// VIDEO: Pass your video file as prop to VideoSection:
//   <VideoSection videoSrc="/mmmp-demo.mp4" />
//   Put the file in /public/ folder of your Vite project
// ============================================================

const HomeRoute = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isLocked = sessionStorage.getItem("auth_lock");
    if (isLocked === "true") { setLoading(false); return; }
    const unsubscribe = onAuthStateChanged(auth, () => setLoading(false));
    return () => unsubscribe();
  }, [navigate]);

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0b",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 14,
      fontFamily: "'Manrope', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600&display=swap');
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
      `}</style>
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: "#4a4af4",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "spin 1.2s linear infinite",
      }}>
        <i className="fa-solid fa-graduation-cap" style={{ color: "#fff", fontSize: 16 }} />
      </div>
      <p style={{
        margin: 0, color: "#4a4a52",
        fontSize: 11, fontWeight: 600,
        letterSpacing: "0.12em", textTransform: "uppercase",
        fontFamily: "'Manrope', sans-serif",
      }}>
        Loading MentorInsight
      </p>
    </div>
  );

  return (
    <>
      {/* 1. Hero + stats bar */}
      <Hero />

      {/* 2. Video demo */}
      {/*
        HOW TO ADD YOUR VIDEO:
        - Put your video in /public (e.g. /public/mmmp-demo.mp4)
        - Change: <VideoSection videoSrc="/mmmp-demo.mp4" />
      */}
      <VideoSection videoSrc={null} />

      {/* 3. Portal feature showcase */}
      <FeaturesShowcase />

      {/* 4. How it works + Mentor-Mentee Book */}
      <BentoShowcase />

      {/* 5. Testimonials + trust + CTA */}
      <CtaSection />
    </>
  );
};

export default HomeRoute;
