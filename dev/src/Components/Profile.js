/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from 'react';
import axios from 'axios';

const Profile = ({onCloseClick}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [editField, setEditField] = useState(null);

    // fetch user info data from the database
    const fetchUserData = () => {
        axios.get('/api/user')
        .then((response) => {
            setUsername(response.data.username);
            setPassword('********');
        })
        .catch(error => {
            console.error('Error fetching user data: ', error);
        });
    };

    // when you click the profile section, fetch user data
    useEffect(() => {
        fetchUserData();
    }, []);

    // handle edit field button click
    const handleEditClick = (field) => {
        setEditField(field);
    };

    // handle update user info
    const handleUpdate = (field, value) => {
        const apiEndpoint = field === 'username' ? '/api/user/username/update' : '/api/user/password/update';
        axios.put(apiEndpoint, { [field]:value })
        .then(response => {
            if(response.data.update === 'success' && response.status === 200) {
                if(field === 'username') {
                    setUsername(value);
                }else {
                    setPassword('********');
                }
                setEditField(null);
            }
        })
        .catch(error => {
            console.error('Error updating user info: ', error);
        });
    };

    return (
    <div className="container">
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <span>User Profile</span>
                <button type="button" className="close" aria-label="Close" onClick={() => onCloseClick()}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div className="card-body text-center">
                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp" alt="avatar"
                className="rounded-circle img-fluid my-4" style={{width: '150px'}} />
                <h3 className="card-title">User Name</h3>
                <p className="card-text border-bottom border-dark py-3">
                    <p className="card-text">
                        <strong>Email:</strong> example@gmail.com
                    </p>
                    <p className="card-text">
                        <strong>Status:</strong> Active
                    </p>
                    <p className="card-text">
                        <strong>Local Time:</strong> 11:22 AM
                    </p>
                </p>
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <p className="card-text mb-0">
                        <strong>Username:</strong> 
                        {editField === 'username' ? (
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                        ) : (
                            <span id="username" className="mx-2">{username}</span>
                        )}
                    </p>
                    {editField === 'username' ? (
                        <button className="btn btn-outline-primary btn-sm border border-0" onClick={() => handleUpdate('username', username)}>Confirm</button>
                    ) : (
                        <button className="btn btn-outline-primary btn-sm border border-0" onClick={() => handleEditClick('username')}>Edit</button>
                    )}
                </div>
                <div className="d-flex justify-content-between align-items-center my-3">
                    <p className="card-text mb-0">
                        <strong>Password:</strong> 
                        {editField === 'password' ? (
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        ) : (
                            <span id="password" className="align-middle mx-2">********</span>
                        )}
                    </p>
                    {editField === 'password' ? (
                        <button className="btn btn-outline-primary btn-sm border border-0" onClick={() => handleUpdate('password', password)}>Confirm</button>
                    ) : (
                        <button className="btn btn-outline-primary btn-sm border border-0" onClick={() => handleEditClick('password')}>Edit</button>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};

export default Profile;