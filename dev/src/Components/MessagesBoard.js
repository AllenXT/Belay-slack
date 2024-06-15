/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect, useCallback} from 'react';
import Message from './Message';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';
import '../assets/App.css';

const MessagesBoard = ({ channelId,  onReplyClick, onRefreshChannelsClick }) => {
    // state to store channel name
    const [channelName, setChannelName] = useState('');
    // button to edit the channel name
    const [isEditing, setIsEditing] = useState(false);
    // button to delete the channel
    const [showConfirm, setShowConfirm] = useState(false);
    // if there is a channel selected
    const [isChannelSelected, setIsChannelSelected] = useState(false);
    // state to show messages in the channel
    const [messages, setMessages] = useState([]);
    // state to store user posted message
    const [newMessage, setNewMessage] = useState('');

    // fetch the messages for the corresponding channel
    const fetchMessages = useCallback(() => {
        if(channelId !== null) {
            const path = `/api/channels/${channelId}/messages`;
            axios.get(path)
            .then(response => {
                setMessages(response.data);
            })
            .catch(error => {
                console.error("Error fetching messages in channel: ", error);
            }); 
        }else {
            setIsChannelSelected(false);
        }
    }, [channelId]);

    // Check for new messages in the channel at least once every 500 ms
    useEffect(() => {
        fetchMessages();
        const intervalID = setInterval(fetchMessages, 500);
        return () => clearInterval(intervalID);
    }, [fetchMessages]);

    // post the message to the current channel
    const handlePostMessage = () => {
        const path = `/api/channels/${channelId}/messages/post`;
        axios.post(path, { message : newMessage })
        .then(response => {
            if(response.data.post === 'success' && response.status === 201) {
                // fresh the messages on board
                fetchMessages();
                // clear the input field
                setNewMessage('');
            }
        })
        .catch(error => {
            console.error('Error posting message: ', error);
        });
    };

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    // handle the event that delete the channel
    const handleConfirmDelete = () => {
        const path = `/api/channels/${channelId}/delete`;
        axios.post(path)
        .then(response => {
            if(response.data.delete === 'success' && response.status === 200) {
                // alert user
                alert('Channel has been successfully deleted.');
                setChannelName('');
                // clear message board
                setIsChannelSelected(false);
                // fresh the channel list
                onRefreshChannelsClick();
            }
        })
        .catch(error => {
            console.error("Error deleting the channel: ", error);
        });
    };

    const handleNameChange = (e) => {
        setChannelName(e.target.value);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    // handle the event that update the channel name
    const handleConfirmClick = () => {
        const path = `/api/channels/${channelId}/update`;
        axios.put(path, { channelName })
        .then(response => {
            if(response.data.update === 'success' && response.status === 200) {
                setIsEditing(false);
                // fresh the channel list
                onRefreshChannelsClick();
            }
        })
        .catch(error => {
            console.error("Error updating channel name: ", error);
        });
    };

    // fetch the channel name from database
    const fetchChannelName = useCallback(() => {
        if(channelId !== null) {
            const path = `/api/channels/${channelId}`;
            axios.get(path)
            .then(response => {
                setChannelName(response.data.name);
                setIsChannelSelected(true);
            })
            .catch(error => {
                console.error("Error fetching the channel name: ", error);
            });  
        }   
    }, [channelId]);

    // when the channel change fetch the new channel name
    useEffect(() => {
        fetchChannelName();
    }, [fetchChannelName]);

    return (
    <div className="container-fluid d-flex flex-column vh-100">
        {/* message board */}
        <div className="row flex-grow-1 overflow-auto mb-4">
        {isChannelSelected && (
            <div className="col">
                <div className="ms-3 me-3 p-3 rounded shadow-sm">
                    {/* header */}
                    <div className="d-flex justify-content-between align-items-center py-3 border-bottom">

                        {isEditing ? (
                            <div className="d-flex align-items-center">
                                <input type="text" value={channelName} onChange={handleNameChange} />
                                <button className="btn btn-outline-primary border border-0 ms-2" onClick={handleConfirmClick}>Confirm</button>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center">
                                <h3 className="mb-0">{channelName}</h3>
                                <button className="btn btn-outline-primary border border-0 ms-2" onClick={handleEditClick}>Edit</button>
                            </div>
                        )}

                        <button className="btn btn-outline-danger" onClick={handleDeleteClick}>Delete</button>
                        {/* delete confirm window */}
                        <ConfirmModal
                            isOpen={showConfirm}
                            onConfirm={() => {
                                handleConfirmDelete();
                                setShowConfirm(false);
                            }}
                            onCancel={() => setShowConfirm(false)}
                            title="Are you sure you want to delete the channel?"
                            message="All messages in the channel will delete"
                        />
                        
                    </div>
                    {/* messages content */}

                    {/* --------------------------------TEST--------------------------------------- */}

                    {/* <div className="media text-muted py-3">
                        <p className="media-body pb-1 mb-0 medium lh-125">
                            <strong className="d-block text-gray-dark">@username</strong>
                            Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.
                        </p>
                        <div className="d-flex justify-content-between border-bottom border-gray py-3 flex-wrap">
                            <div className="reply-count ml-3">
                                <button type="button" className="btn btn-outline-secondary reply-btn" onClick={() => onReplyClick(1)}>
                                    Reply <span className="badge reply-badge">0</span>
                                </button>
                            </div>
                            
                            <div className="emoji-reactions mr-3 d-flex align-items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-emoji-smile align-items-center my-2" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                    <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5"/>
                                </svg>
                                
                                <div className="dropdown">
                                    <button className="emoji-btn btn dropdown-toggle" data-mdb-toggle="dropdown" aria-expanded="false">❤️ <span className="badge badge-pill text-dark">20</span></button>
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <li><a className="dropdown-item" href="#">user1</a></li>
                                        <li><a className="dropdown-item" href="#">user2</a></li>
                                        <li><a className="dropdown-item" href="#">user3</a></li>
                                    </ul>
                                </div>
                                <div className="dropdown">
                                    <button className="emoji-btn btn dropdown-toggle" data-mdb-toggle="dropdown" aria-expanded="false">👍 <span className="badge badge-pill text-dark">20</span></button>
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <li><a className="dropdown-item" href="#">user1</a></li>
                                        <li><a className="dropdown-item" href="#">user2</a></li>
                                        <li><a className="dropdown-item" href="#">user3</a></li>
                                    </ul>
                                </div>
                                <div className="dropdown">
                                    <button className="emoji-btn btn dropdown-toggle" data-mdb-toggle="dropdown" aria-expanded="false">👍 <span className="badge badge-pill text-dark">20</span></button>
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <li><a className="dropdown-item" href="#">user1</a></li>
                                        <li><a className="dropdown-item" href="#">user2</a></li>
                                        <li><a className="dropdown-item" href="#">user3</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>  */}

                    {/* --------------------------------TEST--------------------------------------- */}

                    {messages.map((message) => (
                        <Message key={message.id} message={message} messageId={message.id} onReplyClick={onReplyClick} />
                    ))}
                    
                </div>
            </div>
        )}    
        </div>
         
        {/* post message textarea */}
        <div className="row">
            <div className="col-12 px-4 my-3 input-area">
                <div className="input-group">
                    <input type="text" className="form-control" placeholder="Enter your message here..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}/>
                    <button className="btn btn-outline-primary border border-2 border-black reply-btn" type="button" onClick={handlePostMessage}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" className="bi bi-send" viewBox="0 0 16 16">
                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                    </svg>
                    </button>
                </div>
            </div>
        </div>  
    </div>
    );
};

export default MessagesBoard;