import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import './speech-recognition.css';

const translate = async (message, targetLanguage) => {
    const encodedParams = new URLSearchParams();
    encodedParams.set('from', 'auto');
    encodedParams.set('to', targetLanguage);
    encodedParams.set('text', message);

    const options = {
        method: 'POST',
        url: 'https://google-translate113.p.rapidapi.com/api/v1/translator/text',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': '459c909060msh259d284d0105b54p151393jsnbb0570bf2901',
            'X-RapidAPI-Host': 'google-translate113.p.rapidapi.com'
        },
        data: encodedParams,
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);
        return response.data.trans;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const SpeechRecognitionVideo = ({ clientID, isLocalVideo, language }) => {
    const [message, setMessage] = useState('');
    const {
        transcript,
        interimTranscript,
        finalTranscript,
        translatedText,
        resetTranscript,
        listening,
    } = useSpeechRecognition();

    useEffect(() => {
        if (finalTranscript !== '') {
            console.log('Got final result:', finalTranscript);
        }
    }, [interimTranscript, finalTranscript]);

    const startListening = () => {
        SpeechRecognition.startListening({
            continuous: true,
            language: 'ru-RU',
        });
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
    };

    //   useEffect(() => {
    //     const interval = setInterval(() => {
    //       if (finalTranscript !== '') {
    //         console.log('Got final result:', finalTranscript);
    //         // translate(finalTranscript, language)
    //         //   .then(translatedText => {
    //         //     console.log('Translated text:', translatedText);
    //         //     // Do something with the translated text
    //         //   })
    //         //   .catch(error => {
    //         //     console.error('Translation error:', error);
    //         //   });
    //       }
    //     }, 5000);

    //     return () => {
    //       clearInterval(interval);
    //     };
    //   }, [finalTranscript, language]);

 

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
                <span>{transcript}</span>
            </div>
        </div>
    );
};

export default SpeechRecognitionVideo;
