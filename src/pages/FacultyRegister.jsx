import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from "../../config";

const FacultyRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Create User in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Save Faculty Profile to MongoDB
      await axios.post('${API_URL}/api/users', {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: 'faculty',
        batchCode: '' // Will be generated on the dashboard
      });

      alert("Faculty Account Created!");
      navigate('/faculty-dashboard');

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-container bg-faculty">
      <div className="auth-card border-faculty">
        <h2 className="auth-title text-faculty">Faculty Registration</h2>
        {error && <div className="error-box">{error}</div>}
        
        <form onSubmit={handleRegister} className="auth-form">
          <input type="text" placeholder="Full Name" className="auth-input"
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="Email" className="auth-input"
            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="auth-input"
            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <button type="submit" className="auth-btn btn-faculty">Register as Faculty</button>
        </form>
        <p className="auth-footer">Already registered? <Link to="/login/faculty" className="link-faculty">Login here</Link></p>
      </div>
    </div>
  );
};
export default FacultyRegister;

