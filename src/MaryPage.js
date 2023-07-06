import React, { useEffect, useState } from 'react';
import { doc, getDocs, collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import VideoComponent from './VideoComponent';

const MaryPage = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const videoCollection = collection(db, 'videos');
      const videoSnapshot = await getDocs(videoCollection);
      const videoList = videoSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setVideos(videoList);
    };

    fetchVideos();
  }, []);

  return (
    <div style={{ overflow: 'auto', height: '100vh' }}>
      {videos.map((video) => (
        <VideoComponent key={video.id} name={video.name} url={video.url} />
      ))}
    </div>
  );
};

export default MaryPage;
