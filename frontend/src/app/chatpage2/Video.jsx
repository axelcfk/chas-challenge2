"use client";

import { useRef } from "react";

export default function Video() {
  const [showVideo, setShowVideo] = useState(true);
  const changeSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  return (
    <>
      <video
        className="md:w-1/2 w-full transform scale- "
        ref={videoRef}
        autoPlay
        loop
        muted
      >
        <source src="/ai-gif.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </>
  );
}
