import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import './speech-recognition-video.css';

const translate = async (message, translationLanguage) => {
    try {
        const response = await axios.post('http://localhost:5000/translate-message', {
            message,
            translationLanguage,
        });
        return response.data.translatedMessage;
    } catch (error) {
        return message;
       // throw new Error('Failed to translate message');
    }
};
const SpeechRecognitionVideo = ({ clientID, isLocalVideo, targetLanguage }) => {
    const [message, setMessage] = useState('');
    const {
        transcript,
        interimTranscript,
        finalTranscript,
        translatedText,
        resetTranscript,
        listening,
    } = useSpeechRecognition();

    const startListening = () => {
        SpeechRecognition.startListening({
            continuous: true,
            language: 'ru-RU'
        });
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
    };

    const translateAndDisplay = async (text, targetLanguage) => {
        if (text.trim() !== '') {
            try {
                const translatedText = await translate(text, targetLanguage);
                console.log('Translated text:', translatedText);
                setMessage(translatedText);
            } catch (error) {
                console.error('Translation error:', error);
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (finalTranscript !== '') {
                console.log('Got final result:', finalTranscript);
                translateAndDisplay(finalTranscript, targetLanguage);
                resetTranscript();
            }
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [finalTranscript, targetLanguage]);

    return (
        <div>
            <div>
                <span>
                    Listening:
                    {' '}
                    {listening ? 'on' : 'off'}
                </span>
                <div>
                    <button type="button" onClick={resetTranscript}>Reset</button>

                    <button type="button" onClick={startListening}>Start Listening</button>

                    <button type="button" onClick={stopListening}>Stop Listening</button>
                </div>
            </div>
            <div>
                <span className='sub'>{finalTranscript}</span>
            </div>
            <div>
                <span className='sub'>{message}</span>
            </div>
        </div>
    );
};

export default SpeechRecognitionVideo;