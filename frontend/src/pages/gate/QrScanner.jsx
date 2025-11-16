// // frontend/src/pages/gate/QrScanner.jsx
// import React, { useEffect, useState } from 'react';
// import { Html5QrcodeScanner } from 'html5-qrcode';
// import { checkIn } from '../../services/api'; // Use the same check-in function

// function QrScanner() {
//   const [scanResult, setScanResult] = useState(null);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     // Create a new scanner
//     const scanner = new Html5QrcodeScanner(
//       'qr-reader', // The ID of the div to render the scanner in
//       {
//         qrbox: { width: 250, height: 250 }, // The size of the scan box
//         fps: 10, // Frames per second
//       },
//       false // verbose
//     );

//     // This function runs when a QR is successfully scanned
//     const onScanSuccess = async (decodedText, decodedResult) => {
//       scanner.clear(); // Stop the camera
//       setScanResult(decodedText); // Show what we scanned
      
//       try {
//         // --- Call the Check-In API ---
//         const result = await checkIn(decodedText);
//         setSuccess(`Success: ${result.booking_id_str} checked in.`);
//         setError('');
//       } catch (err) {
//         setError(err.response?.data?.detail || 'Check-in failed.');
//         setSuccess('');
//       }
//     };

//     const onScanFailure = (error) => {
//       // (This runs every frame, so don't log it)
//     };

//     // Start scanning
//     scanner.render(onScanSuccess, onScanFailure);

//     // Cleanup function to stop the camera when we leave the page
//     return () => {
//       scanner.clear().catch(err => {
//         console.error("Failed to clear scanner:", err);
//       });
//     };
//   }, []);

//   return (
//     <div>
//       <div className="page-header">
//         <h1>Scan QR Code</h1>
//       </div>
      
//       {/* This is where the camera feed will appear */}
//       <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
      
//       {/* Show results */}
//       {error && <div className="alert-error" style={{marginTop: '1rem'}}>{error}</div>}
//       {success && <div className="alert-success" style={{marginTop: '1rem'}}>{success}</div>}
//       {scanResult && <p style={{textAlign: 'center'}}>Last Scan: {scanResult}</p>}
//     </div>
//   );
// }

// export default QrScanner;


// frontend/src/pages/gate/QrScanner.jsx
import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { checkIn } from '../../services/api'; // Use the same check-in function

function QrScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader', 
      {
        qrbox: { width: 250, height: 250 }, 
        fps: 10,
      },
      false 
    );

    const onScanSuccess = async (decodedText, decodedResult) => {
      scanner.clear(); 
      setScanResult(decodedText); 
      
      try {
        const result = await checkIn(decodedText);
        setSuccess(`Success: ${result.booking_id_str} checked in.`);
        setError('');
      } catch (err) {
        setError(err.response?.data?.detail || 'Check-in failed.');
        setSuccess('');
      }
    };

    const onScanFailure = (error) => {
      // (This runs every frame, so don't log it)
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(err => {
        console.error("Failed to clear scanner:", err);
      });
    };
  }, []);

  // 
  // --- THIS IS THE UPDATED JSX (HTML) ---
  //
  return (
    // This is the new main wrapper
    <div className="scanner-page-container">
      <div className="page-header">
        <h1>Scan QR Code</h1>
      </div>

      {/* This new wrapper will create the dark box around the scanner */}
      <div className="scanner-viewfinder-wrapper">
        
        {/* This is your existing div where the camera appears */}
        <div id="qr-reader"></div>
        
        <p className="scan-prompt">Position the QR code inside the frame</p>
      </div>
      
      {/* This new wrapper groups the result messages */}
      <div className="scan-results">
        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}
        {scanResult && <p className="last-scan-result">Last Scan: {scanResult}</p>}
      </div>
    </div>
  );
}

export default QrScanner;