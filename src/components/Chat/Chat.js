import React, {useEffect, useState} from 'react';
import './chat.css';
import { IoRocketSharp } from "react-icons/io5";

const Chat = ({ messages, user, inputMessage, setInputMessage, handleSendMessage }) => {
    const [textareaHeight, setTextareaHeight] = useState("auto");
    const handleTextareaChange = (event) => {
        event.target.style.height = "auto";
        event.target.style.height = event.target.scrollHeight + "px";
      };
    
    return (
    <div className="chat">
      <div className="messages">
        {messages.slice(0).reverse().map((messageObj, index) => (
          <div
            key={index}
            className={`message ${messageObj.username === user.username ? 'sent' : 'received'}`}
          >
            <div className='username'>{messageObj.username}</div>
            <div className='message-text'>{messageObj.text}</div>
          </div>
        ))}
      </div>
      <div className="input-message">
        <textarea
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            handleTextareaChange(e);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          style={{ height: textareaHeight }}
        />
        <button className='btn-send-message' onClick={handleSendMessage}>
          <IoRocketSharp className='icon-send' />
        </button>
      </div>
    </div>
  );
};

export default Chat;
