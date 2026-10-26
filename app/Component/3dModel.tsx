"use client";
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Odontogram3D } from '3d-odontogram';
import type { MappedPoint, Odontogram3DHandle, OdontogramTheme, ToothType } from '3d-odontogram';

declare global {
    interface Window {
        jspdf: any;
    }
}
import DevNotes from './devNotes';
import RightSpace from './rightSpace';

// --- Demo theme: proves every color is customizable from the consuming app, not hardcoded in the library ---
const DEMO_THEME: OdontogramTheme = {
    toothColor: 0xf5f5dc, // Ivory
    highlightColor: 0x3b82f6, // Tailwind blue-500
    markerColor: 0xff0000, // Red
    canvasBackground: 0xecf0f1,
    canvasBackgroundOpacity: 0,
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
    odontogramRef: React.RefObject<Odontogram3DHandle | null>;
    isLoading: boolean;
    userId: any;
    toothType: ToothType;
    setToothType: React.Dispatch<React.SetStateAction<ToothType>>;
    patientName: string;
    setPatientName: React.Dispatch<React.SetStateAction<string>>;
    patientId: string;
    setPatientId: React.Dispatch<React.SetStateAction<string>>;
    mappedPoints: MappedPoint[];
    onPointsChange: (points: MappedPoint[]) => void;
    onLoadingChange: (loading: boolean) => void;
    isDownloading: boolean;
    isJsPDFLoaded: boolean;
    handleDescriptionChange: (id: any, newDescription: string) => void;
    handleDeletePoint: (point: any) => void;
    handleDownloadPDF: () => void;
    handleDownloadJSON: () => void;
    handleResetMapping: () => void;
};

const MappingInterface: React.FC<MappingInterfaceProps> = ({
    odontogramRef,
    isLoading,
    userId,

    toothType,
    setToothType,
    patientName,
    setPatientName,
    patientId,
    setPatientId,
    mappedPoints,
    onPointsChange,
    onLoadingChange,
    isDownloading,
    isJsPDFLoaded, // NEW PROP
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
                            <Odontogram3D
                                ref={odontogramRef}
                                toothType={toothType}
                                theme={DEMO_THEME}
                                modelBaseUrl="/assets/bin"
                                className="w-full h-full link"
                                style={{ opacity: isLoading ? 0.5 : 1 }}
                                onPointsChange={onPointsChange}
                                onLoadingChange={onLoadingChange}
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
                                    Download JSON
                                </button>
                                {/* Download PDF Button */}
                                <button
                                    onClick={handleDownloadPDF}
                                    className="w-full sm:w-1/3 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
                                    disabled={isDownloading || mappedPoints.length === 0 || !isJsPDFLoaded} // TAMBAHKAN KONDISI ISLOADED
                                >
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
                                onChange={(e) => setToothType(e.target.value as ToothType)}
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
 * Manages application state (mode) and data. The actual Three.js scene lives inside the
 * `3d-odontogram` package (Odontogram3D) — this component only owns app-level state
 * (patient info, PDF/JSON export, import) and talks to the 3D canvas through its ref handle.
 */
const Load3D = ({userId = null}) => {
    // Application State
    const [appMode, setAppMode] = useState<'selection' | 'mapping'>('selection');
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    // NEW STATE: Status pemuatan library jsPDF
    const [isJsPDFLoaded, setIsJsPDFLoaded] = useState(false);
    // Data State
    const [mappedPoints, setMappedPoints] = useState<MappedPoint[]>([]);
    const [patientName, setPatientName] = useState('');
    const [toothType, setToothType] = useState<ToothType>('child');
    const [patientId, setPatientId] = useState('');

    // Refs
    const odontogramRef = useRef<Odontogram3DHandle>(null);
    // Points waiting to be applied to the 3D canvas once the (re)loaded model finishes loading.
    // A ref (not state) because writing it never needs to trigger a re-render by itself.
    const pendingImportPointsRef = useRef<MappedPoint[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for JSON file input


    // --- FUNCTION: Update description ---
    const handleDescriptionChange = useCallback(
        (id: any, newDescription: string) => {
            if (newDescription.length > 200) return; // batasi 200 karakter
            odontogramRef.current?.updatePoint(id, { description: newDescription });
        },
        []
    );

    // --- FUNCTION: Delete diagnostic point ---
    const handleDeletePoint = useCallback((pointToDelete: { id: number }) => {
        odontogramRef.current?.setMappedPoints(
            mappedPoints.filter((p) => p.id !== pointToDelete.id)
        );
    }, [mappedPoints]);

    // --- FUNCTION: Reset Mapping ---
    const handleResetMapping = useCallback(() => {
        odontogramRef.current?.resetMapping();
    }, []);

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
            const numA = parseInt(a.toothId.match(/\d+/)?.[0] || "0", 10);
            const numB = parseInt(b.toothId.match(/\d+/)?.[0] || "0", 10);

            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }

            // fallback: if not numeric, compare alphabetically
            return a.toothId.localeCompare(b.toothId);
            });


        sortedPoints.forEach((point) => {
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
    }, [patientName, patientId, mappedPoints, toothType, isJsPDFLoaded]);

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
                    setPatientName(data.patientName || '');
                    setPatientId(data.patientId || '');

                    // Points get applied once the (re)loaded model reports isLoading=false.
                    pendingImportPointsRef.current = data.mappedPoints;
                    setToothType((data.toothType as ToothType) ?? 'child');
                    setAppMode('mapping');
                }
            } catch (err) {
                console.error("Failed to parse JSON:", err);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }, []);

    // --- EFFECT: Apply pending import points once the model has finished (re)loading ---
    useEffect(() => {
        if (appMode === 'mapping' && !isLoading && pendingImportPointsRef.current !== null) {
            odontogramRef.current?.setMappedPoints(pendingImportPointsRef.current);
            pendingImportPointsRef.current = null;
        }
    }, [appMode, isLoading]);

    // --- PERBAIKAN JS PDF: Load jsPDF script dynamically ---
    useEffect(() => {
        if (isJsPDFLoaded) return;

        const scriptUrl = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;

        script.onload = () => {
            setIsJsPDFLoaded(true);
        };

        script.onerror = () => {
            console.error("Failed to load jsPDF script.");
            setIsJsPDFLoaded(true);
        };

        document.head.appendChild(script);

        return () => {
            const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, [isJsPDFLoaded]);

    // --- Selection Screen Handlers ---
    const handleNewPatient = () => {
        // Reset all data
        setPatientName('');
        setPatientId('');
        setMappedPoints([]);
        pendingImportPointsRef.current = null;
        setToothType('child');
        setAppMode('mapping');
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

    // 2. Render Mapping Screen (Odontogram3D handles its own loading state internally)
    return (
        <MappingInterface
            odontogramRef={odontogramRef}
            isLoading={isLoading}
            userId={userId}
            toothType={toothType}
            setToothType={setToothType}
            patientName={patientName}
            setPatientName={setPatientName}
            patientId={patientId}
            setPatientId={setPatientId}
            mappedPoints={mappedPoints}
            onPointsChange={setMappedPoints}
            onLoadingChange={setIsLoading}
            isDownloading={isDownloading}
            isJsPDFLoaded={isJsPDFLoaded}
            handleDescriptionChange={handleDescriptionChange}
            handleDeletePoint={handleDeletePoint}
            handleDownloadPDF={handleDownloadPDF}
            handleDownloadJSON={handleDownloadJSON}
            handleResetMapping={handleResetMapping}
        />
    );
};

export default Load3D;
