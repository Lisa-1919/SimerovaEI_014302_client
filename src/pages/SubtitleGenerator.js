import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const SubtitleGenerator = () => {
  const { transcript, resetTranscript } = useSpeechRecognition();

  // Reset the recognized speech
  const handleReset = () => {
    resetTranscript();
  };

  // Process the recognized speech and generate subtitles
//   const generateSubtitles = () => {
//     // Your logic for processing the recognized speech and generating subtitles
//   };

  // Start speech recognition
  const startRecognition = () => {
    SpeechRecognition.startListening();
  };

  // Stop speech recognition
  const stopRecognition = () => {
    SpeechRecognition.stopListening();
  };

  return (
    <div>
      <button onClick={startRecognition}>Start Recognition</button>
      <button onClick={stopRecognition}>Stop Recognition</button>
      <button onClick={handleReset}>Reset</button>
      <div>{transcript}</div>
    </div>
  );
};

export default SubtitleGenerator;
