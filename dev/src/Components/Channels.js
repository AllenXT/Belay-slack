/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import '../assets/App.css';

const Channels = ({refreshChannels, setRefreshChannels, onChannelClick}) => {
    const [channels, setChannels] = useState([]);
    const [showInput, setShowInput] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [curChannelId, setCurChannelId] = useState(null)

    // update the last read message
    const updateLastReadMessage = (channelId) => {
        // update the last_read message
        const path = `/api/channels/${channelId}/last_read/update`;
        axios.post(path)
        .then(response => {
            console.log("Last read message updated", response);
        })
        .catch(error => {
            console.error("Error updating last_read message: ", error);
        })
    };

    // fetch unread counts for channels
    const fetchUnreadCounts = () => {
        const path = '/api/channels/unread';
        axios.get(path)
        .then(response => {
            const unreadCounts = response.data;
            // update channel state to add the amount of unread messages
            setChannels(prev => prev.map(channel => ({
                ...channel,
                unreadCount: unreadCounts.find(count => count.channel_id === channel.id)?.unread_count || 0,
            })));
        })
        .catch(error => {
            console.error('Error fetching unread counts: ', error);
        });
    };

    // fetch current channels
    const fetchChannels = useCallback(() => {
        axios.get('/api/channels/all')
        .then(response => {
            // the response data is the array of channels
            setChannels(response.data); 
            fetchUnreadCounts();
            if(refreshChannels) {
                setRefreshChannels(false);
            }
        })
        .catch(error => {
            console.error('Error fetching channels: ', error);
        });
    }, [refreshChannels, setRefreshChannels]);

    useEffect(() => {
        fetchChannels();
        // fetch the unread count every one second
        const intervalId = setInterval(() => {
            updateLastReadMessage(curChannelId);
            fetchUnreadCounts();
        }, 1000);
        // clear interval
        return () => clearInterval(intervalId);
    }, [fetchChannels, curChannelId]);

    // check channels status in development
    useEffect(() => {
        console.log(channels);
    }, [channels]);

    // handle add button click event
    const handleAddClick = () => {
        setShowInput(true);
    };

    // input new channel name
    const handleInputChange = (e) => {
        setNewChannelName(e.target.value);
    };

    // handle submit event
    const handleSubmit = async () => {
        if(newChannelName.trim() !== '') {
            try {
                const response = await axios.post('/api/channels/create', {
                    channel_name : newChannelName,
                });
                if(response.status === 201) {
                    fetchChannels();
                    setCurChannelId(response.data.id);
                    setNewChannelName('');
                    setShowInput(false);
                    onChannelClick(response.data.id);
                }
            } catch (error) {
                if(error.response.data.error === 'duplication') {
                    alert('The channel name has been existed!');
                }
                console.error('Error in creating the channel: ', error);
            }
        }else {
            alert('The new channel name can not be empty!');
        }
    };

    // Call the onChannelClick with the channel ID when a channel is clicked
    const handleChannelSelection = (channelId) => {
        onChannelClick(channelId);
        setCurChannelId(channelId);
        updateLastReadMessage(channelId);
    };

    return (
    <article className="workspace">
        <section className="workspace-header">
            <ul className="list-group no-border">
                <li className="list-group-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-right-text" viewBox="0 0 16 16">
                    <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"/>
                    <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>
                </svg>
                <span>Threads</span>
                </li>
                <li className="list-group-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-check" viewBox="0 0 16 16">
                    <path d="M10.854 7.854a.5.5 0 0 0-.708-.708L7.5 9.793 6.354 8.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0z"/>
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                </svg>
                <span>Drafts &amp; sent</span>
                </li>
                <li className="list-group-item"> 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down" viewBox="0 0 16 16">
                    <path d="M3.204 5h9.592L8 10.481zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659"/>
                </svg>
                <span>Show more</span> 
                </li>
            </ul>
        </section>

        <section className="channels">
            <h5 className="channels-header d-flex align-items-center justify-content-between">
                # Channels
                <button type="button" className="btn btn-sm ml-auto" onClick={handleAddClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-square" viewBox="0 0 16 16">
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                    </svg>
                </button>
            </h5>

            {/* create new channel with input name */}
            {showInput && (
                <div className="input-group mb-3">
                    <input type="text" className="form-control" placeholder="Channel Name" value={newChannelName} onChange={handleInputChange} />
                    <button className="btn btn-outline-primary border border-2 border-dark text-dark reply-btn" type="button" onClick={handleSubmit}>Confirm</button>
                </div>
            )}

            {/* --------------------------------TEST--------------------------------------- */}
            {/* <ul className="list-group no-border">
                <li className="list-group-item d-flex justify-content-between align-items-center current-channel">
                    <div >channel.name</div>
                    <span className="badge badge-primary badge-pill">5</span>
                </li>
            </ul> */}
            {/* --------------------------------TEST--------------------------------------- */}

            {/* channel list start */}
            <ul className="list-group no-border">
                {channels.map(channel => (
                    <li className={`list-group-item d-flex justify-content-between align-items-center ${channel.id === curChannelId ? 'current-channel' : ''}`} 
                        key={channel.id} onClick={() => handleChannelSelection(channel.id)}>
                        <div >{channel.name}</div>
                        {channel.unreadCount > 0 && (
                            <span className="badge badge-primary badge-pill">{channel.unreadCount}</span>
                        )}
                    </li>
                ))}
            </ul>
            {/* channel list end */}
            
        </section>
    </article>
    );
};

export default Channels;