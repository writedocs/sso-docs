import { useState, useEffect } from "react";

export default function useIsSmallScreen() {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    function checkScreen() {
      setIsSmall(window.innerWidth < 1100);
    }
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return isSmall;
}
