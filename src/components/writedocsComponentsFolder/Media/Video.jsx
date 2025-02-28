import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

const OldPlayerVersion = ({ src, margin, autoplay = false }) => {
  const ratio = "18:9";
  const [widthRatio, heightRatio] = ratio.split(":").map(Number);
  const sideMargin = margin ? `${margin}px` : "auto";

  const videoContainerStyles = {
    position: "relative",
    paddingBottom: `${(heightRatio / widthRatio) * 100}%`,
    height: 0,
    overflow: "hidden",
    maxWidth: "100%",
    margin: `0 ${sideMargin} 20px ${sideMargin}`,
  };

  const videoStyles = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  };

  const isIframeSrc = (src) => {
    return src.includes("youtube.com") || src.includes("youtu.be");
  };

  if (isIframeSrc(src)) {
    return (
      <div className="video_component" style={videoContainerStyles}>
        <iframe
          src={src}
          style={videoStyles}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>
    );
  }

  return (
    <div className="video_component" style={videoContainerStyles}>
      <video style={videoStyles} controls autoPlay={autoplay}>
        <source src={useBaseUrl(src)} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

const YouTubeIframe = ({ src, width, title }) => {
  if (!src) {
    return <div style={{ color: "red" }}>Error: Video source is required</div>;
  }

  const iframeWidth = width || "800px";
  const iframeHeight = `calc(${iframeWidth} * 9 / 16)`;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          width: iframeWidth,
          height: iframeHeight,
          position: "relative",
        }}
        className="youTube_iframe"
      >
        <iframe
          src={src}
          title={title ? title : "YouTube Video"}
          style={{
            borderRadius: "6px",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "0",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

const Video = ({ src, autoPlay, width, title }) => {
  const srcVideoStyles = {
    borderRadius: "6px",
    margin: "0 auto",
    width: width || "100%",
  };

  return (
    <div className="video_container">
      <video
        style={srcVideoStyles}
        className="video"
        controls
        autoPlay={autoPlay}
      >
        <source src={useBaseUrl(src)} type="video/mp4" />
        {title ? title : "Your browser does not support the video tag."}
      </video>
    </div>
  );
};

const VideoPlayer = ({ src, width, margin, alt, autoPlay = false }) => {
  if (margin) {
    return <OldPlayerVersion src={src} margin={margin} autoplay={autoPlay} />;
  }

  const isIframeSrc = (src) => {
    return src.includes("youtube.com") || src.includes("youtu.be");
  };

  if (isIframeSrc(src)) {
    return <YouTubeIframe src={src} width={width} title={alt} />;
  }

  return <Video src={src} width={width} autoPlay={autoPlay} title={alt} />;
};

export default VideoPlayer;
