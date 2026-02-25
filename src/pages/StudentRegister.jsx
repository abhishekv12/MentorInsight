import API_URL from "../config";
import React, { useState } from 'react';
import { auth } from '../firebase'; // Keep Firebase for Login Security
import { createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios'; // Import Axios to talk to your Backend
import { useNavigate, Link } from 'react-router-dom';

const StudentRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Create User in Firebase Authentication (Security)
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      // 2. Send Data to your MongoDB Backend
      // We send the Firebase UID so we can link the two systems
      await axios.post('${API_URL}/api/users', {
        uid: user.uid, 
        name: formData.name,
        email: formData.email,
        role: 'student',
        mentorId: null // Student starts with no mentor
      });

      alert("Account Created Successfully!");
      navigate('/student-dashboard');

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered.");
      } else {
        setError("Error: " + err.message);
      }
    }
  };

  return (
    <div className="auth-container bg-student">
      <div className="auth-card border-student">
        <h2 className="auth-title text-student">Student Registration</h2>
        
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <input 
            type="text" 
            placeholder="Full Name" 
            className="auth-input"
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="auth-input"
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="auth-input"
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
          />
          <button type="submit" className="auth-btn btn-student">Register as Student</button>
        </form>
        
        <p className="auth-footer">
          Already registered? <Link to="/login/student" className="link-student">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default StudentRegister;

