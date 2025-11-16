// // // frontend/src/pages/public/Welcome.jsx
// // import React from 'react';
// // import { Link } from 'react-router-dom';

// // function Welcome() {
// //   return (
// //     <div className="welcome-page">
// //       <h1>Welcome to Smart Parking</h1>
// //       <p>The easiest way to find, book, and pay for parking.</p>
// //       <div className="welcome-buttons">
// //         <Link to="/login" className="welcome-button primary">Login</Link>
// //         <Link to="/register" className="welcome-button secondary">Sign Up</Link>
// //       </div>
// //     </div>
// //   );
// // }
// // export default Welcome;

// // frontend/src/pages/public/Welcome.jsx
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Car, LogIn, UserPlus } from 'lucide-react';

// function Welcome() {
//   return (
//     <div className="welcome-page">
//       {/* --- Left Section --- */}
//       <div className="welcome-content">
//         <div className="welcome-logo">
//           <Car size={38} className="logo-icon" />
//           <h1>
//             <span className="smart">Smart</span>
//             <span className="park">Park</span>
//           </h1>
//         </div>

//         <h2>Welcome to Smart Parking</h2>
//         <p>
//           Discover a smarter way to find, reserve, and pay for parking — fast, secure, and effortless.
//         </p>

//         <div className="welcome-buttons">
//           <Link to="/login" className="welcome-button primary">
//             <LogIn size={18} /> &nbsp; Login
//           </Link>
//           <Link to="/register" className="welcome-button secondary">
//             <UserPlus size={18} /> &nbsp; Sign Up
//           </Link>
//         </div>
//       </div>

//       {/* --- Right Section --- */}
//       <div className="welcome-illustration">
//         <img
//           src="https://cdn.dribbble.com/users/1162077/screenshots/3848914/media/7ed7c1c66c4b5950c4dd08e5cbf3f994.png"
//           alt="Smart parking illustration"
//           loading="lazy"
//         />
//       </div>
//     </div>
//   );
// }

// export default Welcome;

// frontend/src/pages/public/Welcome.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Car, LogIn, UserPlus } from 'lucide-react'; // Import icons

function Welcome() {
  return (
    // This .welcome-page IS the white content box
    <div className="welcome-page">
      {/* --- Left Section --- */}
      <div className="welcome-content">
        <div className="welcome-logo">
          <Car size={38} className="logo-icon" />
          <h1>
            <span className="smart">Smart</span>
            <span className="park">Park</span>
          </h1>
        </div>

        <h2>Welcome to Smart Parking</h2>
        <p>
          Discover a smarter way to find, reserve, and pay for parking — fast, secure, and effortless.
        </p>

        <div className="welcome-buttons">
          <Link to="/login" className="welcome-button primary">
            <LogIn size={18} /> &nbsp; Login
          </Link>
          <Link to="/register" className="welcome-button secondary">
            <UserPlus size={18} /> &nbsp; Sign Up
          </Link>
        </div>
      </div>

      {/* --- Right Section (Illustration) --- */}
      <div className="welcome-illustration">
        <img
          src="https://images.unsplash.com/photo-1590674899484-c529f064b09e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NTI5Mjh8MHwxfHNlYXJjaHwxfHxwYXJraW5nJTIwYXBwJTIwaWxsdXN0cmF0aW9ufGVufDB8fHx8MTczE3OTA5Njd8MA&ixlib=rb-4.0.3&q=80&w=1080"
          alt="Smart parking illustration"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/460x300/e0e0e0/666?text=Parking+App"; }}
        />
      </div>
    </div>
  );
}

export default Welcome;