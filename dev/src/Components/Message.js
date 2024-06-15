import React, {useState, useEffect, useCallback} from 'react';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
import '../assets/App.css';


const Message = ({message, messageId, onReplyClick}) => {
    // state to store message reactions
    const [reactions, setReactions] = useState([]);
    // state to show emoji picker
    const [showPicker, setShowPicker] = useState(false);

    // regular expression to match the image URL in the message text
    const imageURLRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gi;


    // fetch the reactions for this message
    const fetchReactions = useCallback(() => {
        const path = `/api/messages/${messageId}/reactions`;
        axios.get(path)
        .then(response => {
            setReactions(response.data)
        })
        .catch(error => {
            console.error("Error fetching Reactions: ", error);
        });
    }, [messageId]);

    useEffect(() => {
        fetchReactions();
    }, [fetchReactions]);

    // handle pick an emoji reaction to the message
    const onEmojiClick = (emojiObject, event) => {
        const path = `/api/messages/${messageId}/reactions/add`;
        axios.post(path, { emoji: emojiObject.emoji })
        .then(response => {
            if(response.status === 201) {
                fetchReactions();
                setShowPicker(false);
            }
        })
        .catch(error => {
            console.error("Error picking an Emoji: ", error)
        });
    };

    // parse the images in the text
    const parseImagesInMessage = (message) => {
        return message.replaceAll(imageURLRegex, (url) => `<img src="${url}" alt="Embedded Image" style="max-width:200px; max-height:150px; object-fit: contain;" />`);
    };

    return (
    <div key={messageId} className="media text-muted py-3">
        <p className="media-body pb-1 mb-0 medium lh-125">
            <strong className="d-block text-gray-dark">@{message.username}</strong>
            <span dangerouslySetInnerHTML={{ __html: parseImagesInMessage(message.body) }}></span>
        </p>
        <div className="d-flex justify-content-between border-bottom border-gray py-3">
            <div className="reply-count ml-3">
                <button type="button" className="btn btn-outline-secondary reply-btn" onClick={() => onReplyClick(messageId)}>
                    Reply <span className="badge reply-badge">{message.reply_count}</span>
                </button>
            </div>
            {/* emoji reaction */}
            <div className="emoji-reactions mr-3 d-flex">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-emoji-smile align-items-center my-2" viewBox="0 0 16 16" onClick={() => setShowPicker(val => !val)}>
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5"/>
            </svg>

            {showPicker && (<EmojiPicker onEmojiClick={onEmojiClick} />)}

            {reactions.map(reaction => (
                <div className="dropdown">
                    <button key={reaction.emoji} className="emoji-span btn dropdown-toggle" data-mdb-toggle="dropdown" aria-expanded="false">
                    {reaction.emoji} <span className="badge badge-pill text-dark">{reaction.count}</span>
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="EmojiButton">
                        {/* render the user list */}
                        {reaction.users.map((username) => (
                        <li><span className="dropdown-item">@{username}</span></li>
                        ))}
                    </ul>
                </div>  
            ))}
            </div>
        </div>
    </div>
    );
};

export default Message;