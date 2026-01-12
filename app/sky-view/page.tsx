'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Stars as DreiStars, Line } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

interface Location {
    latitude: number
    longitude: number
    name: string
}

interface ObjectInfo {
    name: string
    type: string
    description: string
    details: string[]
    distance?: string
    altitude?: string
    speed?: string
}

const STAR_CATALOG = [
    { ra: 6.7525, dec: -16.7161, mag: -1.46, color: '#9db4ff', name: 'Sirius', constellation: 'Orion' },
    { ra: 6.3992, dec: -52.6956, mag: -0.72, color: '#f8f7ff', name: 'Canopus', constellation: '' },
    { ra: 14.2610, dec: 19.1825, mag: -0.04, color: '#ffb347', name: 'Arcturus', constellation: '' },
    { ra: 18.6156, dec: 38.7836, mag: 0.03, color: '#9db4ff', name: 'Vega', constellation: 'Lyra' },
    { ra: 5.2781, dec: 45.9980, mag: 0.08, color: '#fff4e8', name: 'Capella', constellation: '' },
    { ra: 5.2423, dec: -8.2017, mag: 0.13, color: '#9db4ff', name: 'Rigel', constellation: 'Orion' },
    { ra: 7.6550, dec: 5.2250, mag: 0.38, color: '#fff4e8', name: 'Procyon', constellation: '' },
    { ra: 5.9195, dec: 7.4070, mag: 0.50, color: '#ff6347', name: 'Betelgeuse', constellation: 'Orion' },
    { ra: 19.8464, dec: 8.8683, mag: 0.77, color: '#f0f8ff', name: 'Altair', constellation: '' },
    { ra: 4.5989, dec: 16.5092, mag: 0.85, color: '#ff8c00', name: 'Aldebaran', constellation: '' },
    { ra: 12.4394, dec: -63.0990, mag: 0.77, color: '#9db4ff', name: 'Acrux', constellation: '' },
    { ra: 7.7553, dec: 28.0262, mag: 0.87, color: '#fff4e8', name: 'Pollux', constellation: '' },
    { ra: 14.6634, dec: -60.3736, mag: 0.61, color: '#9db4ff', name: 'Hadar', constellation: '' },
    { ra: 20.6906, dec: 45.2804, mag: 1.25, color: '#f0f8ff', name: 'Deneb', constellation: 'Cygnus' },
    { ra: 12.2648, dec: 57.0326, mag: 1.76, color: '#fff4e8', name: 'Dubhe', constellation: 'BigDipper' },
    { ra: 5.5367, dec: 7.4072, mag: 2.23, color: '#ffffff', name: 'Bellatrix', constellation: 'Orion' },
    { ra: 5.5333, dec: -0.2992, mag: 1.64, color: '#ffffff', name: 'Alnilam', constellation: 'Orion' },
    { ra: 5.6794, dec: -1.9425, mag: 1.69, color: '#ffffff', name: 'Alnitak', constellation: 'Orion' },
    { ra: 11.0621, dec: 61.7508, mag: 1.79, color: '#ffffff', name: 'Alioth', constellation: 'BigDipper' },
    { ra: 13.7919, dec: 49.3133, mag: 2.37, color: '#ffffff', name: 'Mizar', constellation: 'BigDipper' },
    { ra: 11.8973, dec: 53.6948, mag: 1.86, color: '#ffffff', name: 'Megrez', constellation: 'BigDipper' },
    { ra: 12.9003, dec: 55.9597, mag: 2.44, color: '#ffffff', name: 'Phecda', constellation: 'BigDipper' },
    { ra: 11.0310, dec: 56.3825, mag: 2.34, color: '#ffffff', name: 'Merak', constellation: 'BigDipper' },
    { ra: 13.3986, dec: 54.9253, mag: 1.85, color: '#ffffff', name: 'Alkaid', constellation: 'BigDipper' },
    { ra: 0.1397, dec: 59.1497, mag: 2.24, color: '#ffffff', name: 'Caph', constellation: 'Cassiopeia' },
    { ra: 0.6750, dec: 60.7167, mag: 2.68, color: '#ffffff', name: 'Schedar', constellation: 'Cassiopeia' },
    { ra: 0.9453, dec: 60.2356, mag: 2.47, color: '#ffffff', name: 'Gamma Cas', constellation: 'Cassiopeia' },
    { ra: 1.4303, dec: 60.2356, mag: 3.44, color: '#ffffff', name: 'Ruchbah', constellation: 'Cassiopeia' },
    { ra: 1.9086, dec: 63.6700, mag: 3.35, color: '#ffffff', name: 'Segin', constellation: 'Cassiopeia' },
    { ra: 10.1394, dec: 11.9672, mag: 1.35, color: '#ffffff', name: 'Regulus', constellation: '' },
    { ra: 16.4902, dec: -26.4319, mag: 1.06, color: '#ff6347', name: 'Antares', constellation: '' },
    { ra: 7.5767, dec: 31.8883, mag: 1.93, color: '#ffffff', name: 'Castor', constellation: '' },
]

const CONSTELLATION_LINES = {
    Orion: [
        ['Betelgeuse', 'Bellatrix'],
        ['Bellatrix', 'Alnitak'],
        ['Alnitak', 'Alnilam'],
        ['Alnilam', 'Rigel'],
        ['Betelgeuse', 'Rigel'],
    ],
    BigDipper: [
        ['Dubhe', 'Merak'],
        ['Merak', 'Phecda'],
        ['Phecda', 'Megrez'],
        ['Megrez', 'Alioth'],
        ['Alioth', 'Mizar'],
        ['Mizar', 'Alkaid'],
    ],
    Cassiopeia: [
        ['Caph', 'Schedar'],
        ['Schedar', 'Gamma Cas'],
        ['Gamma Cas', 'Ruchbah'],
        ['Ruchbah', 'Segin'],
    ],
}

const OBJECT_DATABASE: { [key: string]: ObjectInfo } = {
    'Sirius': {
        name: 'Sirius',
        type: 'Binary Star System',
        description: 'The brightest star in Earth\'s night sky, located in Canis Major.',
        details: [
            'Distance: 8.6 light-years from Earth',
            'Magnitude: -1.46 (brightest star visible)',
            'Spectral type: A1V (white main-sequence)',
            'Binary companion: Sirius B (white dwarf)',
            'Surface temperature: ~9,940 K',
            'AstraLink Status: Primary navigation reference star'
        ],
        distance: '8.6 ly'
    },
    'Betelgeuse': {
        name: 'Betelgeuse',
        type: 'Red Supergiant',
        description: 'A massive red supergiant in Orion, nearing end of life.',
        details: [
            'Distance: ~642 light-years',
            'Magnitude: 0.50 (variable)',
            'Diameter: ~700× larger than the Sun',
            'Expected to go supernova within next million years',
            'Surface temperature: ~3,500 K',
            'AstraLink Status: Critical observation target'
        ],
        distance: '642 ly'
    },
    'ISS': {
        name: 'International Space Station',
        type: 'Space Station',
        description: 'Multinational collaborative project - largest human-made object in low Earth orbit.',
        details: [
            'Altitude: ~408 km above Earth',
            'Orbital speed: ~28,000 km/h',
            'Orbital period: ~90 minutes',
            'Crew capacity: 6-7 astronauts',
            'Launch: First module 1998',
            'AstraLink Status: LIVE TRACKING - Real-time telemetry active'
        ],
        altitude: '408 km',
        speed: '28,000 km/h'
    },
    'Hubble': {
        name: 'Hubble Space Telescope',
        type: 'Space Telescope',
        description: 'NASA\'s premier space observatory, revolutionizing astronomy since 1990.',
        details: [
            'Altitude: ~547 km above Earth',
            'Orbital speed: ~27,300 km/h',
            'Launch: April 24, 1990',
            'Mirror diameter: 2.4 meters',
            'Wavelength: UV to near-infrared',
            'AstraLink Status: Observatory asset - Mission planning integration'
        ],
        altitude: '547 km'
    },
    'Starlink': {
        name: 'Starlink Satellite',
        type: 'Communications Satellite',
        description: 'SpaceX satellite constellation providing global broadband internet.',
        details: [
            'Altitude: ~550 km above Earth',
            'Constellation size: 5,000+ satellites',
            'Orbital speed: ~27,000 km/h',
            'Mass: ~260 kg per satellite',
            'Design life: ~5 years',
            'AstraLink Status: Communications relay node'
        ],
        altitude: '550 km'
    },
    'Mars': {
        name: 'Mars',
        type: 'Planet',
        description: 'The Red Planet - fourth from the Sun and primary target for human exploration.',
        details: [
            'Distance from Earth: ~225 million km (avg)',
            'Diameter: 6,779 km',
            'Day length: 24.6 hours',
            'Year length: 687 Earth days',
            'Moons: Phobos and Deimos',
            'AstraLink Status: Mission planning target - Next launch window analysis'
        ],
        distance: '225M km'
    },
    'Jupiter': {
        name: 'Jupiter',
        type: 'Gas Giant Planet',
        description: 'Largest planet in our solar system with 79 known moons.',
        details: [
            'Distance from Earth: ~778 million km (avg)',
            'Diameter: 139,820 km',
            'Day length: 9.9 hours',
            'Year length: 4,333 Earth days',
            'Notable moons: Io, Europa, Ganymede, Callisto',
            'AstraLink Status: Deep space observation - Europa mission planning'
        ],
        distance: '778M km'
    },
    'Saturn': {
        name: 'Saturn',
        type: 'Gas Giant Planet',
        description: 'Famous for its spectacular ring system, second-largest planet.',
        details: [
            'Distance from Earth: ~1.4 billion km (avg)',
            'Diameter: 116,460 km',
            'Ring span: ~280,000 km',
            'Notable moon: Titan (larger than Mercury)',
            'Day length: 10.7 hours',
            'AstraLink Status: Ring system analysis - Cassini data integration'
        ],
        distance: '1.4B km'
    },
    'Venus': {
        name: 'Venus',
        type: 'Terrestrial Planet',
        description: 'Earth\'s "sister planet" with extreme greenhouse effect.',
        details: [
            'Distance from Earth: ~41 million km (closest approach)',
            'Diameter: 12,104 km',
            'Surface temperature: ~465°C',
            'Day length: 243 Earth days (retrograde)',
            'Atmospheric pressure: 92× Earth\'s',
            'AstraLink Status: Atmospheric research priority'
        ],
        distance: '41M km'
    },
    'Moon': {
        name: 'The Moon',
        type: 'Natural Satellite',
        description: 'Earth\'s only natural satellite and humanity\'s first extraterrestrial destination.',
        details: [
            'Distance from Earth: ~384,400 km',
            'Diameter: 3,474 km',
            'Orbital period: 27.3 days',
            'Phase cycle: 29.5 days',
            'First landing: Apollo 11, July 20, 1969',
            'AstraLink Status: ARTEMIS mission coordination - Landing site analysis'
        ],
        distance: '384,400 km'
    }
}

function RealisticStars({ location, dateTime, showLabels, showConstellations, onObjectClick }: {
    location: Location,
    dateTime: Date,
    showLabels: boolean,
    showConstellations: boolean,
    onObjectClick: (info: ObjectInfo) => void
}) {
    const groupRef = useRef<THREE.Group>(null)
    const [stars, setStars] = useState<Array<{ x: number, y: number, z: number, name: string, mag: number, size: number }>>([])
    const [starPositions, setStarPositions] = useState<Map<string, [number, number, number]>>(new Map())

    useEffect(() => {
        if (!groupRef.current) return

        const jd = dateTime.getTime() / 86400000 + 2440587.5
        const T = (jd - 2451545.0) / 36525
        const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T
        const lst = (gmst + location.longitude) % 360

        groupRef.current.clear()
        const visibleStars: Array<{ x: number, y: number, z: number, name: string, mag: number, size: number }> = []
        const positions = new Map<string, [number, number, number]>()

        STAR_CATALOG.forEach((star) => {
            const ha = (lst - star.ra * 15) * Math.PI / 180
            const dec = star.dec * Math.PI / 180
            const lat = location.latitude * Math.PI / 180
            const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha)
            const alt = Math.asin(sinAlt)

            if (alt > 0) {
                const cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat))
                let az = Math.acos(Math.max(-1, Math.min(1, cosAz)))
                if (Math.sin(ha) > 0) az = 2 * Math.PI - az

                const radius = 180
                const x = radius * Math.cos(alt) * Math.sin(az)
                const y = radius * Math.sin(alt)
                const z = -radius * Math.cos(alt) * Math.cos(az)

                positions.set(star.name, [x, y, z])

                const size = Math.max(0.3, Math.pow(2.512, -star.mag) * 1.2)
                const geometry = new THREE.SphereGeometry(size, 32, 32)
                const material = new THREE.MeshBasicMaterial({
                    color: star.color,
                    transparent: true,
                    opacity: Math.min(1, Math.pow(2.512, -star.mag) * 0.8)
                })
                const mesh = new THREE.Mesh(geometry, material)
                mesh.position.set(x, y, z)
                mesh.userData = { name: star.name, type: 'star' }
                groupRef.current!.add(mesh)

                if (star.mag < 2) {
                    const glowSize = size * 6
                    const glowGeometry = new THREE.SphereGeometry(glowSize, 32, 32)
                    const glowMaterial = new THREE.MeshBasicMaterial({
                        color: star.color,
                        transparent: true,
                        opacity: 0.15,
                        blending: THREE.AdditiveBlending
                    })
                    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
                    glow.position.set(x, y, z)
                    groupRef.current!.add(glow)
                }

                if (star.name) {
                    visibleStars.push({ x, y: y + size + 3, z, name: star.name, mag: star.mag, size })
                }
            }
        })

        setStars(visibleStars)
        setStarPositions(positions)
    }, [location, dateTime])

    return (
        <group ref={groupRef}>
            {showLabels && stars.map((star, i) => (
                <Text
                    key={i}
                    position={[star.x, star.y, star.z]}
                    fontSize={star.mag < 1 ? 2 : 1.5}
                    color="#22d3ee"
                    anchorX="center"
                    anchorY="bottom"
                    outlineWidth={0.15}
                    outlineColor="#000000"
                    onClick={() => {
                        const info = OBJECT_DATABASE[star.name]
                        if (info) onObjectClick(info)
                    }}
                >
                    {star.name}
                </Text>
            ))}
            {showConstellations && Object.entries(CONSTELLATION_LINES).map(([constellation, lines]) =>
                lines.map((line, i) => {
                    const start = starPositions.get(line[0])
                    const end = starPositions.get(line[1])
                    if (start && end) {
                        return (
                            <Line
                                key={`${constellation}-${i}`}
                                points={[start, end]}
                                color="#22d3ee"
                                lineWidth={1}
                                opacity={0.4}
                                transparent
                            />
                        )
                    }
                    return null
                })
            )}
        </group>
    )
}

function MeteorShower() {
    const meteorsRef = useRef<THREE.Group>(null)

    useFrame(() => {
        if (!meteorsRef.current) return

        meteorsRef.current.children.forEach((meteor) => {
            meteor.position.x -= 2
            meteor.position.y -= 3

            if (meteor.position.y < 0) {
                meteor.position.x = Math.random() * 200 - 100
                meteor.position.y = 150
                meteor.position.z = Math.random() * 200 - 100
            }
        })
    })

    return (
        <group ref={meteorsRef}>
            {Array.from({ length: 8 }).map((_, i) => (
                <mesh key={i} position={[Math.random() * 200 - 100, 150, Math.random() * 200 - 100]}>
                    <sphereGeometry args={[0.3, 8, 8]} />
                    <meshBasicMaterial color="#ffffff" />
                    <mesh position={[1, 2, 0]}>
                        <coneGeometry args={[0.2, 4, 8]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
                    </mesh>
                </mesh>
            ))}
        </group>
    )
}

function AuroraBorealis() {
    const auroraRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!auroraRef.current) return
        const material = auroraRef.current.material as THREE.MeshBasicMaterial
        material.opacity = 0.3 + Math.sin(state.clock.elapsedTime) * 0.1
    })

    return (
        <mesh ref={auroraRef} position={[0, 50, -100]} rotation={[Math.PI / 4, 0, 0]}>
            <planeGeometry args={[200, 80, 32, 32]} />
            <meshBasicMaterial
                color="#00ff88"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    )
}

function RealTimeISS({ showLabel, onObjectClick }: { showLabel: boolean, onObjectClick: (info: ObjectInfo) => void }) {
    const issRef = useRef<THREE.Group>(null)
    const [issPosition, setIssPosition] = useState({ lat: 0, lon: 0, alt: 408 })

    useEffect(() => {
        const fetchISSPosition = async () => {
            try {
                const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
                const data = await response.json()
                setIssPosition({ lat: data.latitude, lon: data.longitude, alt: data.altitude })
            } catch (error) {
                console.error('ISS position fetch error:', error)
            }
        }

        fetchISSPosition()
        const interval = setInterval(fetchISSPosition, 5000)
        return () => clearInterval(interval)
    }, [])

    const issX = Math.cos(issPosition.lat * Math.PI / 180) * Math.sin(issPosition.lon * Math.PI / 180) * 100
    const issY = Math.sin(issPosition.lat * Math.PI / 180) * 100 + 20
    const issZ = -Math.cos(issPosition.lat * Math.PI / 180) * Math.cos(issPosition.lon * Math.PI / 180) * 100

    return (
        <group ref={issRef} position={[issX, issY, issZ]} onClick={() => onObjectClick(OBJECT_DATABASE['ISS'])}>
            <mesh>
                <boxGeometry args={[3, 1, 8]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[-5, 0, 0]}>
                <boxGeometry args={[6, 0.1, 12]} />
                <meshStandardMaterial color="#1e90ff" metalness={0.5} />
            </mesh>
            <mesh position={[5, 0, 0]}>
                <boxGeometry args={[6, 0.1, 12]} />
                <meshStandardMaterial color="#1e90ff" metalness={0.5} />
            </mesh>
            <pointLight color="#ff0000" intensity={2} distance={10} />
            {showLabel && (
                <Text position={[0, 4, 0]} fontSize={1.5} color="#facc15" anchorX="center" outlineWidth={0.2} outlineColor="#000000">
                    ISS (LIVE)
                </Text>
            )}
        </group>
    )
}

function MilkyWay() {
    return (
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]}>
            <torusGeometry args={[150, 30, 16, 100]} />
            <meshBasicMaterial color="#e8e8ff" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
    )
}

function Planets({ showLabels, onObjectClick }: { showLabels: boolean, onObjectClick: (info: ObjectInfo) => void }) {
    const planets = [
        { name: 'Mars', position: [60, 80, -40] as [number, number, number], color: '#ff6347', size: 0.8 },
        { name: 'Jupiter', position: [-70, 90, 30] as [number, number, number], color: '#f4e4c1', size: 1.2 },
        { name: 'Saturn', position: [50, 70, 60] as [number, number, number], color: '#ffe4b5', size: 1.0 },
        { name: 'Venus', position: [-40, 60, -70] as [number, number, number], color: '#fff8dc', size: 0.9 },
    ]

    return (
        <group>
            {planets.map((planet, i) => (
                <group key={i} position={planet.position} onClick={() => onObjectClick(OBJECT_DATABASE[planet.name])}>
                    <mesh>
                        <sphereGeometry args={[planet.size, 32, 32]} />
                        <meshBasicMaterial color={planet.color} />
                    </mesh>
                    <mesh>
                        <sphereGeometry args={[planet.size * 2, 32, 32]} />
                        <meshBasicMaterial color={planet.color} transparent opacity={0.2} />
                    </mesh>
                    {showLabels && (
                        <Text position={[0, planet.size + 2, 0]} fontSize={1.8} color="#ffff00" anchorX="center" outlineWidth={0.15} outlineColor="#000000">
                            {planet.name}
                        </Text>
                    )}
                </group>
            ))}
        </group>
    )
}

function Satellites({ showLabels, onObjectClick }: { showLabels: boolean, onObjectClick: (info: ObjectInfo) => void }) {
    const hubbleRef = useRef<THREE.Group>(null)
    const starlinkRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        if (hubbleRef.current) {
            hubbleRef.current.position.x = Math.sin(time * 0.12 + 1) * 90
            hubbleRef.current.position.z = Math.cos(time * 0.12 + 1) * 90
        }

        if (starlinkRef.current) {
            starlinkRef.current.position.x = Math.sin(time * 0.2 + 2) * 110
            starlinkRef.current.position.z = Math.cos(time * 0.2 + 2) * 110
        }
    })

    return (
        <group>
            <group ref={hubbleRef} position={[0, 55, 0]} onClick={() => onObjectClick(OBJECT_DATABASE['Hubble'])}>
                <mesh>
                    <cylinderGeometry args={[0.8, 0.8, 5]} />
                    <meshStandardMaterial color="#808080" metalness={0.9} />
                </mesh>
                <mesh position={[0, 3, 0]}>
                    <cylinderGeometry args={[1.5, 1.5, 1]} />
                    <meshStandardMaterial color="#4169e1" metalness={0.7} />
                </mesh>
                {showLabels && (
                    <Text position={[0, 4, 0]} fontSize={1.3} color="#00ff00" anchorX="center" outlineWidth={0.15} outlineColor="#000000">
                        Hubble
                    </Text>
                )}
            </group>

            <group ref={starlinkRef} position={[0, 65, 0]} onClick={() => onObjectClick(OBJECT_DATABASE['Starlink'])}>
                <mesh>
                    <boxGeometry args={[2, 0.3, 3]} />
                    <meshStandardMaterial color="#ffffff" metalness={0.9} />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[0.3, 0.5, 0.3]} />
                    <meshStandardMaterial color="#ff1493" emissive="#ff1493" emissiveIntensity={0.5} />
                </mesh>
                {showLabels && (
                    <Text position={[0, 2, 0]} fontSize={1.2} color="#ff69b4" anchorX="center" outlineWidth={0.15} outlineColor="#000000">
                        Starlink
                    </Text>
                )}
            </group>
        </group>
    )
}

function House() {
    return (
        <group position={[0, 0, 0]}>
            <mesh position={[0, 5, 0]} castShadow>
                <boxGeometry args={[10, 10, 10]} />
                <meshStandardMaterial color="#D2691E" emissive="#8B4513" emissiveIntensity={0.5} roughness={0.6} />
            </mesh>
            <mesh position={[0, 11, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[8, 4, 4]} />
                <meshStandardMaterial color="#DC143C" emissive="#8B0000" emissiveIntensity={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0, 2.5, 5.1]}>
                <boxGeometry args={[2.5, 5, 0.3]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[-3, 6, 5.1]}>
                <boxGeometry args={[2, 2, 0.2]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
            </mesh>
            <mesh position={[3, 6, 5.1]}>
                <boxGeometry args={[2, 2, 0.2]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
            </mesh>
            <pointLight position={[-3, 6, 5.5]} intensity={5} distance={20} color="#FFD700" />
            <pointLight position={[3, 6, 5.5]} intensity={5} distance={20} color="#FFD700" />

            <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#4a7c2c" emissive="#2d5016" emissiveIntensity={0.3} roughness={0.8} />
            </mesh>

            <Text position={[0, 1, -30]} fontSize={5} color="#ff4444" anchorX="center" fontWeight="bold">NORTH</Text>
            <Text position={[30, 1, 0]} fontSize={5} color="#ffffff" anchorX="center">EAST</Text>
            <Text position={[0, 1, 30]} fontSize={5} color="#ffffff" anchorX="center">SOUTH</Text>
            <Text position={[-30, 1, 0]} fontSize={5} color="#ffffff" anchorX="center">WEST</Text>
        </group>
    )
}

function RealisticSky({ isNightMode }: { isNightMode: boolean }) {
    const skyColor = isNightMode ? '#000510' : '#87CEEB'

    return (
        <>
            <mesh>
                <sphereGeometry args={[400, 64, 64]} />
                <meshBasicMaterial side={THREE.BackSide} color={skyColor} />
            </mesh>
            {isNightMode && <DreiStars radius={350} depth={150} count={20000} factor={12} saturation={0} fade speed={0} />}
            <ambientLight intensity={isNightMode ? 0.2 : 1.5} />
            {isNightMode && <hemisphereLight color="#9db4ff" groundColor="#000510" intensity={0.3} />}
        </>
    )
}

function Sun() {
    return (
        <group position={[150, 180, -100]}>
            <mesh>
                <sphereGeometry args={[15, 64, 64]} />
                <meshBasicMaterial color="#FDB813" />
            </mesh>
            <mesh>
                <sphereGeometry args={[25, 64, 64]} />
                <meshBasicMaterial color="#FFD700" transparent opacity={0.2} />
            </mesh>
            <pointLight intensity={8} distance={600} color="#ffffff" />
        </group>
    )
}

function Moon({ isNightMode, onObjectClick }: { isNightMode: boolean, onObjectClick: (info: ObjectInfo) => void }) {
    if (!isNightMode) return null
    return (
        <group position={[-120, 150, 80]} onClick={() => onObjectClick(OBJECT_DATABASE['Moon'])}>
            <mesh>
                <sphereGeometry args={[8, 64, 64]} />
                <meshStandardMaterial color="#f4f4f4" emissive="#f4f4f4" emissiveIntensity={0.3} />
            </mesh>
            <pointLight intensity={1} distance={200} color="#e8e8ff" />
        </group>
    )
}

export default function SkyView() {
    const [location, setLocation] = useState<Location>({ latitude: 34.6868, longitude: -118.1542, name: 'Lancaster, CA' })
    const [searchQuery, setSearchQuery] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date())
    const [timeSpeed, setTimeSpeed] = useState(0)
    const [isNightMode, setIsNightMode] = useState(true)
    const [showLabels, setShowLabels] = useState(true)
    const [isSearching, setIsSearching] = useState(false)
    const [cameraFov, setCameraFov] = useState(75)
    const [showConstellations, setShowConstellations] = useState(true)
    const [showMeteors, setShowMeteors] = useState(true)
    const [showAurora, setShowAurora] = useState(true)
    const [telescopeMode, setTelescopeMode] = useState(false)
    const [selectedObject, setSelectedObject] = useState<ObjectInfo | null>(null)

    useEffect(() => {
        if (timeSpeed === 0) return
        const interval = setInterval(() => setCurrentTime(prev => new Date(prev.getTime() + 1000 * timeSpeed)), 1000)
        return () => clearInterval(interval)
    }, [timeSpeed])

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        setIsSearching(true)

        const coordMatch = searchQuery.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/)
        if (coordMatch) {
            setLocation({ latitude: parseFloat(coordMatch[1]), longitude: parseFloat(coordMatch[2]), name: `${coordMatch[1]}, ${coordMatch[2]}` })
            setIsSearching(false)
            return
        }

        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1`)
            const data = await response.json()

            if (data.results && data.results.length > 0) {
                const result = data.results[0]
                setLocation({ latitude: result.latitude, longitude: result.longitude, name: `${result.name}, ${result.country}` })
            } else {
                alert('City not found. Try coordinates like: 40.7,-74.0')
            }
        } catch (error) {
            console.error('Geocoding error:', error)
            alert('Error finding city. Try coordinates like: 40.7,-74.0')
        }

        setIsSearching(false)
    }

    const handleZoom = (direction: 'in' | 'out') => {
        setCameraFov(prev => direction === 'in' ? Math.max(30, prev - 10) : Math.min(120, prev + 10))
    }

    const toggleTelescopeMode = () => {
        setTelescopeMode(!telescopeMode)
        setCameraFov(telescopeMode ? 75 : 20)
    }

    const handleObjectClick = (info: ObjectInfo) => {
        setSelectedObject(info)
    }

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)', padding: '1.5rem', zIndex: 100 }}>
                <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22d3ee', letterSpacing: '0.05em', margin: 0 }}>
                            ASTRALINK PROMETHEUS — SKY VIEW {isNightMode ? '🌙' : '☀️'}
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }} suppressHydrationWarning>
                            {location.name} • {currentTime.toLocaleString()} • Mission Control: LIVE {telescopeMode && '🔭'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" placeholder="City or lat,lon" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{
                                padding: '0.5rem 1rem', background: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(34, 211, 238, 0.3)',
                                borderRadius: '0.25rem', color: '#ffffff', width: '300px', outline: 'none'
                            }} />
                        <button onClick={handleSearch} disabled={isSearching}
                            style={{
                                padding: '0.5rem 1rem', background: 'rgba(34, 211, 238, 0.2)', border: '1px solid #22d3ee',
                                borderRadius: '0.25rem', color: '#22d3ee', cursor: 'pointer', fontWeight: 'bold'
                            }}>
                            {isSearching ? '...' : 'GO'}
                        </button>
                    </div>
                </div>
            </div>

            {/* INFO PANEL */}
            {selectedObject && (
                <div style={{
                    position: 'fixed', top: '50%', left: '2rem', transform: 'translateY(-50%)',
                    background: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(10px)',
                    border: '2px solid #22d3ee', borderRadius: '0.5rem', padding: '1.5rem',
                    maxWidth: '400px', zIndex: 150, boxShadow: '0 0 30px rgba(34, 211, 238, 0.5)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22d3ee', margin: 0 }}>
                            {selectedObject.name}
                        </h2>
                        <button onClick={() => setSelectedObject(null)}
                            style={{
                                background: 'transparent', border: 'none', color: '#ff4444',
                                fontSize: '1.5rem', cursor: 'pointer', padding: '0.25rem'
                            }}>✕</button>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        {selectedObject.type}
                    </div>
                    <p style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                        {selectedObject.description}
                    </p>
                    <div style={{ borderTop: '1px solid rgba(34, 211, 238, 0.3)', paddingTop: '1rem' }}>
                        {selectedObject.details.map((detail, i) => (
                            <div key={i} style={{
                                color: '#22d3ee', fontSize: '0.85rem', marginBottom: '0.5rem',
                                paddingLeft: '0.5rem', borderLeft: '2px solid rgba(34, 211, 238, 0.5)'
                            }}>
                                {detail}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{
                position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(10px)', border: '2px solid rgba(34, 211, 238, 0.5)', borderRadius: '0.5rem', padding: '1rem 2rem',
                zIndex: 100, display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)', flexWrap: 'wrap', maxWidth: '90vw', justifyContent: 'center'
            }}>
                <button onClick={() => setIsNightMode(false)}
                    style={{
                        padding: '0.75rem 1.5rem', background: !isNightMode ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)',
                        border: '2px solid #22d3ee', borderRadius: '0.25rem', color: !isNightMode ? '#000' : '#22d3ee',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
                    }}>☀️ DAY</button>
                <button onClick={() => setIsNightMode(true)}
                    style={{
                        padding: '0.75rem 1.5rem', background: isNightMode ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)',
                        border: '2px solid #22d3ee', borderRadius: '0.25rem', color: isNightMode ? '#000' : '#22d3ee',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
                    }}>🌙 NIGHT</button>
                <button onClick={() => setShowLabels(!showLabels)}
                    style={{
                        padding: '0.5rem 1rem', background: showLabels ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)',
                        border: '1px solid #22d3ee', borderRadius: '0.25rem', color: showLabels ? '#000' : '#22d3ee',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}>🏷️ LABELS</button>
                <button onClick={() => setShowConstellations(!showConstellations)}
                    style={{
                        padding: '0.5rem 1rem', background: showConstellations ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)',
                        border: '1px solid #22d3ee', borderRadius: '0.25rem', color: showConstellations ? '#000' : '#22d3ee',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}>⭐ LINES</button>
                <button onClick={() => setShowMeteors(!showMeteors)}
                    style={{
                        padding: '0.5rem 1rem', background: showMeteors ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)',
                        border: '1px solid #22d3ee', borderRadius: '0.25rem', color: showMeteors ? '#000' : '#22d3ee',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}>☄️ METEORS</button>
                <button onClick={() => setShowAurora(!showAurora)}
                    style={{
                        padding: '0.5rem 1rem', background: showAurora ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)',
                        border: '1px solid #22d3ee', borderRadius: '0.25rem', color: showAurora ? '#000' : '#22d3ee',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}>🌌 AURORA</button>
                <button onClick={toggleTelescopeMode}
                    style={{
                        padding: '0.5rem 1rem', background: telescopeMode ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)',
                        border: '1px solid #22d3ee', borderRadius: '0.25rem', color: telescopeMode ? '#000' : '#22d3ee',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}>🔭 SCOPE</button>
            </div>

            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 100 }}>
                <button onClick={() => handleZoom('in')}
                    style={{
                        width: '60px', height: '60px', background: 'rgba(34, 211, 238, 0.2)', border: '2px solid #22d3ee',
                        borderRadius: '0.5rem', color: '#22d3ee', cursor: 'pointer', fontSize: '28px', fontWeight: 'bold'
                    }}>+</button>
                <button onClick={() => handleZoom('out')}
                    style={{
                        width: '60px', height: '60px', background: 'rgba(34, 211, 238, 0.2)', border: '2px solid #22d3ee',
                        borderRadius: '0.5rem', color: '#22d3ee', cursor: 'pointer', fontSize: '28px', fontWeight: 'bold'
                    }}>−</button>
            </div>

            <Canvas key={cameraFov} camera={{ position: [0, 10, 35], fov: cameraFov }} shadows>
                <RealisticSky isNightMode={isNightMode} />
                <House />
                {isNightMode && (
                    <>
                        <RealisticStars location={location} dateTime={currentTime} showLabels={showLabels} showConstellations={showConstellations} onObjectClick={handleObjectClick} />
                        <MilkyWay />
                        <Planets showLabels={showLabels} onObjectClick={handleObjectClick} />
                        <Satellites showLabels={showLabels} onObjectClick={handleObjectClick} />
                        <RealTimeISS showLabel={showLabels} onObjectClick={handleObjectClick} />
                        {showMeteors && <MeteorShower />}
                        {showAurora && location.latitude > 50 && <AuroraBorealis />}
                        <Moon isNightMode={isNightMode} onObjectClick={handleObjectClick} />
                    </>
                )}
                {!isNightMode && <Sun />}
                <OrbitControls target={[0, 20, 0]} minDistance={10} maxDistance={100} />
            </Canvas>
        </div>
    )
}