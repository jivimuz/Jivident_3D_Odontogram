"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Using GLTFLoader
import DevNotes from './devNotes';
import RighSpace from './rightSpace';

// --- Three.js Global Variables ---
let scene, camera, renderer, toothMeshes = [], raycaster, pointer, controls;

// --- Constants ---
const HIGHLIGHT_COLOR = 0x3b82f6; // Tailwind blue-500
const ORIGINAL_COLOR = 0xf5f5dc; // Ivory (Initial tooth color)
const MARKER_COLOR = 0xff0000; // Red

// Default material for teeth
const defaultToothMaterial = new THREE.MeshPhongMaterial({
    color: ORIGINAL_COLOR,
    specular: 0x555555,
    shininess: 30,
    flatShading: false,
    side: THREE.DoubleSide 
});

// Mapping untuk ID mesh ke nama yang lebih deskriptif
const TOOTH_MESH_NAME_MAP = {
    'Gums_Maxilla001_0': 'Gums Maxilla',
    'Gums_Mandibula001_0': 'Gums Mandibulla',
    'A_0': '(Left Top) Molar',
    'B_0': '(Left Top) Premolar',
    'C_0': '(Left Top) Canine',
    'D_0': '(Left Top) Lateral',
    'E_0': '(Left Top) Central',
    'F_0': '(Right Top) Central',
    'G_0': '(Right Top) Lateral',
    'H_0': '(Right Top) Canine',
    'I_0': '(Right Top) Premolar',
    'J_0': '(Right Top) Molar',
    'K_0': '(Left Bottom) Molar',
    'L_0': '(Left Bottom) Premolar',
    'M_0': '(Left Bottom) Canine',
    'N_0': '(Left Bottom) Lateral',
    'O_0': '(Left Bottom) Central',
    'P_0': '(Left Right) Central',
    'Q_0': '(Left Right) Lateral',
    'R_0': '(Left Right) Canine',
    'S_0': '(Left Right) Premolar',
    'T_0': '(Left Right) Molar',
};


/**
 * Function to load the 3D model using GLTFLoader.
 * CHANGE: Hybrid mapping. All meshes are clickable, but names are pulled from the map if available.
 */
async function loadTeethModel(setIsLoading, setAppMode) {
    // Clean up the scene if an old model exists
    const oldArchGroup = scene.getObjectByName("ArchGroup");
    if (oldArchGroup) {
        scene.remove(oldArchGroup);
        oldArchGroup.traverse(child => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }
    
    toothMeshes = []; // Reset the clickable mesh list
    
    // --- MAIN LOGIC: Using GLTFLoader ---
    const loader = new GLTFLoader();
    // Use the user-requested URL (assuming it's in the /public folder)
    const GLB_URL = '/assets/3d/user.bin.gz'; 

    try {
        const gltf = await loader.loadAsync(GLB_URL);
        const loadedModel = gltf.scene;
        
        // Set model position, scale, rotation (may need adjustment)
        loadedModel.scale.set(1.0, 1.0, 1.0); 
        loadedModel.position.set(0, -2, 0); 
        loadedModel.rotation.set(0, 0, 0); 
        loadedModel.name = "ArchGroup"; // Rename group
        
        let meshCount = 0;

        // Traverse model to find tooth meshes
        loadedModel.traverse(child => {
            if (child.isMesh) {
                meshCount++;
                
                // *** LOG UNTUK MAPPING MANUAL (Opsional) ***
                // Anda masih perlu ini untuk mengisi TOOTH_MESH_NAME_MAP
                // console.log("Found mesh:", child.name); 

                // --- LOGIKA MAPPING HYBRID (BARU) ---
                
                // 1. Cek apakah nama mesh ada di PETA
                const mappedId = TOOTH_MESH_NAME_MAP[child.name];
                
                // 2. Terapkan material default
                const singleMaterial = defaultToothMaterial.clone();
                child.material = singleMaterial;

                // 3. Tentukan objek target (Grup atau mesh itu sendiri)
                const targetObject = (child.parent && child.parent.type !== 'Scene') ? child.parent : child;

                // 4. Set userData pada objek target
                if (!targetObject.userData.isTooth) {
                    targetObject.userData = {
                        // Jika 'mappedId' ada, gunakan itu. 
                        // Jika tidak (masih placeholder), gunakan nama mesh ASLI sebagai ID.
                        toothId: mappedId ? mappedId : child.name, 
                        isTooth: true, 
                        isMapped: false, 
                        markerIds: [],
                        originalColor: ORIGINAL_COLOR
                    };
                }
                
                // 5. SELALU tambahkan mesh ke daftar yang bisa diklik
                child.userData.parentGroup = targetObject; 
                toothMeshes.push(child); 
            }
        });

        // console.log(`Model loaded, found ${meshCount} meshes. ${toothMeshes.length} meshes mapped as clickable.`);
        scene.add(loadedModel);
        setIsLoading(false);
        setAppMode('mapping'); // Pindah ke mode mapping setelah pemuatan berhasil

    } catch (error) {
        console.error(`Failed to load model at ${GLB_URL}:`, error);
        // Menghapus baris log yang tidak diperlukan di sini
        setIsLoading(false);
        // Biarkan tetap di 'loading' atau pindahkan ke 'selection' jika gagal total
    }
}


/**
 * Function to initialize the Three.js scene. (Only run once)
 */
function initThree(canvasRef) {
    const canvas = canvasRef.current;
    if (!canvas || scene) return; // Only initialize if it doesn't exist

    // --- 1. Scene, Camera, Renderer ---
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
    // Set camera to look from the front with mouth open
    camera.position.set(0, 2.5, 100); 
    
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xecf0f1, 0); 

    // --- 2. Interactive Controls (Orbit Controls) ---
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 130;
    controls.target.set(4, 8, 0); // Focus on the center between the jaws

    // --- 3. Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
    keyLight.position.set(10, 10, 10);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-10, -10, -5);
    scene.add(fillLight);

    // --- 4. Raycasting Setup ---
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    // --- 5. Animation Loop ---
    // Moved to init to only run once
    const animate = () => {
        if (!renderer) return; // Stop if scene is cleaned up
        requestAnimationFrame(animate);
        if (controls) controls.update(); 
        if (renderer) renderer.render(scene, camera);
    };
    animate();
}


// Helper function to remove markers from the scene
const removeMarkersFromScene = (markerIds) => {
    markerIds.forEach(id => {
        const marker = scene.getObjectByName(`Marker-${id}`);
        if (marker) {
            scene.remove(marker);
            // Clean up geometry and material to prevent memory leaks
            marker.geometry.dispose();
            marker.material.dispose();
        }
    });
};

/**
 * Function to handle clicks on the tooth model (Mapping) with toggle functionality.
 */
const onCanvasClick = (event, canvasRef, setMappedPoints) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    // Check for intersections only with tooth meshes in the array
    const intersects = raycaster.intersectObjects(toothMeshes, false); 

    if (intersects.length > 0) {
        const intersect = intersects[0];
        const clickedMesh = intersect.object;
        
        // --- Get Parent Group ---
        // We hit a mesh, but we want to control the whole tooth (Group/TargetObject)
        if (!clickedMesh.userData.parentGroup || !clickedMesh.userData.parentGroup.userData.isTooth) return;
        
        const toothGroup = clickedMesh.userData.parentGroup;
        const toothId = toothGroup.userData.toothId;
        const point = intersect.point;
        
        const isCurrentlyMapped = toothGroup.userData.isMapped;

        if (isCurrentlyMapped) {
            // --- REMOVE (Toggle OFF) ---
            const markerIdsToRemove = toothGroup.userData.markerIds;
            removeMarkersFromScene(markerIdsToRemove);

            // Reset color: Find all meshes associated with this group and recolor
            toothGroup.traverse(child => {
                if (child.isMesh && child.userData.parentGroup === toothGroup) {
                    child.material.color.setHex(ORIGINAL_COLOR);
                }
            });
            
            toothGroup.userData.isMapped = false;
            toothGroup.userData.markerIds = []; // Reset marker IDs

            // Remove point from React state
            setMappedPoints(prevPoints => prevPoints.filter(p => p.toothId !== toothId));
            
        } else {
            // --- ADD (Toggle ON) ---
            const newMarkerId = Date.now();

            // Mark Clicked Tooth (Highlight)
            toothGroup.traverse(child => {
                if (child.isMesh && child.userData.parentGroup === toothGroup) {
                    child.material.color.setHex(HIGHLIGHT_COLOR);
                }
            });
            
            toothGroup.userData.isMapped = true;
            toothGroup.userData.markerIds = [newMarkerId]; // Save new marker ID

            // Add visual marker
            const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8); // Marker scale may need adjustment
            const markerMaterial = new THREE.MeshBasicMaterial({ color: MARKER_COLOR }); 
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);

            marker.position.copy(point);
            marker.name = `Marker-${newMarkerId}`; // Unique name
            scene.add(marker);

            // Update React state
            setMappedPoints(prevPoints => [
                ...prevPoints,
                { 
                    id: newMarkerId,
                    toothId: toothId, 
                    x: point.x.toFixed(2), 
                    y: point.y.toFixed(2), 
                    z: point.z.toFixed(2),
                    type: 'Karies', // Default type
                    description: '' // New description added
                }
            ]);
        }
    }
};

// --- NEW COMPONENT: Selection Screen ---
const SelectionScreen = ({ onNewPatient, onTriggerImport }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 font-sans">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                .font-sans {
                    font-family: 'Inter', sans-serif;
                }
                `}
            </style>
            <div className="bg-white p-10 rounded-xl shadow-2xl max-w-md w-full text-center justify-center">
                <img src={'/assets/logo.png'} width={200} className="mx-auto"  />
                <h1 className="text-xl font-bold text-teal-700 mb-6">3D Odontogram</h1>
                <p className="text-gray-600 mb-8">Welcome. Please start a new session or import existing patient data.</p>
                <div className="space-y-4">
                    <button
                        onClick={onNewPatient}
                        className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition duration-150 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        New Patient
                    </button>
                    <button
                        onClick={onTriggerImport}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.739 0A3.5 3.5 0 0114.5 13H11v-1.117a1 1 0 00-1.447-.894l-4 2a1 1 0 000 1.788l4 2A1 1 0 0011 14.117V13H5.5z" />
                            <path d="M9 13H5.5a3.5 3.5 0 010-7h.04c.097-.626.315-1.22.614-1.758A5.01 5.01 0 0110 3a5.01 5.01 0 014.346 2.242.614.614 0 00.614 1.758H14.5a3.5 3.5 0 010 7H9v-1.117a1 1 0 00-1.447-.894l-4 2a1 1 0 000 1.788l4 2A1 1 0 009 14.117V13z" />
                        </svg>
                        Import JSON Data
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NEW COMPONENT: Main Mapping Interface ---
const MappingInterface = ({ 
    canvasRef,
    isLoading,
    userId,
    patientName,
    setPatientName,
    patientId,
    setPatientId,
    mappedPoints,
    isDownloading,
    isJsPDFLoaded, // NEW PROP
    handleCanvasClick,
    handleDescriptionChange,
    handleDeletePoint,
    handleDownloadPDF,
    handleDownloadJSON, // NEW
    handleResetMapping
}) => {
    return (
        // Wrapper utama diubah menjadi flex-col untuk menampung header dan footer
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans"> 
            {/* CDN for Tailwind (already present) */}
            <script src="https://cdn.tailwindcss.com"></script>
            {/* HILANGKAN SCRIPT JSPDF DI SINI, DIMUAT DINAMIS OLEH APP UTAMA */}
            
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                .font-sans {
                    font-family: 'Inter', sans-serif;
                }
                .canvas-container {
                    /* Menyesuaikan flex agar konten mengambil sisa ruang */
                    flex: 1; 
                    min-height: 400px;
                    height: 50vh; /* Dikelola oleh flex-1 */
                    margin-bottom: 1rem;
                }
                @media (min-width: 1024px) {
                    .canvas-container {
                        max-height: 100%;
                    }
                }
                `}
            </style>
            
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
            
            {/* --- MAIN CONTENT LAYOUT (FLEX) --- */}
            <div className="flex flex-col lg:flex-row p-4 sm:p-8 flex-1">
                <div className="w-full">
                    {/* 3D Visualization Section (Left/Top) */}
                    <div className="canvas-container bg-white rounded-xl shadow-2xl overflow-hidden p-4">
                        <h2 className="text-2xl font-bold text-teal-700  p-4 lg:p-0">3D Odontogram Mapping </h2>
                        <div className="relative w-full h-full">
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/70 z-10">
                                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-teal-600 font-semibold">Loading 3D Model...</p>
                                </div>
                            )}
                            <br />
                            <br />
                            <canvas 
                                ref={canvasRef} 
                                className="w-full h-full link "
                                onMouseDown={handleCanvasClick}
                                style={{ opacity: isLoading ? 0.5 : 1}}
                            />
                            <div className="absolute top-4 ml-2 bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                                - Click on a Tooth to Mark (Mapping) or Remove.
                                <br /> - Hold right click to move object
                            </div>
                            {/* FOOTER LAMA DIHAPUS DARI SINI */}
                        </div>
                    
                
                    </div>
                    <div className="bg-white rounded-xl shadow-2xl p-4 mb-5">
                        <div className="flex flex-row border-b pb-3 mb-4">
                        <h2 className="w-full sm:w-1/2 mr-2 text-2xl font-bold text-gray-800 ">Odontology Diagnostic Panel</h2>
                        <div className="w-full sm:w-1/2">    {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                                
                                <button 
                                    onClick={handleResetMapping}
                                    className="w-full sm:w-1/3 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-150"
                                >
                                    Reset Mapping
                                </button>

                                {/* Download JSON Button */}
                                <button 
                                    onClick={handleDownloadJSON}
                                    className="w-full sm:w-1/3 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
                                    disabled={isDownloading || mappedPoints.length === 0}
                                >
                                    {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg> */}
                                    Download JSON
                                </button>
                                {/* Download PDF Button */}
                                <button 
                                    onClick={handleDownloadPDF}
                                    className="w-full sm:w-1/3 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
                                    disabled={isDownloading || mappedPoints.length === 0 || !isJsPDFLoaded} // TAMBAHKAN KONDISI ISLOADED
                                >
                                    {/* {isDownloading || !isJsPDFLoaded ? ( // Tampilkan spinner jika masih memuat jsPDF
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                           <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )} */}
                                    {isDownloading || !isJsPDFLoaded ? 'Loading PDF Lib...' : 'Download PDF'}
                                </button>
                            
                        </div></div>
                        </div>
                    
                        <div className="flex flex-col md:flex-row md:gap-4 mb-4">
                            {/* --- PATIENT INPUT --- */}
                            <div className="w-full md:w-1/2">
                                <label
                                htmlFor="patientName"
                                className="block text-sm font-medium text-gray-700"
                                >
                                Patient Name
                                </label>
                                <input
                                type="text"
                                id="patientName"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                style={{ color: "black" }}
                                placeholder="Enter patient name..."
                                />
                            </div>

                            <div className="w-full md:w-1/2 mt-4 md:mt-0">
                                <label
                                htmlFor="patientId"
                                className="block text-sm font-medium text-gray-700"
                                >
                                ID Card / Patient No.
                                </label>
                                <input
                                type="text"
                                id="patientId"
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                style={{ color: "black" }}
                                placeholder="Enter ID card/patient no..."
                                />
                            </div>
                            </div>


                        {/* Mapped Points List */}
                        <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            Diagnostic Points ({mappedPoints.length})
                        </h3>
                        
                        <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                            {mappedPoints.length === 0 ? (
                                <p className="text-gray-500 italic text-sm">No points have been marked yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {mappedPoints.slice().reverse().map((point, index) => (
                                        <li key={point.id} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-500 flex justify-between items-start">
                                            <div className="flex-1">
                                                <span className="font-bold text-lg text-blue-600">{point.toothId}</span>
                                                <span className="font-medium text-gray-800"> - {point.type || 'Marker'} #{mappedPoints.length - index}</span>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Coordinates (X, Y, Z): ({point.x}, {point.y}, {point.z})
                                                </p>
                                                
                                                {/* --- DESCRIPTION TEXTAREA --- */}
                                                <textarea
                                                    value={point.description}
                                                    onChange={(e) => handleDescriptionChange(point.id, e.target.value)}
                                                    maxLength={200}
                                                    className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm text-gray-700 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Add description (max 200 chars)..."
                                                    rows={2}
                                                />
                                            </div>
                                            {/* --- DELETE BUTTON --- */}
                                            <button
                                                onClick={() => handleDeletePoint(point)}
                                                className="ml-2 p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0"
                                                aria-label="Delete point"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                    
                    </div>
                </div>

                {/* Control Panel & Results Section (Right/Bottom) */}
                <div className="lg:w-2/5 lg:pl-8">
                    <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl text-center h-full">
                        <RighSpace ip={userId} />
                        <DevNotes />
                    </div>
                </div>
            </div>
            
            {/* --- FOOTER --- */}
            <footer className="bg-gray-800 text-white p-3 text-center text-xs mt-auto">
                <p>&copy; {new Date().getFullYear()} Jivident 3D | Developed by Jivimz_ | All rights reserved.</p>
                <p className="text-gray-400 mt-1">Session IP: {userId}</p>
            </footer>

        </div>
    );
};


/**
 * Main 3D Odontogram component.
 * Manages application state (mode) and data.
 */
const App = () => {
    // Application State
    const [appMode, setAppMode] = useState('selection'); // 'selection', 'loading', 'mapping'
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isInitialSyncDone, setIsInitialSyncDone] = useState(false); // For post-import sync
    // NEW STATE: Status pemuatan library jsPDF
    const [isJsPDFLoaded, setIsJsPDFLoaded] = useState(false); 

    // Data State
    const [mappedPoints, setMappedPoints] = useState([]);
    const [patientName, setPatientName] = useState('');
    const [patientId, setPatientId] = useState('');
    
    // Refs
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for JSON file input
    
    // --- MODIFICATION: Changed userId to fetch the user's IP ---
    const [userId, setUserId] = useState('Loading IP...');

    // --- T3 FUNCTION: Reset Colors ---
    const resetToothColors = useCallback(() => {
        const uniqueGroups = new Set();
        toothMeshes.forEach(mesh => {
            // Menggunakan default material yang sudah didefinisikan
            if (mesh.material) {
                mesh.material.color.setHex(ORIGINAL_COLOR);
            }
            if (mesh.userData.parentGroup) {
                uniqueGroups.add(mesh.userData.parentGroup);
            }
        });
        uniqueGroups.forEach(group => {
            group.userData.isMapped = false;
            group.userData.markerIds = [];
        });
    }, []);
    
    // --- T3 FUNCTION: Sync State to 3D (Used after Import) ---
    const sync3DViewWithState = useCallback(() => {
        if (!scene) return; // Tambahkan cek keamanan
        
        // console.log("Syncing 3D view with mappedPoints state...");
        
        // 1. Reset scene (marker dan warna)
        // PERBAIKAN: Dapatkan semua ID marker yang ada di scene dan hapus menggunakan helper
        const existingMarkerIds = scene.children
            .filter(c => c.name.startsWith('Marker-'))
            .map(c => c.name.replace('Marker-', ''));
        
        removeMarkersFromScene(existingMarkerIds); // Gunakan helper untuk membersihkan
        resetToothColors();
        
        // 2. Iterate mappedPoints state and apply to 3D
        mappedPoints.forEach(point => {
            const { toothId, id, x, y, z } = point;
            
            // Find the tooth group
            const associatedGroup = toothMeshes.find(
                m => m.userData.parentGroup?.userData.toothId === toothId
            )?.userData.parentGroup;

            if (associatedGroup) {
                // Apply highlight
                associatedGroup.traverse(child => {
                    if (child.isMesh && child.userData.parentGroup === associatedGroup) {
                        child.material.color.setHex(HIGHLIGHT_COLOR);
                    }
                });
                
                // Update group status
                associatedGroup.userData.isMapped = true;
                // Pastikan markerIds diinisialisasi sebagai array sebelum push
                if (!associatedGroup.userData.markerIds) associatedGroup.userData.markerIds = [];
                // Pastikan marker ID tidak diduplikasi sebelum push (penting saat sync)
                if (!associatedGroup.userData.markerIds.includes(id)) {
                    associatedGroup.userData.markerIds.push(id);
                }

                // Create new marker at the saved position
                const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                const markerMaterial = new THREE.MeshBasicMaterial({ color: MARKER_COLOR }); 
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);

                // Menggunakan parseFloat untuk memastikan koordinat adalah angka
                marker.position.set(parseFloat(x), parseFloat(y), parseFloat(z)); 
                marker.name = `Marker-${id}`; // Ganti nama agar unik sesuai ID
                scene.add(marker);
            }
        });
    }, [mappedPoints, resetToothColors]); // Dependencies updated

    // --- T3 FUNCTION: Delete diagnostic point ---
    const handleDeletePoint = useCallback((pointToDelete) => {
        const { toothId, id } = pointToDelete;
        
        // 1. Remove visual marker from scene
        const marker = scene.getObjectByName(`Marker-${id}`);
        if (marker) {
            scene.remove(marker);
            marker.geometry.dispose();
            marker.material.dispose();
        }

        // 2. Remove point from React state
        setMappedPoints(prev => {
            const newPoints = prev.filter(p => p.id !== id);
            
            // Cek apakah gigi ini masih punya titik diagnosa lain
            const isToothStillMapped = newPoints.some(p => p.toothId === toothId);
            
            if (!isToothStillMapped) {
                 // 3. Reset color and status if no other points exist on this tooth
                 const associatedGroup = toothMeshes.find(
                    m => m.userData.parentGroup?.userData.toothId === toothId
                 )?.userData.parentGroup;

                if (associatedGroup) {
                    associatedGroup.traverse(child => {
                        if (child.isMesh && child.userData.parentGroup === associatedGroup) {
                            child.material.color.setHex(ORIGINAL_COLOR);
                        }
                    });
                    associatedGroup.userData.isMapped = false;
                    associatedGroup.userData.markerIds = [];
                }
            }
            return newPoints;
        });
    }, [setMappedPoints]);

    // --- FUNCTION: Update description ---
    const handleDescriptionChange = useCallback((id, newDescription) => {
        if (newDescription.length > 200) return; 
        setMappedPoints(prev => 
            prev.map(p => 
                p.id === id ? { ...p, description: newDescription } : p
            )
        );
    }, [setMappedPoints]);

    // --- FUNCTION: Download PDF ---
    const handleDownloadPDF = useCallback(() => {
        if (!isJsPDFLoaded || typeof window.jspdf === 'undefined') {
            console.error("jsPDF not loaded.");
            return;
        }

        setIsDownloading(true);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4'); 
        
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let y = margin + 10; 

        // 1. Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text("Odontogram Diagnostic Report", pageWidth / 2, y, { align: 'center' });
        y += 10;
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y); // Separator line
        y += 10;

        // 2. Patient Info
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        // Patient Name (Left)
        doc.text(`Patient Name:`, margin, y);
        doc.setFont(undefined, 'bold');
        doc.text(patientName || '(Not set)', margin + 35, y);
        // ID Card (Right)
        doc.setFont(undefined, 'normal');
        doc.text(`ID Card:`, margin + 100, y);
        doc.setFont(undefined, 'bold');
        doc.text(patientId || '(Not set)', margin + 118, y);
        y += 7;
        // Date
        doc.setFont(undefined, 'normal');
        doc.text(`Date Printed: ${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, y);
        y += 10;

        // 3. Report Header
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text("Diagnostic Point Details", margin, y);
        y += 5;
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // 4. Loop Diagnostic Points
        doc.setFontSize(11);
        if (mappedPoints.length === 0) {
            doc.setFont(undefined, 'italic');
            doc.text("No diagnostic points have been marked.", margin, y);
        }

        // Sort points by Tooth ID (ascending)
        const sortedPoints = [...mappedPoints].sort((a, b) => {
            const idA = a.toothId.match(/\d+/) ? parseInt(a.toothId.match(/\d+/)[0]) : a.toothId;
            const idB = b.toothId.match(/\d+/) ? parseInt(b.toothId.match(/\d+/)[0]) : b.toothId;

            if (typeof idA === 'number' && typeof idB === 'number') {
                return idA - idB;
            }
            return String(idA).localeCompare(String(idB));
        });

        sortedPoints.forEach((point, index) => {
            const itemHeader = `Tooth ${point.toothId} (${point.type})`;
            const coords = `Coordinates (X, Y, Z): (${point.x}, ${point.y}, ${point.z})`;
            // Prepare description text
            const descriptionText = point.description || '(No description)';
            const descriptionLines = doc.splitTextToSize(descriptionText, pageWidth - (margin * 2) - 5); // 5mm indent
            
            // Estimate height
            const itemHeight = 6 + 5 + (descriptionLines.length * 5) + 5; // Header + Coords + Desc + Spacing

            // Check if new page is needed
            if (y + itemHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
                doc.setFontSize(10);
                doc.setFont(undefined, 'italic');
                doc.text("...Diagnostic Report Continued", margin, y);
                y += 10;
                doc.setFontSize(11);
                doc.setFont(undefined, 'normal');
            }

            // Write Item Header
            doc.setFont(undefined, 'bold');
            doc.text(itemHeader, margin, y);
            y += 6;

            // Write Coordinates
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80); // Gray
            doc.text(coords, margin + 2, y);
            y += 5;

            // Write Description (with text wrap)
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0); // Black
            doc.text("Description:", margin + 2, y);
            doc.setFont(undefined, 'italic');
            doc.text(descriptionLines, margin + 25, y); // Indent
            
            y += (descriptionLines.length * 5) + 5; // Space between items
            
            doc.setFont(undefined, 'normal');
        });
        
        const date = new Date();
        const formattedDate = date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0") + "_" +
        String(date.getHours()).padStart(2, "0") +
        String(date.getMinutes()).padStart(2, "0") +
        String(date.getSeconds()).padStart(2, "0");

        
        doc.save("Odontogram_Patien_Report-" + (patientName ?? "unknown") + "-" + formattedDate);
        setIsDownloading(false);
    }, [patientName, patientId, mappedPoints, isJsPDFLoaded]); // Tambahkan isJsPDFLoaded ke dependencies
    
    // --- NEW FUNCTION: Download JSON ---
    const handleDownloadJSON = useCallback(() => {
        const data = {
            patientName: patientName,
            patientId: patientId,
            mappedPoints: mappedPoints
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `odontogram_patient_${patientId || 'data'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    }, [patientName, patientId, mappedPoints]);
    
    // --- NEW FUNCTION: Import JSON ---
    const handleImportJSON = useCallback((event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/json') {
            console.warn("Invalid file or not JSON.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const data = JSON.parse(text);
                
                if (data.patientName !== undefined && data.patientId !== undefined && data.mappedPoints !== undefined) {
                    setPatientName(data.patientName);
                    setPatientId(data.patientId);
                    setMappedPoints(data.mappedPoints);
                    
                    // Reset sync status
                    setIsInitialSyncDone(false); 
                    // Switch to loading mode to load 3D
                    setAppMode('loading'); 
                } else {
                    console.warn("Invalid JSON format.");
                }
            } catch (err) {
                console.error("Failed to parse JSON:", err);
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = null;
    }, [setPatientName, setPatientId, setMappedPoints, setAppMode, setIsInitialSyncDone]);

    // --- FUNCTION: Reset Mapping ---
    const handleResetMapping = useCallback(() => {
        // Remove all visual markers
        const markers = scene.children.filter(c => c.name.startsWith('Marker-'));
        markers.forEach(marker => {
            scene.remove(marker);
            marker.geometry.dispose();
            marker.material.dispose();
        });
        
        // Reset all tooth colors
        resetToothColors();

        // Reset state
        setMappedPoints([]);
        // Optional: also reset patient info if 'Reset Mapping' means 'Start Over'
        // setPatientName('');
        // setPatientId('');
    }, [resetToothColors, setMappedPoints]);


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
    
    // --- PERBAIKAN JS PDF: Load jsPDF script dynamically ---
    useEffect(() => {
        if (isJsPDFLoaded) return;
        
        const scriptUrl = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        
        script.onload = () => {
            setIsJsPDFLoaded(true);
            // console.log("jsPDF loaded successfully.");
        };
        
        script.onerror = () => {
            console.error("Failed to load jsPDF script.");
            // Set true untuk menghentikan loop pemuatan
            setIsJsPDFLoaded(true); 
        };
        
        document.head.appendChild(script);

        return () => {
            // Bersihkan script saat komponen di-unmount
            // Hapus script hanya jika kita benar-benar menambahkannya
            const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, [isJsPDFLoaded]); // Bergantung pada status pemuatan jsPDF
    

    // --- EFFECT: Initialization and Model Loading ---
    useEffect(() => {
        // Only run if in 'loading' mode and T3 isn't already init
        if (appMode === 'loading') {
            if (!scene) {
                initThree(canvasRef);
            }
            
            // Set isLoading (spinner)
            setIsLoading(true);
            
            // Load model. This function will setAppMode('mapping') when done.
            loadTeethModel(setIsLoading, setAppMode); 
        }
        
        // Resize Listener
        const handleResize = () => {
            if (camera && renderer && canvasRef.current) {
                const container = canvasRef.current.parentElement;
                if (!container) return; // Add a guard
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            // Don't destroy the scene here, let it persist
        };
    }, [appMode]); // Depends on appMode

    // --- NEW EFFECT: Sync 3D after Import ---
    useEffect(() => {
        // Run ONLY if:
        // 1. Loading is finished
        // 2. We are in mapping mode
        // 3. Initial sync hasn't been done
        // 4. There is data to sync (after import)
        if (!isLoading && appMode === 'mapping' && !isInitialSyncDone && mappedPoints.length > 0) {
            sync3DViewWithState();
            setIsInitialSyncDone(true); // Mark as done
        }
        
        // If we return to mapping mode (e.g., from reset) and there are no points, reset flag
        if (appMode === 'mapping' && mappedPoints.length === 0) {
            setIsInitialSyncDone(false);
        }
        
    }, [isLoading, appMode, mappedPoints, isInitialSyncDone, sync3DViewWithState]);


    // --- Canvas Click Handler (needs useCallback) ---
    const handleCanvasClick = useCallback((event) => {
        if (!isLoading && appMode === 'mapping') {
            onCanvasClick(event, canvasRef, setMappedPoints);
        }
    }, [isLoading, appMode, setMappedPoints]); // setMappedPoints added
    
    // --- Selection Screen Handlers ---
    const handleNewPatient = () => {
        // Reset all data
        setPatientName('');
        setPatientId('');
        setMappedPoints([]);
        setIsInitialSyncDone(false); // Reset sync flag
        setAppMode('loading'); // Start loading T3
    };

    const handleTriggerImport = () => {
        fileInputRef.current?.click(); // Trigger hidden file input
    };


    // --- Render Logic ---
    
    // 1. Render Selection Screen
    if (appMode === 'selection') {
        return (
            <>
                {/* Hidden file input for import */}
                <input 
                    type="file" 
                    accept=".json" 
                    ref={fileInputRef} 
                    onChange={handleImportJSON} 
                    style={{ display: 'none' }} 
                />
                <SelectionScreen 
                    onNewPatient={handleNewPatient} 
                    onTriggerImport={handleTriggerImport} 
                />
            </>
        );
    }
    
    // 2. Render Loading or Mapping Screen
    // (MappingInterface handles its own isLoading state)
    return (
        <MappingInterface
            canvasRef={canvasRef}
            isLoading={isLoading}
            userId={userId}
            patientName={patientName}
            setPatientName={setPatientName}
            patientId={patientId}
            setPatientId={setPatientId}
            mappedPoints={mappedPoints}
            isDownloading={isDownloading}
            isJsPDFLoaded={isJsPDFLoaded} // TERUSKAN PROP STATUS JS PDF
            handleCanvasClick={handleCanvasClick}
            handleDescriptionChange={handleDescriptionChange}
            handleDeletePoint={handleDeletePoint}
            handleDownloadPDF={handleDownloadPDF}
            handleDownloadJSON={handleDownloadJSON}
            handleResetMapping={handleResetMapping}
        />
    );
};

export default App;
