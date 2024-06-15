import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../Components/Home';
import Login from '../Components/Login';
import Signup from '../Components/Signup';
import Dashboard from '../Components/Dashboard';
import '../assets/App.css';

// ...other page components


const AppRouter = () => {
    return(<Router>
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/dashboard/channels/:channelId' element={<Dashboard />} />
            <Route path='/dashboard/channels/:channelId/replies/:messageId' element={<Dashboard />} />
        </Routes>
    </Router>);
};

export default AppRouter;