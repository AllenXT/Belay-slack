import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';

const ReplySection = ({ messageId, onCloseClick }) => {
    // state to store the original message
    const [originalMessage, setOriginalMessage] = useState(null);
    // state to show all replies to the selected message
    const [replies, setReplies] = useState([]);
    // state to the post the new reply
    const [newReply, setNewReply] = useState('');

    // fetch all replies
    const fetchReplies = useCallback(() => {
        if(messageId !== null) {
            // fetch replies
            const repPath = `/api/messages/${messageId}/replies`;
            axios.get(repPath)
            .then(response => {
                setReplies(response.data);
            })
            .catch(error => {
                console.error("Error fetching replies in reply section: ", error);
            }); 
        }
    }, [messageId]);

    // fetch the selected message to reply
    const fetchOriginalMsg = useCallback(() => {
        if(messageId !== null) {
            // fetch message
            const msgPath = `/api/messages/${messageId}`;
            axios.get(msgPath)
            .then(response => {
                setOriginalMessage(response.data);
            })
            .catch(error => {
                console.error("Error fetching message in reply section: ", error);
            }); 
        }
    }, [messageId]);

    useEffect(() => {
        fetchReplies();
        fetchOriginalMsg();
    }, [fetchReplies, fetchOriginalMsg]);

    // handle to send the reply
    const handleSendReply = () => {
        if(newReply.trim()) {
            const path = `/api/messages/${messageId}/reply`;
            axios.post(path, { message : newReply })
            .then(response => {
                if(response.data.reply === 'success' && response.status === 201) {
                    // fresh the reply page
                    fetchReplies();
                    setNewReply('');
                }
            })
            .catch(error => {
                console.error("Error replying the message: ", error);
            });
        }else {
            alert('The reply can not be empty!');
        }
    };

    return (
    <div class="container">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Thread</span>
                <button type="button" class="close" aria-label="Close" onClick={() => onCloseClick()}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            

            <div class="container my-3">
                <div class="card">
                    {originalMessage && (
                        <div class="card-header bg-white">
                            <div class="d-flex align-items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-square" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                    <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1v-1c0-1-1-4-6-4s-6 3-6 4v1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                                </svg>
                                <strong class="mx-2">@{originalMessage.username}</strong>
                                {/* TODO: created time */}
                                {/* <small>3 days ago</small> */}
                            </div>
                            <div class="card-body">
                                <p class="card-text">{originalMessage.body}</p>
                            </div>
                        </div>
                    )}
                    
                    {/* --------------------------------TEST--------------------------------------- */}
                    {/* <div class="card-header bg-white">
                        <div class="d-flex align-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-square" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1v-1c0-1-1-4-6-4s-6 3-6 4v1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                            </svg>
                            <strong class="mx-2">@username</strong>
                        </div>
                        <div class="card-body">
                            <p class="card-text">Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>
                        </div>
                    </div> */}
                    {/* --------------------------------TEST--------------------------------------- */}

                    {/* Reply message container */}
                    <div className="overflow-auto" style={{ height: '580px' }}>
                    {replies.map((reply) => (
                        <div key={reply.id} className="card-body border-top">
                            <div className="d-flex align-items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-square" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                    <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1v-1c0-1-1-4-6-4s-6 3-6 4v1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                                </svg>
                                <strong className="mx-2 my-2">@{reply.username}</strong>
                                {/* <small>{new Date(reply.created_at).toLocaleString()}</small> */}
                            </div>
                            <p className="card-text">{reply.body}</p>
                        </div>
                    ))}
                    </div>
                    
                    {/* End of reply message container */}

                    <div class="card-footer bg-white">
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="Reply..." value={newReply} onChange={ (e) => setNewReply(e.target.value) } />
                            <button class="btn btn-outline-primary border border-2 border-black text-dark reply-btn" type="button" id="message-InputBtn" onClick={handleSendReply} >
                            Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
    );
};

export default ReplySection;