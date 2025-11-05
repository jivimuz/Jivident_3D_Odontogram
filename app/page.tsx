"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Load3D from './Component/3dModel';
/**
 * Main 3D Odontogram component.
 * Manages application state (mode) and data.
 */
const App = () => {
    const [userId, setUserId] = useState('Loading IP...');

      // --- NEW EFFECT: Fetch User IP ---
        useEffect(() => {
            // Function to fetch IP from a public API
            async function fetchUserIp() {
                try {
                    // Menggunakan API publik yang aman untuk mendapatkan IP
                    const response = await fetch('https://api.ipify.org?format=json');
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setUserId(data.ip); // Set the fetched IP
                } catch (error) {
                    console.error("Failed to fetch IP:", error);
                    setUserId('IP Unavailable'); // Fallback on error
                }
            }
    
            fetchUserIp();
        }, []); // Empty dependency array means this runs only once when the App component mounts
    return (
        <div >
         <script src="https://cdn.tailwindcss.com"></script>
           {/* CDN for Tailwind (already present) */}
           
            {/* HILANGKAN SCRIPT JSPDF DI SINI, DIMUAT DINAMIS OLEH APP UTAMA */}
            
            
            {/* --- HEADER --- */}
            <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
                {/* Logo Kiri */}
                <div className="flex items-center space-x-3">
                    <img src={'/assets/logo.png'} width={200} className="mx-auto"  />
                </div>
                {/* Nama Pasien/Sesi Kanan */}
                <div className="text-sm text-right">
                     <a href="mailto:jivirasgal@gmail.com" className="link inline-block px-5 py-2 text-lg md:px-8 md:py-2 md:text-xl font-semibold bg-apple-accent border text-blue-500 rounded-full transition duration-300 hover:bg-white hover:text-black hover:ring-2 hover:ring-apple-accent focus:outline-none scroll-animate" style={{ transitionDelay: '0.4s' }}>
                            Email Me
                        </a>
                </div>
            </header>
            
         <Load3D  />
         
        </div>
    )
};

export default App;
