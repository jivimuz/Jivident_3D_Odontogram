"use client"
import React, { useEffect, useState } from 'react'

function Footer() {
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
            <footer className="bg-gray-800 text-white p-3 text-center text-xs mt-auto bottom-0 fixed w-full">
                <p>&copy; {new Date().getFullYear()} Jivident 3D | Developed by Jivimz_ | All rights reserved.</p>
                <p className="text-gray-400 mt-1">Session IP: {userId}</p>
            </footer>
        )
}

export default Footer