'use client';

import NavBar from './NavBar'
import Image from 'next/image'
import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

function SpinningGlobe() {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
    useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.003; });
    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1.8, 64, 64]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    );
}

function SpinningSatellite() {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(() => { if (groupRef.current) groupRef.current.rotation.y += 0.004; });
    return (
        <group ref={groupRef}>
            <mesh><boxGeometry args={[0.3, 0.08, 0.08]} /><meshStandardMaterial color="#888888" metalness={0.8} /></mesh>
            <mesh position={[0, 0, 0]}><boxGeometry args={[1.2, 0.6, 0.02]} /><meshStandardMaterial color="#1a3d6b" metalness={0.6} /></mesh>
            <mesh position={[0, 0, 0]}><boxGeometry args={[0.02, 0.02, 0.3]} /><meshStandardMaterial color="#cccccc" /></mesh>
        </group>
    );
}

function SpinningPlanet({ color }: { color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.003; });
    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1.8, 64, 64]} />
            <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
    );
}

function Scene({ type }: { type: string }) {
    return (
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 3, 5]} intensity={2} />
            <Suspense fallback={null}>
                {type === 'globe' && <SpinningGlobe />}
                {type === 'satellite' && <SpinningSatellite />}
                {type === 'moon' && <SpinningPlanet color="#aaaaaa" />}
                {type === 'plan' && <SpinningPlanet color="#2a4a6b" />}
            </Suspense>
        </Canvas>
    );
}

const destinations = [
    {
        name: 'Mission Control',
        description: 'Real-time 3D orbital tracking, space weather monitoring, ISS pass predictions, and live mission readiness scoring. Your command center for everything in orbit.',
        type: 'globe',
        href: '/mission-control',
        color: '#22d3ee',
    },
    {
        name: 'Sky View',
        description: 'A live planetarium in your browser. Track stars, constellations, planets, and the ISS position in real time from your exact location on Earth.',
        type: 'moon',
        href: '/sky-view',
        color: '#a78bfa',
    },
    {
        name: 'Satellites',
        description: 'Track active satellites in orbit. View pass predictions, orbital data, and real-time positions for a growing catalog of spacecraft.',
        type: 'satellite',
        href: '/satellites',
        color: '#34d399',
    },
    {
        name: 'Planning',
        description: 'Plan your observation sessions. Get optimal viewing windows, weather forecasts, and mission readiness scores for upcoming ISS passes.',
        type: 'plan',
        href: '/planning',
        color: '#fb923c',
    },
];

export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
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
    const videoOpacity = Math.max(0, 1 - scrollY / (vh * 0.5));
    const textOpacity = Math.max(0, 1 - scrollY / (vh * 0.25));
    const section2Opacity = Math.min(1, Math.max(0, (scrollY - vh * 0.4) / (vh * 0.3)));
    const section2FadeOut = Math.max(0, 1 - (scrollY - vh * 1.2) / (vh * 0.3));
    const section3Opacity = Math.min(1, Math.max(0, (scrollY - vh * 1.8) / (vh * 0.3)));
    const section3FadeOut = Math.max(0, 1 - (scrollY - vh * 2.8) / (vh * 0.3));
    const section4Opacity = Math.min(1, Math.max(0, (scrollY - vh * 3.2) / (vh * 0.3)));

    const dest = destinations[activeIndex];

    return (
        <div style={{ background: '#000000' }}>

            {/* SECTION 1 — Video hero */}
            <div style={{ height: '130vh', position: 'relative' }}>
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1, opacity: videoOpacity, transition: 'opacity 0.05s linear' }}>
                    <video ref={heroVideoRef} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                        <source src="/satellite-video.mp4" type="video/mp4" />
                    </video>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.25) 100%)' }}></div>
                </div>
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}><NavBar /></div>
                <div style={{ position: 'fixed', bottom: '80px', left: '60px', zIndex: 50, opacity: textOpacity, transition: 'opacity 0.05s linear', pointerEvents: 'none' }}>
                    <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '44px', color: '#ffffff', margin: 0, lineHeight: '1.25', maxWidth: '580px', textShadow: '0 2px 30px rgba(0,0,0,0.6)' }}>
                        An updated intelligence<br />for Earth and Space.
                    </p>
                </div>
            </div>

            {/* SECTION 2 — What Is AstraLink */}
            <div style={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', opacity: Math.min(section2Opacity, section2FadeOut), transition: 'opacity 0.1s linear', overflow: 'hidden' }}>
                <div style={{ width: '50%', padding: '100px 60px 100px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 style={{ fontFamily: '"Roboto", sans-serif', fontSize: '56px', fontWeight: '700', color: '#ffffff', margin: '0 0 32px 0', lineHeight: '1.1', letterSpacing: '-1px' }}>What Is AstraLink?</h1>
                    <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px', fontWeight: '300', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: '1.8', letterSpacing: '0.3px' }}>
                        AstraLink is an aerospace intelligence platform that combines real world space and earth data, AI, and visualization into one single mission support system. What would usually only be available to experts in aerospace or aviation is now available to you with a matter of a few clicks. Jeremiah 33:3
                    </p>
                </div>
                <div style={{ width: '50%', height: '100vh', position: 'relative', flexShrink: 0 }}>
                    <Image src="/what-is-astralink.jpg" alt="What Is AstraLink" fill style={{ objectFit: 'cover' }} />
                </div>
            </div>

            {/* SPACER */}
            <div style={{ height: '40vh', background: '#000000', position: 'relative', zIndex: 20 }}></div>

            {/* SECTION 3 — The Goal */}
            <div style={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', opacity: Math.min(section3Opacity, section3FadeOut), transition: 'opacity 0.1s linear', overflow: 'hidden' }}>
                <div style={{ width: '50%', padding: '100px 60px 100px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 style={{ fontFamily: '"Roboto", sans-serif', fontSize: '56px', fontWeight: '700', color: '#ffffff', margin: '0 0 32px 0', lineHeight: '1.1', letterSpacing: '-1px' }}>The Goal?</h1>
                    <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px', fontWeight: '300', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: '1.8', letterSpacing: '0.3px' }}>
                        The goal is to provide an interactive mission control system for all. I don't want to gatekeep access or knowledge to only experts but make it available for everyone. The site started off as just an idea of trying to see if I can make a mission brief system for pilots to see if conditions are good enough to fly through. Then the site just took on a life of its own. I will still continue to add and refine things every chance I get. Proverbs 9:10
                    </p>
                </div>
                <div style={{ width: '50%', height: '100vh', position: 'relative', flexShrink: 0, opacity: section3Opacity, transition: 'opacity 0.3s linear' }}>
                    <Image src="/child-aerospace.jpg" alt="The Goal" fill style={{ objectFit: 'cover' }} />
                </div>
            </div>

            {/* SPACER */}
            <div style={{ height: '40vh', background: '#000000', position: 'relative', zIndex: 20 }}></div>

            {/* SECTION 4 — Choose Your Destination */}
            <div style={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: section4Opacity, transition: 'opacity 0.1s linear', padding: '80px 40px' }}>

                <h1 style={{ fontFamily: '"Roboto", sans-serif', fontSize: '52px', fontWeight: '700', color: '#ffffff', margin: '0 0 60px 0', letterSpacing: '-1px', textAlign: 'center' }}>
                    Choose Your Destination
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '40px', width: '100%', maxWidth: '1100px' }}>

                    {/* Left Arrow */}
                    <button
                        onClick={() => setActiveIndex((activeIndex - 1 + destinations.length) % destinations.length)}
                        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '56px', height: '56px', color: '#ffffff', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = dest.color; e.currentTarget.style.color = dest.color; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#ffffff'; }}
                    >
                        ←
                    </button>

                    {/* Card */}
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: `1px solid ${dest.color}33`, borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'row', minHeight: '500px' }}>

                        {/* Left — Text */}
                        <div style={{ width: '45%', padding: '50px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '11px', letterSpacing: '3px', color: dest.color, marginBottom: '16px', fontFamily: 'monospace', fontWeight: 600 }}>DESTINATION</div>
                            <h2 style={{ fontFamily: '"Roboto", sans-serif', fontSize: '42px', fontWeight: '700', color: '#ffffff', margin: '0 0 24px 0', lineHeight: '1.1' }}>{dest.name}</h2>
                            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: '0 0 40px 0' }}>{dest.description}</p>
                            <a href={dest.href} style={{ display: 'inline-block', padding: '14px 32px', background: dest.color, borderRadius: '6px', color: '#000000', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', width: 'fit-content', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>
                                Launch →
                            </a>
                        </div>

                        {/* Right — 3D Visual */}
                        <div style={{ width: '55%', height: '500px', position: 'relative' }}>
                            <Scene type={dest.type} />
                        </div>

                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => setActiveIndex((activeIndex + 1) % destinations.length)}
                        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '56px', height: '56px', color: '#ffffff', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = dest.color; e.currentTarget.style.color = dest.color; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#ffffff'; }}
                    >
                        →
                    </button>

                </div>

                {/* Dots */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '40px' }}>
                    {destinations.map((_, i) => (
                        <button key={i} onClick={() => setActiveIndex(i)} style={{ width: i === activeIndex ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i === activeIndex ? dest.color : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}></button>
                    ))}
                </div>

            </div>

        </div>
    );
}