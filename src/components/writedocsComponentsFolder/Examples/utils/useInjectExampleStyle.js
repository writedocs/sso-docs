import { useEffect } from "react";

function getInjectedStyle() {
  const width = window.innerWidth;
  if (width >= 1600) {
    return `
      .docItemCol_xLCN {
        max-width: 651px !important;
      }
    `;
  } else if (width >= 1532) {
    return `
      .docItemCol_xLCN {
        max-width: 651px !important;
      }
    `;
  } else if (width >= 1390) {
    return `
      .docItemCol_xLCN {
        max-width: 626.78px !important;
      }
    `;
  } else if (width >= 1350) {
    return `
      .docItemCol_xLCN {
        max-width: 597.56px !important;
      }
    `;
  } else if (width >= 1300) {
    return `
      .docItemCol_xLCN {
        max-width: 568.39px !important;
      }
    `;
  } else if (width >= 1250) {
    return `
      .docItemCol_xLCN {
        max-width: 539.23px !important;
      }
    `;
  } else if (width >= 1200) {
    return `
      .docItemCol_xLCN {
        max-width: 510.06px !important;
      }
    `;
  } else if (width >= 1150) {
    return `
      .docItemCol_xLCN {
        max-width: 480.89px !important;
      }
    `;
  } else if (width >= 1100) {
    return `
      .docItemCol_xLCN {
        max-width: 451.73px !important;
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
