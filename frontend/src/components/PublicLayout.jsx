// // frontend/src/components/PublicLayout.jsx
// import React from 'react';
// import { Outlet } from 'react-router-dom';

// function PublicLayout() {
//   return (
//     <div className="public-layout-container">
//       <div className="public-content-box">
//         {/* All public pages (Welcome, Login) will render here */}
//         <Outlet />
//       </div>
//     </div>
//   );
// }

// export default PublicLayout;

// frontend/src/components/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

function PublicLayout() {
  return (
    <div className="public-layout-container">
      {/* This div is the full-page hero background.
        The <Outlet> will render EITHER the <Welcome /> page
        OR the <Login /> / <Registration /> form.
        
        The white content box (like .welcome-page or .form-box)
        is now defined INSIDE those child pages, not here.
      */}
      <Outlet />
    </div>
  );
}

export default PublicLayout;