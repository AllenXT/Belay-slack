import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../assets/App.css';
import axios from 'axios';

const Login = () => {
    // states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = (e) => {
        e.preventDefault();
        const path = '/api/login';
        axios.post(path, {
            username,
            password
        })
        .then((response) => {
            console.log("login successfully");
            console.log(response.data);
            // reset the form 
            setUsername('');
            setPassword('');
            setErrorMessage('');
            // redirect to the home page or previous requested page
            const from = location.state?.from || '/dashboard';
            navigate(from, {replace: true});
        })
        .catch((error) => {
            if(error.response && error.response.status === 401) {
                setErrorMessage('Invalid username or password');
            }else {
                console.error(error);
                setErrorMessage('Error in the Login. Try again later');
            }
        });
    };

    // if the user has signed in jump to the dashboard
    useEffect(() => {
        // check if api key in the cookies
        const apiKeyExist = document.cookie.split(';').some((item) => item.trim().startsWith('xiat_api_key='));
        if(apiKeyExist) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
    <div className="row d-flex justify-content-center align-items-center h-100">
        <div className="col-12">
            <div className="card text-black"> 
                <div className="card-body p-md-5">
                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6 col-xl-5">
                            <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4" style={{ color: '#333' }}>
                                Sign In
                            </p>

                            <form onSubmit={handleLogin}>
                                <div className="form-floating">
                                    <input type="text" className="form-control" id="floatingUsername" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                                    <label htmlFor="floatingUsername">User Name</label>
                                </div>

                                <div className="form-floating">
                                    <input type="password" className="form-control" id="floatingPassword" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                                    <label htmlFor="floatingPassword">Password</label>
                                </div>
                        
                                <div className="row my-3">
                                    <div className="col-6"> 
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" value="remember-me" id="flexCheckDefault" />
                                            <label className="form-check-label" htmlFor="flexCheckDefault">
                                                Remember me
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-6 text-end"> 
                                        {/* In future version */}
                                        <a href="#!">Forgot password?</a>
                                    </div>
                                </div>

                                <button className="btn btn-primary w-100 py-2 mb-3" type="submit">Sign in</button>

                                {/* Display error message if login fails */}
                                {errorMessage && <div className="alert alert-danger" role="alert">
                                    {errorMessage}
                                </div>}

                                <div className="text-center">
                                    <p>Not a member? <a href="/signup">Register</a></p>
                                </div>
                            </form>
            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div> 
    );
};

export default Login;




