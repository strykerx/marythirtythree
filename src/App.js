import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { v4 as uuidv4 } from 'uuid';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import './App.css'; // Import the CSS file
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MaryPage from './MaryPage';


function App() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [name, setName] = useState('');
  const [countdown, setCountdown] = useState(33);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redirectToThanks, setRedirectToThanks] = useState(false);

  useEffect(() => {
    let timerId;
    if (capturing) {
      timerId = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else {
      setCountdown(33);
    }
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [capturing]);

  const handleStartCapture = () => {
    setCapturing(true);
    setRecordedBlob(null);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    });
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
    setTimeout(() => {
      handleStopCapture();
    }, 33000);
  };

  const handleDataAvailable = (e) => {
    if (e.data.size > 0) {
      setRecordedChunks((prev) => {
        const newChunks = prev.concat(e.data);
        const blob = new Blob(newChunks, {
          type: 'video/webm',
        });
        setRecordedBlob(blob);
        return newChunks;
      });
    }
  };
  

  const handleStopCapture = () => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  };
  

  const handleUpload = async () => {
    setLoading(true);
    const fileRef = ref(storage, `videos/${uuidv4()}`);
    await uploadBytes(fileRef, recordedBlob);
    const videoURL = await getDownloadURL(fileRef);
    await addDoc(collection(db, 'videos'), {
      name,
      url: videoURL,
    });
    alert('Video uploaded and data saved!');
    setLoading(false);
    setRedirectToThanks(true);
  };

  if (redirectToThanks) {
    return (
      <Router>
        <Navigate to="/thanks" replace />
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
      <Route path="/mary" element={<MaryPage />} />
        <Route path="/" element={
          <>
              <div className='App'>
                <h1>33 seconds for Mary's 33rd!</h1>
                <div className="explaination">
                  <p>
                    It's Mary's 33rd birthday on July 12.  Record a 33 second message telling her why she's the best.
                  </p>
                </div>
                <div className="form-input">
                  <input
                    type='text'
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="camera-preview">
                  {!recordedBlob ? (
                    <Webcam
                      audio={true}
                      ref={webcamRef}
                      videoConstraints={{ echoCancellation: true }}
                      muted={true}
                    />
                  ) : (
                    <video src={URL.createObjectURL(recordedBlob)} controls />
                  )}
                </div>
                {capturing ? (
                  <div className="controls">
                    <button onClick={handleStopCapture} className="button stop-btn">Stop Capture</button>
                    <p>Time left: {countdown}</p>
                  </div>
                ) : (
                  <div className="controls">
                    {!recordedBlob && <button onClick={handleStartCapture} disabled={!name} className="button start-btn">Start Capture</button>}
                    {recordedBlob && (
                      <button onClick={() => setRecordedBlob(null)} className="button re-record-btn">
                        Re-record
                      </button>
                    )}
                  </div>
                )}
                {recordedChunks.length > 0 && !capturing && (
                  <button onClick={handleUpload} disabled={!name} className="button upload-btn">Upload Video</button>
                )}
                {loading && <div>Loading...</div>}
              </div>
            
          </>
        }/>
        <Route path="/thanks" element={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
        <h1 style={{ color: '#333', maxWidth: '80%' }}>🥳Thanks for sending a video for Mary's Birthday!🎂</h1>
      </div>
      
      }/>
      </Routes>
    </Router>
  );
  
}

export default App;