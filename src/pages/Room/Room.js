import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import useWebRTC, { LOCAL_VIDEO } from '../../hooks/useWebRTC';
import './room.css';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import i18n from '../../18n';
import { PiCamera, PiCameraSlash, PiMicrophone, PiMicrophoneSlash } from "react-icons/pi";
import { MdCallEnd } from "react-icons/md";
import { IoRocketSharp } from "react-icons/io5";
import { RiUserSharedFill } from "react-icons/ri";
import AuthService from '../../services/auth.server';
import SpeechRecognitionVideo from './SpeechRecogintion';
import { Email } from '../../components/Email/Email';
import { AiOutlineClose } from 'react-icons/ai';


export default function Room() {
  let navigate = useNavigate();
  //const user = authServer.getCurrentUser();
  const selectedLanguage = i18n.language;
  const { id: roomID } = useParams();
  const { clients, provideMediaRef, handleLeave, toggleCamera, toggleMicrophone,
    messages, sendMessage } = useWebRTC(roomID);
  const [isCameraOn, setCameraOn] = useState(true);
  const [isMicrophoneOn, setMicrophoneOn] = useState(true);
  const { t } = useTranslation();

  const { transcript, resetTranscript } = useSpeechRecognition();
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');

  const [inputMessage, setInputMessage] = useState("");
  const [textareaHeight, setTextareaHeight] = useState("auto");

  // const [startTime, setStartTime] = useState(null);
  // const [endTime, setEndTime] = useState(null);

  // const saveCallInfo = useCallback(() => {
  //   const callInfo = {
  //     startTime: startTime,
  //     endTime: endTime,
  //     roomID: roomID,
  //   };

  //   authServer.saveCall(callInfo);
  // }, [startTime, endTime]);

  const handleProvideMediaRef = useCallback((clientID, instance) => {
    provideMediaRef(clientID, instance);
  }, [provideMediaRef]);

  const handleExitRoom = () => {
    //setEndTime(new Date());
    //authServer.saveCall(startTime, endTime);
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
    sendMessage(inputMessage);
    setInputMessage("");
  };

  const handleTextareaChange = (event) => {
    event.target.style.height = "auto";
    event.target.style.height = event.target.scrollHeight + "px";
  };


  const handleToggleSubtitles = () => {
    setSubtitlesEnabled(prevState => !prevState);
  };

  useEffect(() => {
    if (subtitlesEnabled) {
      SpeechRecognition.language = selectedLanguage;
      SpeechRecognition.startListening();
    } else {
      SpeechRecognition.stopListening();
      resetTranscript();
    }

  }, [subtitlesEnabled, resetTranscript]);

  useEffect(() => {
    if (subtitlesEnabled) {
      setCurrentSubtitle(transcript);
    } else {
      setCurrentSubtitle('');
    } console.log(transcript);
  }, [subtitlesEnabled, transcript]);

  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [emailSentMessage, setEmailSentMessage] = React.useState('');

  const handleShareRoom = () => {
    setShowEmailForm(true);
  };
  const handleCloseForm = () => {
    setShowEmailForm(false);
  };
  

  const handleEmailSent = () => {
    setEmailSentMessage(emailSentMessage);
    setShowEmailForm(false);
  };


  return (
    <div className="room">
      <div className="share-room">
        {showEmailForm ? (
          <div className='share-email-form'>
            {/* <Email roomID={roomID} senderEmail={user.email} onEmailSent={handleEmailSent} /> */}
            <button onClick={handleCloseForm} className='btn-close'><AiOutlineClose className='icon-close' /></button>
          </div>
        ) : (
          <div className='room-id'>
            {t('room_id')}: {roomID}
            <button onClick={handleShareRoom} className='btn-share'><RiUserSharedFill className='icon-share' /></button>
          </div>
        )}
        {emailSentMessage && <div>{emailSentMessage}</div>}
      </div>

      <div className="call">
        {clients.map((clientID, index) => {
          return (
            <div key={clientID} id={clientID} className="play-window">
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
                <SpeechRecognitionVideo clientID={clientID} isLocalVideo={false} targetLanguage={selectedLanguage} />
              )}

              {clientID === LOCAL_VIDEO && (
                <div className='call-buttons'>
                  <button className='btn-action' onClick={handleExitRoom} ><MdCallEnd className='icon' id='call-icon' /></button>
                  <button className='btn-action' onClick={handleToggleCamera}>
                    {isCameraOn ? <PiCamera className='icon' /> : <PiCameraSlash className='icon' />}
                  </button>
                  <button className='btn-action' onClick={handleToggleMicrophone}>
                    {isMicrophoneOn ? <PiMicrophone className='icon' /> : <PiMicrophoneSlash className='icon' />}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className='chat'>
        <div className="messages">
          {messages.slice(0).reverse().map((message, index) => (
            <div key={index} className='message'>{message}</div>
          ))}
        </div>
        <div className="input-message">
          <textarea
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              handleTextareaChange(e);
            }}
            style={{ height: textareaHeight }}
          />
          <button className='btn-send-message' onClick={handleSendMessage}><IoRocketSharp className='icon-send' /></button>
        </div>
      </div>

    </div>
  );
}