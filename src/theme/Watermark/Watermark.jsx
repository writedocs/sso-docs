import React from "react";
import "./styles.css";

export default function Watermark() {
  return (
    <a
      href="https://writedocs.io"
      className="wd_watermark_link"
      target="_blank"
    >
      <div className="wd_watermark"></div>
    </a>
  );
}
