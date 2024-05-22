import React, {useEffect, useState} from 'react';
import './chat.scss';
import { IoRocketSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";

const Chat = ({ messages, user, inputMessage, setInputMessage, handleSendMessage }) => {
  const { t } = useTranslation();
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
            <div className='chat-username'>{messageObj.username}</div>
            <div className='chat-message-text'>{messageObj.text}</div>
          </div>
        ))}
      </div>
      <div className="chat-input-message">
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
          placeholder={t("message")}
        />
        <button className='btn-send-message' onClick={handleSendMessage}>
          <IoRocketSharp className='icon-send' />
        </button>
      </div>
    </div>
  );
};

export default Chat;
