import React, {useState, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Channels from './Channels';
import MessagesBoard from './MessagesBoard';
import ReplySection from './ReplySection';
import LeftSidebar from './LeftSidebar';
import Profile from './Profile';
import ConfirmModal from './ConfirmModal';
import '../assets/App.css';

const Dashboard = () => {
    const location = useLocation();
    // the shared right side of page to decide which section to show
    const [activeSection, setActiveSection] = useState(null); 
    // record the ID of message being replied
    const [replyToMessageId, setReplyToMessageId] = useState(null);
    // check if the user decide to sign out
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    // select corresponding channel to show messages
    const [selectedChannelId, setSelectedChannelId] = useState(null);
    // status to check if the channel is deleted
    const [refreshChannels, setRefreshChannels] = useState(false);
    // check if the profile is visible
    const [isProfileVisible, setIsProfileVisible] = useState(false);
    // check if the reply section is visible
    const [isReplyVisible, setIsReplyVisible] = useState(false);
    // check if the screen is the narrow screen
    const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 768);
    // record last selected channel ID
    const [lastChannelId, setLastChannelId] = useState(null);

    // useEffect to handle the change of narrow window
    useEffect(() => {
        const handleResize = () => {
            setIsNarrowScreen(window.innerWidth < 768);
        };
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // use useEffect to listen the change of location.pathname to set the activeSection
    useEffect(() => {
        if (location.pathname.includes('/replies/')) {
            setActiveSection('reply');
        } else if (location.pathname.includes('/channels/')) {
            setActiveSection('messages');
        } else {
            setActiveSection('channels');
        }
    }, [location.pathname]);

    const navigate = useNavigate();

    // Function to check if user is authenticated
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('/api/verify_auth', {
                    withCredentials: true // Ensure cookies are sent with the request
                });
                if (response.status !== 200) {
                    console.log('Authenticate Fail');
                    throw new Error('Not Authenticated');
                }
            } catch (error) {
                // Redirect to home page if not authenticated
                navigate('/', { state: { from: location.pathname }, replace: true});
            }
        };

        checkAuth();
    }, [navigate, location.pathname]);

    // check current path to decide to call which function
    const handleSvgForwardClick = () => {
        if (!location.pathname.includes('/channels/')) {
            // current path is under the channel list
            handleChannelClick(lastChannelId);
        } else if (!location.pathname.includes('/replies/')) {
            // current path is under the message board on a channel
            handleReplyClick(replyToMessageId);
        }
    };

    // check current path to decide to call which function
    const handleSvgBackwardClick = () => {
        if (location.pathname.includes('/replies/')) {
            // current path is under the reply section
            handleViewParentMessage();
        } else if (location.pathname.includes('/channels/')) {
            // current path is under the message board on a channel
            handleBackToChannelList();
        }
    };


    // narrow screen - back to channel list from messages
    const handleBackToChannelList = () => {
        navigate(`/dashboard`);
        // Set active section to channels when navigating back to channel list
        setActiveSection('channels');
        setLastChannelId(selectedChannelId);
        setSelectedChannelId(null);
    };

    // narrow screen - back to parent messages from reply section
    const handleViewParentMessage = () => {
        navigate(`/dashboard/channels/${selectedChannelId}`);
        // Set active section to messages when viewing parent message
        setActiveSection('messages'); 
        if(isReplyVisible) { setIsReplyVisible(false); }
    };


    // show the section to reply other message
    const handleReplyClick = (messageId) => {
        navigate(`/dashboard/channels/${selectedChannelId}/replies/${messageId}`);
        setActiveSection('reply');
        setIsReplyVisible(true);
        setReplyToMessageId(messageId);
    }
    // show the profile section
    const handleProfileClick = () => {
        setIsProfileVisible(true);
    };
    // close the reply section
    const handleCloseClick = () => {
        if(replyToMessageId) { setReplyToMessageId(null); }
        navigate(`/dashboard/channels/${selectedChannelId}`);
        setIsReplyVisible(false);
    };

    // close the profile section
    const handleCloseProfileClick = () => {
        setIsProfileVisible(false);
    }

    // sign out confirmation window
    const handleSignOutClick = () => {
        setShowSignOutConfirm(true);
    };

    // handle channel click, update selected channel ID
    const handleChannelClick = (channelId) => {
        navigate(`/dashboard/channels/${channelId}`);
        setActiveSection('messages');
        setSelectedChannelId(channelId);
        if(isReplyVisible) { setIsReplyVisible(false); }
        
    };

    const handleRefreshChannelsClick = () => {
        setRefreshChannels(true);
        if(isReplyVisible) { setIsReplyVisible(false); }
    };

    const signOut = () => {
        const path = '/api/logout';
        axios.post(path)
        .then(() => {
            // redirect to home page
            navigate('/',{replace: true});
        })
        .catch((error) => {
            console.error(error);
        });
    };

    return (
    <div className='dashboard'>
        <header className='py-3 mb-3 border-bottom'>
            <div className="container-fluid d-grid gap-3 align-items-center" style={{ 'gridTemplateColumns': '1fr 2fr 1fr'}} >
                <div className="d-flex justify-content-end align-items-center">
                    <svg onClick={handleSvgBackwardClick} xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-arrow-left me-3" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                    </svg>
                    <svg onClick={handleSvgForwardClick} xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-arrow-right me-4" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-clock-history " viewBox="0 0 16 16">
                        <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z"/>
                        <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z"/>
                        <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5"/>
                    </svg>
                </div>
                <div className="d-flex align-items-center">
                    <form className="w-100 me-3" role="search">
                        <input type="search" className="form-control" placeholder="Search..." aria-label="Search" />
                    </form>   
                </div>
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-question-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
                    </svg>
                </div>
            </div> 
        </header>
        <div className='dashboard-container d-flex flex-column flex-md-row'>
            <aside className='left-sidebar d-none d-md-block'>
                <LeftSidebar onProfileClick={handleProfileClick} onSignOutClick={handleSignOutClick}/>
            </aside>
            <aside className={`channel-list dashboard ${(!isNarrowScreen || activeSection === 'channels') ? 'active' : ''}`}>
                <Channels refreshChannels={refreshChannels} setRefreshChannels={setRefreshChannels} onChannelClick={handleChannelClick}/>
            </aside>
            <main className={`messages-board flex-grow-1 ${(!isNarrowScreen || activeSection === 'messages') ? 'active' : ''}`}>
                <MessagesBoard channelId={selectedChannelId} onReplyClick={handleReplyClick} onRefreshChannelsClick={handleRefreshChannelsClick}/>
            </main>
            {isReplyVisible && (
                <aside className={`reply-section dashboard ${(!isNarrowScreen || activeSection === 'reply') ? 'active' : ''}`}>
                    <ReplySection messageId={replyToMessageId} onCloseClick={handleCloseClick}/>
                </aside>
            )}
            
            {isProfileVisible && (
                <aside className='profile-section dashboard'>
                    <Profile onCloseClick={handleCloseProfileClick}/>
                </aside>
            )}
        </div>
        <ConfirmModal
            isOpen={showSignOutConfirm}
            onConfirm={() => {
                signOut();
                setShowSignOutConfirm(false);
            }}
            onCancel={() => setShowSignOutConfirm(false)}
            title="Are you sure you want to sign out?"
            message="You will return to the home page"
        />
    </div>
    );
};

export default Dashboard;