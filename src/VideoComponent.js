import React, { useEffect, useRef, useState } from "react";
import './App.css';

const VideoComponent = ({ name, url }) => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true); // Initialize state inside the component

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if(entries[0].isIntersecting){
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      },
      {
        threshold: 0.5 // Video must cover at least half of the viewport to play
      }
    );

    observer.observe(videoRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className='play'>
      <h1>{name}</h1>
      <video ref={videoRef} controls muted={muted}>
        <source src={url} type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <br/>
      <button className="button unmute-btn" onClick={() => setMuted(!muted)}>
        {muted ? 'Unmute' : 'Mute'}
      </button>
    </div>
  );
};

export default VideoComponent;
