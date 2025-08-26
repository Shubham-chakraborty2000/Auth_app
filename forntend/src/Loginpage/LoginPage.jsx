import  { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthenContext/AuthContext";
import "../Styles/LoginPage.css";

const LoginPage = () => {
  const [role, setRole] = useState("Administrator");
  const [session, setSession] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    //Fake Api call (replace with real Api)

    if (username === "admin" && password === "1234") {
      const fakeToken = "jwt_token_example_123";
      setToken(fakeToken);
      navigate("/dashboard");
    } else {
      alert("invalid credntials");
    }
  };

  return (
    <div className="login-container">
      <div className="form-box">
        {/* <img src=""
         alt="School Logo"
          className="school-logo" 
          /> */}
      
    
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="input-field"
      >
        <option>Administrator</option>
        <option>Teacher</option>
        <option>Student</option>
      </select>

      <select
        value={session}
        onChange={(e) => setSession(e.target.value)}
        className="input-feild"
      >
        <option>Select Academic Session</option>
        <option>2024-2025</option>
        <option>2023-24</option>
      </select>

      <input 
      type="text" 
      placeholder="UserName"
      value={username}
      onChange={(e)=>setUsername(e.target.value)}
      className="input-feild"
      />
      <input 
      type="text"
      placeholder="Enter Password" 
      value={password}
      onChange={(e)=>setPassword(e.target.value)}
      className="input-field"
      />
      <button className="login-btn" onClick={handleLogin}>Login</button>
      
      <p className="extra-links">
        Don't have an account <a href="#">Register</a>
      </p>
      <p className="extra-links">
        <a href="#">Privacy Policy</a> | <a href="#">Download App</a>
      </p>
    </div>
    </div>
  );
};
export default LoginPage