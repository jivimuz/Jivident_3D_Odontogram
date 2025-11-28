"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Using GLTFLoader

declare global {
    interface Window {
        jspdf: any;
    }
}
import DevNotes from './devNotes';
import RightSpace from './rightSpace';

// --- Three.js Global Variables ---
let scene: THREE.Scene<THREE.Object3DEventMap>, camera: THREE.Camera, renderer: THREE.WebGLRenderer, toothMeshes: THREE.Object3D<THREE.Object3DEventMap>[] = [], raycaster: THREE.Raycaster, pointer: THREE.Vector2, controls: OrbitControls;

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
const TOOTH_MESH_NAME_MAP_CHILD: { [key: string]: string } = {
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
    'P_0': '(Right Bottom) Central',
    'Q_0': '(Right Bottom) Lateral',
    'R_0': '(Right Bottom) Canine',
    'S_0': '(Right Bottom) Premolar',
    'T_0': '(Right Bottom) Molar',
};

const TOOTH_MESH_NAME_MAP_ADULT: { [key: string]: string } = {
        // --- Rahang Atas Kanan (Quadrant 1) ---
        "Box023_01_-_Default_0": "11 (Right Top) Central Incisor",
        "Box024_01_-_Default_0": "12 (Right Top) Lateral Incisor",
        "Box025_01_-_Default_0": "13 (Right Top) Canine",
        "Box031_01_-_Default_0": "14 (Right Top) First Premolar",
        "Box033_01_-_Default_0": "15 (Right Top) Second Premolar",
        "Box032_01_-_Default_0": "16 (Right Top) First Molar",
        "Box035_01_-_Default_0": "17 (Right Top) Second Molar",
        "Box034_01_-_Default_0": "18 (Right Top) Third Molar",

        // --- Rahang Atas Kiri (Quadrant 2) ---
        "Box020_01_-_Default_0": "21 (Left Top) Central Incisor",
        "Box021_01_-_Default_0": "22 (Left Top) Lateral Incisor",
        "Box022_01_-_Default_0": "23 (Left Top) Canine",
        "Box026_01_-_Default_0": "24 (Left Top) First Premolar",
        "Box028_01_-_Default_0": "25 (Left Top) Second Premolar",
        "Box027_01_-_Default_0": "26 (Left Top) First Molar",
        "Box030_01_-_Default_0": "27 (Left Top) Second Molar",
        "Box029_01_-_Default_0": "28 (Left Top) Third Molar",

        // --- Rahang Bawah Kiri (Quadrant 3) ---
        "Box011_01_-_Default_0": "38 (Left Bottom) Third Molar",
        "Box013_01_-_Default_0": "37 (Left Bottom) Second Molar",
        "Box008_01_-_Default_0": "36 (Left Bottom) First Molar",
        "Box009_01_-_Default_0": "35 (Left Bottom) Second Premolar",
        "Box007_01_-_Default_0": "34 (Left Bottom) First Premolar",
        "Box003_01_-_Default_0": "33 (Left Bottom) Canine",
        "Box002_01_-_Default_0": "32 (Left Bottom) Lateral Incisor",
        "Box001_01_-_Default_0": "31 (Left Bottom) Central Incisor",

        // --- Rahang Bawah Kanan (Quadrant 4) ---
        "Box004_01_-_Default_0": "41 (Right Bottom) Central Incisor",
        "Box005_01_-_Default_0": "42 (Right Bottom) Lateral Incisor",
        "Box006_01_-_Default_0": "43 (Right Bottom) Canine",
        "Box015_01_-_Default_0": "44 (Right Bottom) First Premolar",
        "Box017_01_-_Default_0": "45 (Right Bottom) Second Premolar",
        "Box016_01_-_Default_0": "46 (Right Bottom) First Molar",
        "Box019_01_-_Default_0": "47 (Right Bottom) Second Molar",
        "GeoSphere001_01_-_Default_0": "48 (Right Bottom) Third Molar",

        // --- Lain-lain ---
        "Tube002_07_-_Default_0": "(Top Tube) Gums Maxilla",
        "Tube001_07_-_Default_0": "(Bottom Tube) Gums Mandibula",
        "lingua_02_-_Default_0": "(Tongue) Lingua",
    };


/**
 * Function to load the 3D model using GLTFLoader.
 * CHANGE: Hybrid mapping. All meshes are clickable, but names are pulled from the map if available.
 */
async function loadTeethModel(setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, setAppMode: React.Dispatch<React.SetStateAction<string>>, toothType: string) {
    // 1. Bersihkan Scene Lama
    const oldArchGroup = scene?.getObjectByName("ArchGroup") ?? false;
    if (oldArchGroup) {
        scene.remove(oldArchGroup);
        oldArchGroup.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach((material: THREE.Material) => material.dispose());
                } else {
                    (child.material as THREE.Material).dispose();
                }
            }
        });
    }
    
    toothMeshes = []; // Reset array raycaster
    
    const loader = new GLTFLoader();
    // Tentukan URL berdasarkan tipe
    const GLB_URL = toothType === "child" || !toothType ? '/assets/bin/ip1.bin.gz' : '/assets/bin/ip3.bin.gz'; 

    try {
        const gltf = await loader.loadAsync(GLB_URL);
        const loadedModel = gltf.scene;
        
        // Posisi standar
        loadedModel.scale.set(1.0, 1.0, 1.0); 
        loadedModel.position.set(0, -2, 0); 
        loadedModel.rotation.set(0, 0, 0); 
        loadedModel.name = "ArchGroup"; 
        
        loadedModel.traverse(child => {
            if (child instanceof THREE.Mesh) {
                
                // --- FIX 1: MASALAH WARNA ADULT (HITAM) ---
                // Hitung normal agar bereaksi terhadap cahaya
                child.geometry.computeVertexNormals(); 
                // Hapus atribut warna bawaan agar material Ivory kita yang tampil
                if (child.geometry.attributes.color) {
                    child.geometry.deleteAttribute('color');
                }

                // --- FIX 2: MASALAH KLIK HILANG (LOGIKA TARGET) ---
                // Cek nama di MAP Child atau Adult
                const mapToUse = (toothType === "child" || !toothType) ? TOOTH_MESH_NAME_MAP_CHILD : TOOTH_MESH_NAME_MAP_ADULT;
                
                // Skenario A: Nama gigi ada di Mesh ini langsung (Umum di model Adult/Box...)
                let mappedName = mapToUse[child.name];
                let targetObject = child;

                // Skenario B: Jika tidak ketemu, cek Parent-nya (Umum di model Child/Group)
                if (!mappedName && child.parent && child.parent.type !== 'Scene') {
                    if (mapToUse[child.parent.name]) {
                        mappedName = mapToUse[child.parent.name];
                        targetObject = child.parent as THREE.Mesh; // Cast as Object3D/Mesh
                    }
                }

                // Terapkan Material
                const singleMaterial = defaultToothMaterial.clone();
                child.material = singleMaterial;

                // Setup UserData untuk Raycaster
                // Kita hanya setup jika belum di-setup (untuk menghindari overwrite jika parent dishare)
                if (!targetObject.userData.isTooth) {
                    targetObject.userData = {
                        // Gunakan nama mapping jika ada, jika tidak gunakan nama asli mesh sebagai fallback
                        toothId: mappedName ? mappedName : child.name, 
                        isTooth: true, 
                        isMapped: false, 
                        markerIds: [],
                        originalColor: ORIGINAL_COLOR
                    };
                }
                
                // PENTING: Link-kan mesh fisik ke objek logika (targetObject)
                child.userData.parentGroup = targetObject; 
                
                // Masukkan ke array yang dicek oleh Raycaster
                toothMeshes.push(child); 
            }
        });

        scene.add(loadedModel);
        setIsLoading(false);
        setAppMode('mapping'); 

    } catch (error) {
        console.error(`Failed to load model at ${GLB_URL}:`, error);
        setIsLoading(false);
    }
}


/**
 * Function to initialize the Three.js scene. (Only run once)
 */
function initThree(canvasRef: React.RefObject<HTMLCanvasElement>) {
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
const removeMarkersFromScene = (markerIds: any[]) => {
    markerIds.forEach((id: any) => {
        const marker = scene.getObjectByName(`Marker-${id}`);
        if (marker) {
            scene.remove(marker);
            // Clean up geometry and material to prevent memory leaks
            if (marker instanceof THREE.Mesh) {
                if (marker instanceof THREE.Mesh) {
                    marker.geometry.dispose();
                    marker.material.dispose();
                }
            }
        }
    });
};

/**
 * Function to handle clicks on the tooth model (Mapping) with toggle functionality.
 */
interface MappedPoint {
    id: number;
    toothId: string;
    x: string;
    y: string;
    z: string;
    type: string;
    description?: string;
}
const onCanvasClick = (
    event: { clientX: number; clientY: number; },
    canvasRef: React.RefObject<HTMLCanvasElement>,
    setMappedPoints: React.Dispatch<React.SetStateAction<MappedPoint[]>>
) => {
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
            toothGroup.traverse((child: { isMesh: any; userData: { parentGroup: any; }; material: { color: { setHex: (arg0: number) => void; }; }; }) => {
                if (child.isMesh && child.userData.parentGroup === toothGroup) {
                    child.material.color.setHex(ORIGINAL_COLOR);
                }
            });
            
            toothGroup.userData.isMapped = false;
            toothGroup.userData.markerIds = []; // Reset marker IDs

            // Remove point from React state
            setMappedPoints((prevPoints: any[]) => prevPoints.filter((p: { toothId: any; }) => p.toothId !== toothId));
            
        } else {
            // --- ADD (Toggle ON) ---
            const newMarkerId = Date.now();

            // Mark Clicked Tooth (Highlight)
            toothGroup.traverse((child: { isMesh: any; userData: { parentGroup: any; }; material: { color: { setHex: (arg0: number) => void; }; }; }) => {
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
            setMappedPoints((prevPoints: any) => [
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
type SelectionScreenProps = {
    onNewPatient: () => void;
    onTriggerImport: () => void;
};

const SelectionScreen: React.FC<SelectionScreenProps> = ({ onNewPatient, onTriggerImport }) => {
    return (
        <div className="bg-gray-50 flex items-center justify-center p-8 font-sans" style={{minHeight:"95vh"}}>
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
type MappingInterfaceProps = {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    isLoading: boolean;
    userId: any;
    toothType: string;
    setToothType: React.Dispatch<React.SetStateAction<string>>;
    patientName: string;
    setPatientName: React.Dispatch<React.SetStateAction<string>>;
    patientId: string;
    setPatientId: React.Dispatch<React.SetStateAction<string>>;
    mappedPoints: any[];
    isDownloading: boolean;
    isJsPDFLoaded: boolean;
    handleCanvasClick: (event: any) => void;
    handleDescriptionChange: (id: any, newDescription: string) => void;
    handleDeletePoint: (point: any) => void;
    handleDownloadPDF: () => void;
    handleDownloadJSON: () => void;
    handleResetMapping: () => void;
};

const MappingInterface: React.FC<MappingInterfaceProps> = ({ 
    canvasRef,
    isLoading,
    userId,
    
    toothType,
    setToothType,
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
          
            {/* --- MAIN CONTENT LAYOUT (FLEX) --- */}
            <div className="flex flex-col lg:flex-row p-4 sm:p-8 flex-1">
                <div className="w-full">
                    {/* 3D Visualization Section (Left/Top) */}
                    <div className="canvas-container bg-white rounded-xl shadow-2xl overflow-hidden p-4">
                        <h2 className="text-2xl font-bold text-teal-700  p-4 lg:p-0">Free 3D Odontogram Mapping </h2>
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
                            <div className="absolute bottom-10 right-5  text-gray-400 text-xs font-semibold px-3 py-1 ">
                                Jivident 3D
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
                            {/* --- TOOTH TYPE SELECT --- */}
                            <div className="w-full md:w-1/2">
                            <label
                                htmlFor="toothType"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Tooth Type
                            </label>
                            <select
                                id="toothType"
                               value={toothType}
                                onChange={(e) => setToothType(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                style={{ color: "black" }}
                            >
                                <option value="child">Child (20)</option>
                                <option value="adult">Adult (32)</option>
                            </select>
                            </div>

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
                                    {mappedPoints.slice().reverse().map((point: { id: React.Key | null | undefined; toothId: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; type: any; x: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; y: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; z: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; description: string | number | readonly string[] | undefined; }, index: number) => (
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
                        <RightSpace/>
                        <DevNotes />
                    </div>
                </div>
            </div>
            
          

        </div>
    );
};


/**
 * Main 3D Odontogram component.
 * Manages application state (mode) and data.
 */
const Load3D = ({userId = null}) => {
    // Application State
    const [appMode, setAppMode] = useState('selection'); // 'selection', 'loading', 'mapping'
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isInitialSyncDone, setIsInitialSyncDone] = useState(false); // For post-import sync
    // NEW STATE: Status pemuatan library jsPDF
    const [isJsPDFLoaded, setIsJsPDFLoaded] = useState(false); 
    // Data State
    interface MappedPoint {
        id: number;
        toothId: string;
        x: string;
        y: string;
        z: string;
        type: string;
        description?: string;
    }
    const [mappedPoints, setMappedPoints] = useState<MappedPoint[]>([]);
    const [patientName, setPatientName] = useState('');
    const [toothType, setToothType] = useState('');
    const [LastToothType, setLastToothType] = useState('');
    const [patientId, setPatientId] = useState('');
    
    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null) as React.RefObject<HTMLCanvasElement>;
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for JSON file input
    

    // --- T3 FUNCTION: Reset Colors ---
    const resetToothColors = useCallback(() => {
        const uniqueGroups = new Set<THREE.Object3D>();
        toothMeshes.forEach(mesh => {
            // Menggunakan default material yang sudah didefinisikan
            if (mesh instanceof THREE.Mesh && mesh.material) {
                mesh.material.color.setHex(ORIGINAL_COLOR);
            }
            if (mesh.userData.parentGroup) {
                uniqueGroups.add(mesh.userData.parentGroup);
            }
        });
        uniqueGroups.forEach((group: THREE.Object3D) => {
            if (group.userData) {
                group.userData.isMapped = false;
                group.userData.markerIds = [];
            }
        });
    }, []);
    
    // --- T3 FUNCTION: Sync State to 3D (Used after Import) ---
    const sync3DViewWithState = useCallback(() => {
        if (!scene) return; // Tambahkan cek keamanan
        
        // console.log("Syncing 3D view with mappedPoints state...");
        
        // 1. Reset scene (marker dan warna)
        // PERBAIKAN: Dapatkan semua ID marker yang ada di scene dan hapus menggunakan helper
        const existingMarkerIds = scene.children
            .filter((c: { name: string; }) => c.name.startsWith('Marker-'))
            .map((c: { name: string; }) => c.name.replace('Marker-', ''));
        
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
                associatedGroup.traverse((child: { isMesh: any; userData: { parentGroup: any; }; material: { color: { setHex: (arg0: number) => void; }; }; }) => {
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
    const handleDeletePoint = useCallback((pointToDelete: { toothId: any; id: any; }) => {
        const { toothId, id } = pointToDelete;
        
        // 1. Remove visual marker from scene
        const marker = scene.getObjectByName(`${id}`);
        if (marker) {
            scene.remove(marker);
              if (marker instanceof THREE.Mesh) {
                marker.geometry.dispose();
                marker.material.dispose();
            }
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
                    associatedGroup.traverse((child: { isMesh: any; userData: { parentGroup: any; }; material: { color: { setHex: (arg0: number) => void; }; }; }) => {
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
        const handleDescriptionChange = useCallback(
            (id: any, newDescription: string) => {
                if (newDescription.length > 200) return; // batasi 200 karakter
                setMappedPoints(prev =>
                    prev.map(p =>
                        p.id === id ? { ...p, description: newDescription } : p
                    )
                );
            },
            [setMappedPoints]
            );


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
        doc.text(`Date Printed: ${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, y);
        y += 10;
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
         doc.setFont(undefined, 'normal');
        doc.text(`Tooth Type:`, margin , y);
        doc.setFont(undefined, 'bold');
        doc.text(toothType || '(Not set)', margin + 35, y);
        y += 7;
        // Date
       

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
       // Sort points by Tooth ID (ascending)
            const sortedPoints = [...mappedPoints].sort((a, b) => {
            const numA = parseInt(a.toothId.match(/\d+/)?.[0] || "0", 10);
            const numB = parseInt(b.toothId.match(/\d+/)?.[0] || "0", 10);

            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }

            // fallback: if not numeric, compare alphabetically
            return a.toothId.localeCompare(b.toothId);
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
            toothType: toothType,
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
        
    }, [toothType,patientName, patientId, mappedPoints]);
    
    // --- NEW FUNCTION: Import JSON ---
    const handleImportJSON = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || file.type !== 'application/json') return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (!text || typeof text !== "string") return;

                const data = JSON.parse(text);

                if (data.mappedPoints) { // Cek validasi sederhana
                    // 1. SET FLAG IMPORT TRUE

                    setPatientName(data.patientName || '');
                    setPatientId(data.patientId || '');
                    setMappedPoints(data.mappedPoints);

                    // 2. UPDATE TOOTH TYPE
                    const importedType = data.toothType ?? 'child';
                    
                    // Jika tipe sama, kita harus load ulang manual agar poin tergambar
                        // Force reload scene jika tipe tidak berubah tapi data baru masuk
                        setAppMode("loading");

                    setLastToothType(importedType);
                    setToothType(importedType);
                    
                    // Reset sync status agar poin digambar ulang
                    setIsInitialSyncDone(false);
                    if(appMode !== "loading") setAppMode("loading");
                }
            } catch (err) {
                console.error("Failed to parse JSON:", err);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }, [toothType, setToothType, setPatientName, setPatientId, setMappedPoints, setAppMode]);
    // --- FUNCTION: Reset Mapping ---
    const handleResetMapping = useCallback(() => {
        // Remove all visual markers
        const markers = scene.children.filter((c: { name: string; }) => c.name.startsWith('Marker-'));
            markers.forEach((marker) => {
            scene.remove(marker);

            if ((marker as any).geometry) {
                (marker as any).geometry.dispose?.();
            }

            if ((marker as any).material) {
                // Material bisa array (misal multi-material)
                const mat = (marker as any).material;
                if (Array.isArray(mat)) {
                mat.forEach((m) => m.dispose?.());
                } else {
                mat.dispose?.();
                }
            }
        });

        
        // Reset all tooth colors
        resetToothColors();

        // Reset state
        setMappedPoints([]);
        // Optional: also reset patient info if 'Reset Mapping' means 'Start Over'
        // setPatientName('');
        // setPatientId('');
    }, [resetToothColors, setMappedPoints]);


  
    
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
          if (!scene) {
                initThree(canvasRef);
            }
            
        // if (appMode === 'loading') {
          
        //     // Set isLoading (spinner)
        //     setIsLoading(true);
            
        //     // Load model. This function will setAppMode('mapping') when done.
        //     loadTeethModel(setIsLoading, setAppMode, toothType ?? null); 
        // }
        
        // Resize Listener
        const handleResize = () => {
          if (camera && renderer && canvasRef.current) {
            const container = canvasRef.current.parentElement;
            if (!container) return;

            const { clientWidth, clientHeight } = container;
            if (clientWidth === 0 || clientHeight === 0) return;

            // pastikan tipe camera-nya sesuai
            if (camera instanceof THREE.PerspectiveCamera) {
                camera.aspect = clientWidth / clientHeight;
                camera.updateProjectionMatrix();
            }

            renderer.setSize(clientWidth, clientHeight, false);
            renderer.setPixelRatio(window.devicePixelRatio);
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            // Don't destroy the scene here, let it persist
        };
    }, [appMode]); // Depends on appMode

useEffect(() => {
        if(scene){
            // Selalu load model baru jika toothType berubah
            setIsLoading(true);
            loadTeethModel(setIsLoading, setAppMode, toothType ?? null); 
            
            if(LastToothType != toothType){
                setLastToothType(toothType);

                    handleResetMapping();
            }
        }
    }, [toothType]);
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
    const handleCanvasClick = useCallback((event: any) => {
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
        setToothType('child');
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
            toothType={toothType}
            setToothType={setToothType}
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

export default Load3D;
function handleResetMapping() {
    throw new Error('Function not implemented.');
}

