import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReactComponent as BelayLogo } from '../assets/BelayLogo.svg';

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from || '/dashboard';

    // State to track hover status
    const [hoveredButton, setHoveredButton] = useState(null);

    const handleSignUp = () => {
        // jump to the Signup page
        navigate('/signup', { state: {from} });
    };

    const handleLogin = () => {
        // jump to the Login page
        navigate('/login', { state: {from} });
    };

    return (
    <div className="container my-5">
        <div className="p-5 text-center rounded-3">
            <BelayLogo className="bi mt-4 mb-3" style={{ color: 'var(--bs-indigo)' }} width="300" height="300"/>
            <h1 className="text-body-emphasis" style={{fontWeight:'bold'}} >Welcome to Belay!</h1>
            <p className="col-lg-8 mx-auto fs-5 text-muted">
                Belay creates a seamless communication experience, bringing your team together at any moment.
            </p>
            <div className="d-inline-flex gap-2 mb-5">
                <button 
                    onClick={handleSignUp} 
                    onMouseOver={() => setHoveredButton('signup')}
                    onMouseOut={() => setHoveredButton(null)}
                    className={`d-inline-flex align-items-center btn btn-lg px-4 rounded-pill ${hoveredButton === 'signup' ? 'btn-primary' : 'btn-outline-primary'}`}
                    type="button">
                    Sign Up
                    {hoveredButton === 'signup' && <span className="ms-2">&rarr;</span>}
                </button>
                <button 
                    onMouseOver={() => setHoveredButton('login')}
                    onMouseOut={() => setHoveredButton(null)}
                    onClick={handleLogin} 
                    className={`btn btn-lg px-4 rounded-pill ${hoveredButton === 'login' ? 'btn-primary' : 'btn-outline-primary'}`} 
                    type="button">
                    Login
                    {hoveredButton === 'login' && <span className="ms-2">&rarr;</span>}
                </button>
            </div>
        </div>
    </div>
    );
};

export default Home;