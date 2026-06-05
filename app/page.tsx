'use client';

import NavBar from './NavBar'
import { useState, useRef, useEffect } from 'react';

export default function LandingPage() {
    const [stage, setStage] = useState<'enter' | 'video' | 'white' | 'opening'>(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('visited')) return 'opening';
        return 'enter';
    });
    const [eyeOpen, setEyeOpen] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('visited')) return 100;
        return 0;
    });
    const [scrollY, setScrollY] = useState(0);
    const introVideoRef = useRef<HTMLVideoElement>(null);
    const heroVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (stage === 'opening' && heroVideoRef.current) {
            heroVideoRef.current.play().catch(() => { });
        }
    }, [stage]);

    const handleEnter = () => {
        localStorage.setItem('visited', 'true');
        setStage('video');
        setTimeout(() => {
            if (introVideoRef.current) {
                introVideoRef.current.muted = false;
                introVideoRef.current.play().catch(() => {
                    if (introVideoRef.current) { introVideoRef.current.muted = true; introVideoRef.current.play(); }
                });
            }
        }, 100);
    };

    const handleSkipVideo = () => {
        if (introVideoRef.current) introVideoRef.current.pause();
        handleVideoEnd();
    };

    const handleVideoEnd = () => {
        setStage('white');
        setTimeout(() => { setStage('opening'); animateEyeOpen(); }, 300);
    };

    const animateEyeOpen = () => {
        localStorage.setItem('visited', 'true');
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1.5;
            setEyeOpen(progress);
            if (progress >= 100) clearInterval(interval);
        }, 30);
    };

    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const videoOpacity = Math.max(0, 1 - scrollY / (vh * 0.7));
    const textOpacity = Math.max(0, 1 - scrollY / (vh * 0.35));
    const blackSectionOpacity = Math.min(1, Math.max(0, (scrollY - vh * 0.3) / (vh * 0.4)));

    return (
        <>
            {/* ENTER SCREEN */}
            {stage === 'enter' && (
                <div onClick={handleEnter} style={{ position: 'fixed', inset: 0, background: '#000000', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <div style={{ color: '#ffffff', fontSize: '48px', letterSpacing: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '40px' }}>ASTRALINK</div>
                    <div style={{ fontSize: '24px', letterSpacing: '8px', fontWeight: '300', color: '#00ff88', textTransform: 'uppercase', animation: 'pulse 2s ease-in-out infinite' }}>Enter</div>
                </div>
            )}

            {/* INTRO VIDEO */}
            {stage === 'video' && (
                <div style={{ position: 'fixed', inset: 0, background: '#000000', zIndex: 9999 }}>
                    <video ref={introVideoRef} onEnded={handleVideoEnd} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline>
                        <source src="/intro-video.mp4" type="video/mp4" />
                    </video>
                    <button onClick={handleSkipVideo} style={{ position: 'absolute', bottom: '40px', right: '40px', padding: '12px 24px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', zIndex: 60 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; }}>
                        Skip →
                    </button>
                </div>
            )}

            {/* WHITE FLASH */}
            {stage === 'white' && <div style={{ position: 'fixed', inset: 0, background: '#ffffff', zIndex: 9999 }}></div>}

            {/* MAIN SITE */}
            {stage === 'opening' && (
                <div style={{ background: '#000000' }}>

                    {/* Scroll container — 200vh gives room to scroll */}
                    <div style={{ height: '200vh' }}>

                        {/* Fixed satellite video — fades out on scroll */}
                        <div style={{
                            position: 'fixed', top: 0, left: 0,
                            width: '100%', height: '100vh',
                            zIndex: 1,
                            opacity: videoOpacity,
                            transition: 'opacity 0.05s linear'
                        }}>
                            <video
                                ref={heroVideoRef}
                                autoPlay muted loop playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            >
                                <source src="/satellite-video.mp4" type="video/mp4" />
                            </video>
                            {/* Gradient overlay — darkens bottom for text legibility */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.25) 100%)'
                            }}></div>
                        </div>

                        {/* NavBar — translucent, sits above video */}
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
                            <NavBar />
                        </div>

                        {/* Text — bottom left, fades out on scroll */}
                        <div style={{
                            position: 'fixed',
                            bottom: '80px',
                            left: '60px',
                            zIndex: 50,
                            opacity: textOpacity,
                            transition: 'opacity 0.05s linear',
                            pointerEvents: 'none'
                        }}>
                            <p style={{
                                fontFamily: '"DM Serif Display", serif',
                                fontSize: '44px',
                                color: '#ffffff',
                                margin: 0,
                                lineHeight: '1.25',
                                maxWidth: '580px',
                                textShadow: '0 2px 30px rgba(0,0,0,0.6)'
                            }}>
                                An updated intelligence<br />for Earth and Space.
                            </p>
                        </div>

                        {/* Black section — fades in on scroll */}
                        <div style={{
                            position: 'fixed',
                            top: 0, left: 0,
                            width: '100%', height: '100vh',
                            background: '#000000',
                            zIndex: 10,
                            opacity: blackSectionOpacity,
                            pointerEvents: blackSectionOpacity > 0.1 ? 'auto' : 'none',
                        }}></div>

                    </div>

                    {/* Eye Opening Overlay */}
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 85%, rgba(255,255,255,0.8) 95%, transparent 100%)', transform: `translateY(-${eyeOpen}%)`, transition: 'transform 0.05s ease-out', filter: 'blur(1px)' }}></div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, #ffffff 0%, #ffffff 85%, rgba(255,255,255,0.8) 95%, transparent 100%)', transform: `translateY(${eyeOpen}%)`, transition: 'transform 0.05s ease-out', filter: 'blur(1px)' }}></div>
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)', opacity: 1 - (eyeOpen / 100), transition: 'opacity 0.05s linear' }}></div>
                    </div>

                </div>
            )}

            <style jsx>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </>
    );
}