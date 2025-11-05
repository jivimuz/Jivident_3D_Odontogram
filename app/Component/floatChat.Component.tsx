"use client";

import { useState, FormEvent, useEffect } from "react";

export default function FloatChat() {
  const phoneNumber = "6282120741970";
  const defaultMessage = "Hello";
  const defaultMessage2 = "Do you need any assistance?";

  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const encodedMessage = encodeURIComponent(userMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    setUserMessage("");
    setIsOpen(false);
  };

  const [waktu, setWaktu] = useState("");

  useEffect(() => {
    // Ambil waktu saat komponen di-mount
    const now = new Date();
    // const waktuLalu = new Date(now.getTime() - 5 * 60 * 1000); // 5 menit lalu

    // Format jam:menit
    const jam = String(now.getHours()).padStart(2, "0");
    const menit = String(now.getMinutes()).padStart(2, "0");

    setWaktu(`${jam}:${menit}`);
  }, []);

  return (
    // Gunakan React Fragment agar setiap elemen bisa diposisikan secara independen
    <>
      {/* Jendela Chat - Sekarang punya positioning sendiri */}
      {isOpen && (
        <div
          // Posisi jendela chat kita atur di sini, sedikit di atas tombol float
          className="fixed bottom-[100px] right-5 z-40 w-80 h-[400px] bg-bubble rounded-lg shadow-xl flex flex-col animate-fade-in-up"
        >
          {/* Header Chat */}
          <div className="header bg-black text-white p-3 rounded-t-lg flex justify-between items-center" style={{borderBottomWidth:1, borderBottomColor:"black" }}>
            {/* <h3 className="font-bold text-secondary">Hubungi Kami</h3> */}
            <div className="flex flex-col flex-row  ">
              <div className="flex col ">
                <div className="avatar">
                  <img src="/jivi.jpg" alt="Avatar" />
                </div>
              <div className="flex col avatar-name">Jivi</div>
              </div>
            </div>
            <button onClick={toggleChat} className="text-secondary link">
              <svg
                width="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  opacity="0.4"
                  d="M16.34 1.99976H7.67C4.28 1.99976 2 4.37976 2 7.91976V16.0898C2 19.6198 4.28 21.9998 7.67 21.9998H16.34C19.73 21.9998 22 19.6198 22 16.0898V7.91976C22 4.37976 19.73 1.99976 16.34 1.99976Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M15.0158 13.7703L13.2368 11.9923L15.0148 10.2143C15.3568 9.87326 15.3568 9.31826 15.0148 8.97726C14.6728 8.63326 14.1198 8.63426 13.7778 8.97626L11.9988 10.7543L10.2198 8.97426C9.87782 8.63226 9.32382 8.63426 8.98182 8.97426C8.64082 9.31626 8.64082 9.87126 8.98182 10.2123L10.7618 11.9923L8.98582 13.7673C8.64382 14.1093 8.64382 14.6643 8.98582 15.0043C9.15682 15.1763 9.37982 15.2613 9.60382 15.2613C9.82882 15.2613 10.0518 15.1763 10.2228 15.0053L11.9988 13.2293L13.7788 15.0083C13.9498 15.1793 14.1728 15.2643 14.3968 15.2643C14.6208 15.2643 14.8448 15.1783 15.0158 15.0083C15.3578 14.6663 15.3578 14.1123 15.0158 13.7703Z"
                  fill="currentColor"
                ></path>
              </svg>
            </button>
          </div>

          {/* Body Chat */}
          <div className="body p-4 flex-grow overflow-y-auto animate-slide-up-fade">
            <div
              className="mx-auto  text-center p-1 bg-bubble"
              style={{
                fontSize: "10px",
                width: "120px",
                borderRadius: "50px",
                fontWeight: "bold",
              }}
            >
              2 Unread Message
            </div>

            <div className="flex justify-start">
              <div className="bot-message bg-gray-200 text-gray-800 pl-3  pr-2 pb-1 rounded-lg max-w-[80%]">
                <p>
                  <span className="text-sm">{defaultMessage} &nbsp;</span>
                  <span
                    style={{ fontSize: "10px", marginTop: "10px" }}
                    className="float-end text-[10px] text-gray-500 "
                  >
                    {waktu}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex justify-start pt-1">
              <div className="bot-message bg-gray-200 text-gray-800 pl-3  pr-2 pb-1 rounded-lg max-w-[80%]">
                <p>
                  <span className="text-sm">{defaultMessage2} &nbsp;</span>
                  <span
                    style={{ fontSize: "10px", marginTop: "10px" }}
                    className="float-end text-[10px] text-gray-500 "
                  >
                    {waktu}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer/Input Chat */}
          <div className="footer p-2  border-t border-gray-200 ">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Write your message..."
                className="flex-grow text-primary bg-secondary p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <button
                type="submit"
                className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors link"
              >
                <svg
                  width="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.21433 13.1328L14.0624 8.91355C14.2158 8.81954 14.4122 8.82854 14.5558 8.93955C15.2064 9.44057 15.7877 9.9486 16.1755 10.3756C16.1755 10.3756 16.5096 10.7176 16.6542 10.9346C16.8877 11.2307 17 11.6177 17 11.9937C17 12.4157 16.8769 12.8147 16.6317 13.1338C16.576 13.1908 16.364 13.4418 16.1638 13.6468C14.9954 14.9228 11.9455 17.031 10.3414 17.67C10.1079 17.773 9.48466 17.988 9.16131 18C8.84967 18 8.54879 17.932 8.25962 17.783C7.90403 17.578 7.62561 17.26 7.46931 16.8829C7.36869 16.6209 7.21336 15.8349 7.21336 15.8119C7.11274 15.2509 7.03751 14.4628 7.00039 13.5428C6.99355 13.3778 7.07659 13.2178 7.21433 13.1328Z"
                    fill="currentColor"
                  ></path>
                  <path
                    opacity="0.4"
                    d="M7.67252 10.8603C7.37066 11.0473 6.99064 10.8083 7.00529 10.4493C7.04144 9.60721 7.10396 8.86518 7.18016 8.31315C7.19188 8.30115 7.34721 7.3221 7.52598 6.99108C7.83762 6.37605 8.44916 6.00003 9.10662 6.00003H9.16132C9.5853 6.01103 10.487 6.38705 10.487 6.41005C10.9412 6.59906 11.5342 6.91908 12.1721 7.3041C12.4594 7.47811 12.4662 7.90513 12.179 8.08214L7.67252 10.8603Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) - Tombol Float */}
      <button
        onClick={toggleChat}
        className={`fixed link bottom-5 right-5 z-50 w-16 h-16 ${
          isOpen
            ? "bg-red-800 hover:bg-red-600"
            : "bg-green-600 hover:bg-green-700"
        } text-white rounded-full shadow-lg flex items-center justify-center  transition-transform transform hover:scale-110`}
        aria-label="Buka Chat"
      >
        {isOpen ? (
          <svg
            width="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.4"
              d="M22 12C22 17.515 17.514 22 12 22C6.486 22 2 17.515 2 12C2 6.486 6.486 2 12 2C17.514 2 22 6.486 22 12Z"
              fill="currentColor"
            ></path>
            <path
              d="M16.2211 10.5575C16.2211 10.7485 16.1481 10.9405 16.0021 11.0865L12.5321 14.5735C12.3911 14.7145 12.2001 14.7935 12.0001 14.7935C11.8011 14.7935 11.6101 14.7145 11.4691 14.5735L7.99707 11.0865C7.70507 10.7935 7.70507 10.3195 7.99907 10.0265C8.29307 9.73448 8.76807 9.73548 9.06007 10.0285L12.0001 12.9815L14.9401 10.0285C15.2321 9.73548 15.7061 9.73448 16.0001 10.0265C16.1481 10.1725 16.2211 10.3655 16.2211 10.5575Z"
              fill="currentColor"
            ></path>
          </svg>
        ) : (
          <svg
            width="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.4"
              d="M12.02 2C6.21 2 2 6.74 2 12C2 13.68 2.49 15.41 3.35 16.99C3.51 17.25 3.53 17.58 3.42 17.89L2.75 20.13C2.6 20.67 3.06 21.07 3.57 20.91L5.59 20.31C6.14 20.13 6.57 20.36 7.081 20.67C8.541 21.53 10.36 21.97 12 21.97C16.96 21.97 22 18.14 22 11.97C22 6.65 17.7 2 12.02 2Z"
              fill="currentColor"
            ></path>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.9807 13.2901C11.2707 13.2801 10.7007 12.7101 10.7007 12.0001C10.7007 11.3001 11.2807 10.7201 11.9807 10.7301C12.6907 10.7301 13.2607 11.3001 13.2607 12.0101C13.2607 12.7101 12.6907 13.2901 11.9807 13.2901ZM7.37033 13.2901C6.67033 13.2901 6.09033 12.7101 6.09033 12.0101C6.09033 11.3001 6.66033 10.7301 7.37033 10.7301C8.08033 10.7301 8.65033 11.3001 8.65033 12.0101C8.65033 12.7101 8.08033 13.2801 7.37033 13.2901ZM15.3105 12.0101C15.3105 12.7101 15.8805 13.2901 16.5905 13.2901C17.3005 13.2901 17.8705 12.7101 17.8705 12.0101C17.8705 11.3001 17.3005 10.7301 16.5905 10.7301C15.8805 10.7301 15.3105 11.3001 15.3105 12.0101Z"
              fill="currentColor"
            ></path>
          </svg>
        )}
      </button>
      {isOpen ? (
        <style>{`.page-btn { display: none !important; }`}</style>
      ) : (
        <style>{`.page-btn { display: flex !important; }`}</style>
      )}
    </>
  );
}
