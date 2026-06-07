'use client';

import NavBar from './NavBar'
import { useState, useRef, useEffect } from 'react';

export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0);
    const heroVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (heroVideoRef.current) {
            heroVideoRef.current.play().catch(() => { });
        }
    }, []);

    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const videoOpacity = Math.max(0, 1 - scrollY / (vh * 0.7));
    const textOpacity = Math.max(0, 1 - scrollY / (vh * 0.35));
    const blackSectionOpacity = Math.min(1, Math.max(0, (scrollY - vh * 0.3) / (vh * 0.4)));

    return (
        <div style={{ background: '#000000' }}>

            <div style={{ height: '200vh' }}>

                {/* Fixed satellite video */}
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
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.25) 100%)'
                    }}></div>
                </div>

                {/* NavBar */}
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
                    <NavBar />
                </div>

                {/* Text bottom left */}
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

                {/* Black section fades in on scroll */}
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

        </div>
    );
}