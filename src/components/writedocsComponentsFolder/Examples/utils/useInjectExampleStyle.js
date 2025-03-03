import { useEffect } from "react";

function getInjectedStyle() {
  const width = window.innerWidth;
  if (width >= 1600) {
    return `
      .docItemCol_xLCN {
        max-width: 70% !important;
      }
    `;
  } else if (width >= 1532) {
    return `
      .docItemCol_xLCN {
        max-width: 60% !important;
      }
    `;
  } else if (width >= 1400) {
    return `
      .docItemCol_xLCN {
        max-width: 55% !important;
      }
    `;
  } else if (width >= 1300) {
    return `
      .docItemCol_xLCN {
        max-width: 60% !important;
      }
    `;
  } else if (width >= 1250) {
    return `
      .docItemCol_xLCN {
        max-width: 55% !important;
      }
    `;
  }
}

export default function useInjectExampleStyle() {
  useEffect(() => {
    const styleId = "example-css-injector";

    function updateStyle() {
      const css = getInjectedStyle();
      let styleTag = document.getElementById(styleId);
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = css;
    }

    updateStyle();
    window.addEventListener("resize", updateStyle);
    return () => {
      window.removeEventListener("resize", updateStyle);
    };
  }, []);
}
