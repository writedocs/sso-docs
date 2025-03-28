import React from "react";
import "./styles.css";
import { plan } from "../../utils/plan";
import config from "../../utils/configurations";

export default function Watermark() {
  const planToDisable = ["growth", "enterprise"];

  if (planToDisable.includes(plan) && config.hideWatermark) {
    return null;
  }
  return (
    <a href="https://writedocs.io" className="wd_watermark_link" target="_blank">
      <div className="wd_watermark"></div>
    </a>
  );
}
