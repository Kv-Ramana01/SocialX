
import React from 'react';
import './SocialHome.css'; 

function SocialHome({ onLogout }) {
  return (
    <div className="home-bg">
      
      {/* { Navbar } */}
      <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
        <div className="container">
          <span className="navbar-brand brand-text fs-3">SocialX</span>
          <button className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={onLogout}>
            Log Out
          </button>
        </div>
      </nav>

      /*Main Layout*/
      <div className="container mt-4">
        <div className="row justify-content-center">
          
          {/* Main Feed Column */}
          <div className="col-md-6">
            
            {/* Create-Post Input */}
            <div className="card post-card mb-4 shadow-sm">
              <div className="card-body">
                <div className="d-flex mb-3">
                  <div className="bg-secondary rounded-circle me-3" style={{width: '45px', height: '45px'}}></div>
                  <input 
                    type="text" 
                    className="form-control rounded-pill input-post" 
                    placeholder="What's happening?" 
                  />
                </div>
                <div className="text-end">
                  <button className="btn btn-primary-custom btn-sm px-4 rounded-pill">Post</button>
                </div>
              </div>
            </div>

            {/* Post1 */}
            <div className="card post-card mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-danger text-white rounded-circle d-flex justify-content-center align-items-center me-3" style={{width: '45px', height: '45px'}}>
                    JD
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-white">John Doe</h6>
                    <small className="text-muted">@johndoe • 2h</small>
                  </div>
                </div>
                <p className="card-text text-light">
                  Just switched to dark mode on the new SocialX dashboard. It looks absolutely 🔥
                </p>
                
                {/* Interaction Icons */}
                <hr style={{ borderColor: '#333' }} />
                <div className="d-flex justify-content-around text-secondary">
                   <span className="icon-btn"><i className="bi bi-heart"></i> Like</span>
                   <span className="icon-btn"><i className="bi bi-chat"></i> Comment</span>
                   <span className="icon-btn"><i className="bi bi-share"></i> Share</span>
                </div>
              </div>
            </div>

             {/* Post2 */}
             <div className="card post-card mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success text-white rounded-circle d-flex justify-content-center align-items-center me-3" style={{width: '45px', height: '45px'}}>
                    JS
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-white">Jane Smith</h6>
                    <small className="text-muted">@janesmith • 5h</small>
                  </div>
                </div>
                <p className="card-text text-light">
                   Working on the backend connectivity today. MERN stack is fun but debugging requires patience! 💻
                </p>
                 <hr style={{ borderColor: '#333' }} />
                <div className="d-flex justify-content-around text-secondary">
                   <span className="icon-btn">Like</span>
                   <span className="icon-btn">Comment</span>
                   <span className="icon-btn">Share</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialHome;