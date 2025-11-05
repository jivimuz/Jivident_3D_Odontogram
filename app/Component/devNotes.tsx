const DevNotes = () => {
  return (
    <>
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
            </>
  )
}

export default DevNotes