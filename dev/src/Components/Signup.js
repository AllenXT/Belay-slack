import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../assets/App.css';

const Signup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // set up states
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // clear error message when user starts typing
    const handleChange = (setter) => (e) => {
        setter(e.target.value);
        // Clear the error message
        setErrorMsg(''); 
    };

    // Axios call the backend API
    const handleSignup = (e) => {
        e.preventDefault();
        // check if the repeated password and the password are the same
        if(password !== repeatedPassword) {
            setErrorMsg('Passwords do not match!');
            return;
        }

        // check if the user agreed to the terms of service
        if (!agreeToTerms) {
            setErrorMsg('You must agree to the terms of service');
            return;
        }
        
        const path = '/api/signup';
        // console.log(`Requesting URL: ${window.location.origin}${path}`);
        axios.post(path, {
            username,
            password,
        })
        .then(() => {
            // sign up successfully
            console.log("sign up successfully!");
            setUsername('');
            setPassword('');
            setRepeatedPassword('');
            setAgreeToTerms(false);
            // redirect to the home page or previous requested page
            const from = location.state?.from || '/dashboard';
            navigate(from ,{replace: true});
        })
        .catch((error) => {
            console.error(error);
            setErrorMsg("Error in the registration");
        });
    };

    return (
    <div className="row d-flex justify-content-center align-items-center h-100">
        <div className="col-12">
            <div className="card text-black"> 
                <div className="card-body p-md-5">
                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6 col-xl-5">

                            <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4" style={{ color: '#333' }}>
                                Sign up
                            </p>
                
                            <form className="mx-1 mx-md-4">
                
                                <div className="d-flex flex-row align-items-center mb-4">
                                <div className="form-outline flex-fill mb-0">
                                    <input type="text" id="formUserName" className="form-control" value={username} onChange={handleChange(setUsername)}/>
                                    <label className="form-label" htmlFor="formUserName">Your Name</label>
                                </div>
                                </div>
                
                                <div className="d-flex flex-row align-items-center mb-4">
                                <div className="form-outline flex-fill mb-0">
                                    <input type="password" id="formPassword" className="form-control" value={password} onChange={handleChange(setPassword)}/>
                                    <label className="form-label" htmlFor="formPassword">Password</label>
                                </div>
                                </div>
                
                                <div className="d-flex flex-row align-items-center mb-4">
                                <div className="form-outline flex-fill mb-0">
                                    <input type="password" id="formRepeatPassword" className="form-control" value={repeatedPassword} onChange={handleChange(setRepeatedPassword)}/>
                                    <label className="form-label" htmlFor="formRepeatPassword">Repeat your password</label>
                                </div>
                                </div>
                
                                <div className="form-check d-flex justify-content-center mb-5">
                                <input className="form-check-input me-2" type="checkbox" checked={agreeToTerms} onChange={(e) => {setAgreeToTerms(e.target.checked); setErrorMsg('');}} id="formTermsOfService" />
                                <label className="form-check-label" htmlFor="formTermsOfService">
                                    I agree all statements in <a href="#!">Terms of service</a>
                                </label>
                                </div>

                                {/* show the error information */}
                                {errorMsg && <div className="text-danger mb-4">{errorMsg}</div>}
                
                                <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                    <button type="button" className="btn btn-primary btn-lg" onClick={handleSignup}>Register</button>
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

export default Signup;