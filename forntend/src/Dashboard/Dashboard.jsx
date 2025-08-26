import { useContext } from "react";
import { AuthContext } from "../AuthenContext/AuthContext";
import "../Styles/dashboard.css";
import GoogleMapComponent from "./GoogleMapComponent";

const Dashboard = () => {
  const { setToken } = useContext(AuthContext);

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>SMS</h2>
        <ul>
          <li>Dashboard</li>
          <li>Student</li>
          <li>Teacher</li>
          <li>Fees Management</li>
          <li>Eaxm</li>
          <li>Academic</li>
          <li>Library</li>
          <li>Setting</li>
          <li onClick={handleLogout} className="logout">
            Logout
          </li>
        </ul>
      </div>
        {/* //main contain */}

      <div className="main-content">
        <h1>Dashboard</h1>

        <div className="stats">
          <div className="card blue"> Total Student:3291</div>
          <div className="card purple">Teachers:119</div>
          <div className="card green">Classes:76</div>
        </div>

        <GoogleMapComponent/>

        {/* <div className="calendar-section">
          <h3>August 2025</h3>
          <p>[calender placeholder]</p>
        </div> */}

        <div className="events-section">
          <h3>Upcoming Events</h3>
          <p>Holy Mass for Catholic Students & Staff - 1/8/2025</p>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
