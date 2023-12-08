import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import useWebRTC, { LOCAL_VIDEO } from '../../hooks/useWebRTC';
import './room.css';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function layout(clientsNumber = 1) {
  const pairs = Array.from({ length: clientsNumber })
    .reduce((acc, next, index, arr) => {
      if (index % 2 === 0) {
        acc.push(arr.slice(index, index + 2));
      }

      return acc;
    }, []);

  const rowsNumber = pairs.length;
  const height = `${100 / rowsNumber}%`;

  return pairs.map((row, index, arr) => {

    if (index === arr.length - 1 && row.length === 1) {
      return [{
        width: '100%',
        height,
      }];
    }

    return row.map(() => ({
      width: '50%',
      height,
    }));
  }).flat();
}

export default function Room() {
  let navigate = useNavigate();
  const { id: roomID } = useParams();
  const { clients, provideMediaRef, handleLeave, toggleCamera, toggleMicrophone, messages, sendChatMessage } = useWebRTC(roomID);
  const videoLayout = layout(clients.length);
  const [isCameraOn, setCameraOn] = useState(true);
  const [isMicrophoneOn, setMicrophoneOn] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleProvideMediaRef = useCallback((clientID, instance) => {
    provideMediaRef(clientID, instance);
  }, [provideMediaRef]);

  const handleExitRoom = () => {
    handleLeave();
    navigate('/home');
  };

  const handleToggleCamera = () => {
    setCameraOn(prevState => !prevState);
    toggleCamera();
  };

  const handleToggleMicrophone = () => {
    setMicrophoneOn(prevState => !prevState);
    toggleMicrophone();
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      sendChatMessage(inputMessage); // Send the input message using the sendChatMessage function from useWebRTC
      setInputMessage(''); // Clear the input field after sending the message
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleToggleSubtitles = () => {
    setSubtitlesEnabled(prevState => !prevState);
  };


  return (
    <div className="room">
      <div className="room-id">
        {t('room_id')}: {roomID}
        <button className='btn'>send</button>
      </div>
      <div className="call">
        {clients.map((clientID, index) => {
          return (
            <div key={clientID} style={videoLayout[index]} id={clientID} className="play-window">
              <video
                width="100%"
                height="100%"
                ref={instance => {
                  handleProvideMediaRef(clientID, instance);
                }}
                autoPlay
                playsInline
                muted={clientID === LOCAL_VIDEO}
              />
              {clientID !== LOCAL_VIDEO && (
                <div>
                  <button onClick={handleToggleSubtitles}>
                    {subtitlesEnabled ? 'Выключить субтитры' : 'Включить субтитры'}
                  </button>
                  {subtitlesEnabled && <div className="subtitles">{transcript}</div>}
                </div>
              )}
              {clientID === LOCAL_VIDEO && (
                <div>
                  <button onClick={handleExitRoom}>Выйти из комнаты</button>
                  <button onClick={handleToggleCamera}>
                    {isCameraOn ? 'Выключить камеру' : 'Включить камеру'}
                  </button>
                  <button onClick={handleToggleMicrophone}>
                    {isMicrophoneOn ? 'Выключить микрофон' : 'Включить микрофон'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-chat">
        <div className="input-area">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className="message">{message.text}</div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}