import React, { useState, useEffect, useRef } from 'react';
import './App1.css';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const App1 = ({ onTranscriptChange, isListening, toggleListening }) => {
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const infoRef = useRef();

  const recognition = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onstart = () => {
        infoRef.current.textContent = 'Voice activated, SPEAK';
      };

      recognition.current.onend = () => {
        infoRef.current.textContent = 'Speech recognition service disconnected';
        toggleListening(false);
      };

      recognition.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setPartialTranscript(interimTranscript);
        if (finalTranscript) {
          handleResult(finalTranscript.trim());
        }
      };
    } else {
      infoRef.current.textContent = 'Your Browser does not support Speech Recognition';
    }
  }, [toggleListening]);

  useEffect(() => {
    if (isListening) {
      recognition.current.start();
    } else {
      recognition.current.stop();
    }
  }, [isListening]);

  const handleResult = (finalTranscript) => {
    onTranscriptChange(finalTranscript);
  };

  return (
    <div className="App1">
      <div className="container">
        <form id="search-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Speak to search..."
            value={partialTranscript || transcript}
            onChange={(e) => setTranscript(e.target.value)}
            style={{ paddingRight: '50px' }}
          />
          <button type="button" onClick={toggleListening}>
            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
        </form>
        <div className="info" ref={infoRef}></div>
        <p className="info">Voice Commands: "stop recording", "reset input", "go"</p>
      </div>
    </div>
  );
};

export default App1;
