import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import "./media.css";

export default function Image({ src, srcDark, size, width, alt }) {
  const { colorMode } = useColorMode();

  const imageSrc = colorMode === "dark" && srcDark ? srcDark : src;

  const styles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: size || width || "100%",
    margin: "auto",
  };

  return (
    <div style={styles}>
      <img className="img_component" src={useBaseUrl(imageSrc)} alt={alt} />
    </div>
  );
}
