const DevNotes = () => {
  return (
    <div className="w-full max-w-full">/
                        {/* Foto Profil (Placeholder) */}
                        <img
                            src="/jivi.jpg"
                            alt="Foto Pembuat Aplikasi"
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-indigo-100 shadow-xl"
                        />
                        {/* <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {t.dev_note_title}
                        </h3> */}
                        <p className="text-lg font-medium text-gray-700 italic leading-relaxed px-4 sm:px-12">
                            "Currently free for limited time, just use it if needed"
                        </p>
                        <p className="mt-4 text-sm text-indigo-600 font-semibold mb-6">
                            Jivi, Developer
                        </p>

                         <div  className="group relative">
              
              {/* Efek Glow di belakang video saat hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-70 transition duration-500 group-hover:duration-200"></div>
              
              {/* Container Video Utama */}
              <div className="relative rounded-2xl bg-gray-900 ring-1 ring-gray-700 overflow-hidden shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.01]">
                
                    {/* Header Bar ala Window (Opsional - memberi kesan aplikasi) */}
                    <div className="h-8 bg-gray-800/90 border-b border-gray-700 flex items-center px-4 space-x-2 backdrop-blur-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    <span className="ml-2 text-xs text-gray-500 font-mono uppercase tracking-wider">
                        Bisa Pesan Custom/Integrasi seperti ini
                    </span>
                    </div>

                    {/* Wrapper Iframe 16:9 */}
                    <div className="relative w-full aspect-video bg-black">
                    <iframe
                        src="https://www.youtube.com/embed/JMyOongk1vA?controls=0&autoplay=1&mute=1&playsinline=1&loop=1&playlist=JMyOongk1vA"
                        title={`Video 1`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    ></iframe>

                    {/* Overlay Dekoratif (Scanline / Vignette) */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-900/40 to-transparent shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]"></div>
                    
                    {/* Badge "Live Preview" di pojok video */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-white tracking-wide">PREVIEW</span>
                    </div>

                    </div>
                </div>
              </div>

              {/* Dekorasi Geometris di luar kotak */}
              <div className=" -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-xl -z-10"></div>

                        {/* === DONATION BUTTON INTEGRATION === */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col items-center">
                            <style dangerouslySetInnerHTML={{__html: `
                                .pp-PB7D25DMHPSWL{
                                    text-align:center;
                                    border:none;
                                    border-radius:0.25rem;
                                    min-width:11.625rem;
                                    padding:0 2rem;
                                    height:2.625rem;
                                    font-weight:bold;
                                    background-color:#FFD140; /* PayPal Yellow */
                                    color:#000000;
                                    font-family:"Helvetica Neue",Arial,sans-serif;
                                    font-size:1rem;
                                    line-height:1.25rem;
                                    cursor:pointer;
                                    transition: background-color 0.2s;
                                }
                                .pp-PB7D25DMHPSWL:hover {
                                    background-color: #f0c330; /* Slightly darker yellow on hover */
                                }
                            `}} />
                            <form 
                                action="https://www.paypal.com/ncp/payment/PB7D25DMHPSWL" 
                                method="post" 
                                target="_blank" 
                                className="inline-grid justify-items-center align-content-start gap-2"
                            >
                                <input 
                                    className="pp-PB7D25DMHPSWL" 
                                    type="submit" 
                                    value="Support Me Now" 
                                />
                                <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="cards" />
                                <section className="text-xs text-gray-500 flex"> 
                                  
                                   Powered by <img 
                                        src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" 
                                        alt="paypal" 
                                        className="h-4 align-middle ml-1"
                                    />
                                </section>
                            </form>
                        </div>
                        {/* === END DONATION BUTTON INTEGRATION === */}
                   
                {/* --- AKHIR BAGIAN DEVELOPER'S NOTE --- */}
    </div>
  )
}

export default DevNotes