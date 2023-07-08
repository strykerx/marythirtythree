import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { v4 as uuidv4 } from 'uuid';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import './App.css'; // Import the CSS file
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MaryPage from './MaryPage';
import ThanksPage from './ThanksPage';


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
  const [webcamActive, setWebcamActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');



  

  useEffect(() => {
    let timerId;
    if (capturing) {
      timerId = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            handleStopCapture(); // stop capture when countdown goes below 1
            return 0; // make it stop at 0
          } else {
            return c - 1;
          }
        });
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
    setIsFullscreen(true);
    setWebcamActive(true);
    setRecordedBlob(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your name before starting the capture');
      return;
    }else{
      setErrorMessage('');
    }
    
  
    // Check if webcamRef is available
    if (webcamRef.current && webcamRef.current.stream) {
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
    }
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
    setWebcamActive(false);
    //setIsFullscreen(false);
  };
  
  const handleFileUpload = (e) => {
    setUploading(true);
    if (!name.trim()) {
      setErrorMessage('Please enter your name before uploading the video');
      return;
    }
    const file = e.target.files[0];
    if (file) {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(file);
      videoElement.addEventListener('loadedmetadata', async () => {
        const duration = videoElement.duration;
        if (duration < 27 || duration > 38) {
          setErrorMessage('The video must be 33 seconds long (+-5 seconds)');
          alert('The video must be 33 seconds long (+-5 seconds)');
          setUploading(false);
        } else {
          // Same upload process as the handleUpload function
          const uniqueId = uuidv4();
          const fileRef = ref(storage, `videos/${uniqueId}`);
          await uploadBytes(fileRef, file);
          const videoURL = await getDownloadURL(fileRef);
          await addDoc(collection(db, 'videos'), {
            name,
            url: videoURL,
          });
          alert('Video uploaded and data saved!');
          setLoading(false);
          setIsFullscreen(false);
          setUploaded(true);
          setUploading(false);
        }
      });
    } else {
      setUploading(false);
    }
  };
  

  const handleUpload = async () => {
    console.log(storage);  // Log the storage instance
    setLoading(true);
    const uniqueId = uuidv4();
    console.log(`Generated unique ID: ${uniqueId}`);  // Log the generated unique ID
    const fileRef = ref(storage, `videos/${uniqueId}`);
    await uploadBytes(fileRef, recordedBlob);
    const videoURL = await getDownloadURL(fileRef);
    console.log(`Obtained download URL: ${videoURL}`);  // Log the obtained download URL
    await addDoc(collection(db, 'videos'), {
      name,
      url: videoURL,
    });
    setErrorMessage('');
    alert('Video uploaded and data saved!');
    setLoading(false);
    setIsFullscreen(false);
    setUploaded(true);
    //setRedirectToThanks(true);
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
        <Route
          path="/"
          element={
            <>
              {uploaded && <Navigate to="/thanks" replace />}
              <div className="App">
                <h1>33 seconds for Mary's 33rd!</h1>
                <div className="explanation">
  <h2>Join Us in Celebrating Mary's 33rd Birthday on July 12th!</h2>
  <p>We've come up with a fun way to let Mary know just how amazing she is to each and every one of us. Here's the plan: we're collecting a series of <strong>33-second video messages</strong> from her family and friends, filled with birthday wishes and sentiments.</p>
  <p>Interested in joining? Here's how you can contribute your very own 33-second video message:</p>
  <ul>
    <li>Simply click the "Start Capture" button to record a video directly on this site (Note: this might not work for iPhone users).</li>
    <li>If you have a pre-recorded message or prefer to record using your device's camera, click the "Upload Your Own Video" button. Please ensure your video is <strong>between 30 and 36 seconds</strong> in length.</li>
    <li>Alternatively, feel free to email your video to me at <a href="mailto:stryker.x@gmail.com?subject=Mary Thirty Three">stryker.x@gmail.com</a></li>
  </ul>
</div>

                <div className="form-input">
                  <input
                    type="text"
                    placeholder="Enter your name first"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className={`camera-preview ${isFullscreen ? 'fullscreen' : ''}`}>
                  {webcamActive && (
                    <div className="controls overlay">
                      <button
                        onClick={handleStopCapture}
                        className="button stop-btn"
                      >
                        Stop Capture
                      </button>
                      <p>Time left: {countdown}</p>
                    </div>
                  )}

                  {webcamActive && !recordedBlob && (
                    <Webcam
                      audio={true}
                      ref={webcamRef}
                      onUserMedia={() => handleStartCapture()}
                      videoConstraints={{
                        width: 512,
                        height: 768,
                        facingMode: "user",
                        echoCancellation: true,
                        deviceId: "default",
                      }}
                      muted={true}
                      onUserMediaError={() =>
                        alert("Please allow access to the camera")
                      }
                    />
                  )}

                  {recordedBlob && (
                    <>
                      <video src={URL.createObjectURL(recordedBlob)} controls />
                      {!webcamActive && (
                        <div className="controls overlay">
                          {loading ? (
                            <div className="loading-icon">Uploading...</div>
                          ) : (
                            <>
                              <button
                                onClick={() => setRecordedBlob(null)}
                                className="button re-record-btn"
                              >
                                Re-record
                              </button>
                              {recordedChunks.length > 0 && (
                                <button
                                  onClick={handleUpload}
                                  disabled={!name}
                                  className="button upload-btn"
                                >
                                  Upload Video
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}


                  {!webcamActive && !recordedBlob && (
                    <button
                      onClick={handleStartCapture}
                      disabled={!name}
                      className="button start-btn"
                    >
                      Start Capture
                    </button>
                    
                  )}
                  <br/>
                  <label htmlFor="video-upload" className={`button upload-video-btn ${(!name || uploading) ? 'disabled' : ''}`}>
                    Upload your own video
                  </label>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    disabled={!name || uploading}
                    className="file-input"
                  />
                  <div className='messages'>
                  {errorMessage && <div className="error-message">{errorMessage}</div>}
                  {uploading && <p>Uploading...</p>}
                  </div>
                  



                </div>

                {loading && <div>Loading...</div>}
              </div>

            </>
          }
        />
        <Route path="/thanks" element={<ThanksPage />} />
      </Routes>
    </Router>
  );
  
  
  
}

export default App;