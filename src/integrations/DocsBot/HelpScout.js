import React, { useEffect } from 'react';

const HelpScoutIntegration = ({ integrationAppId }) => {
  useEffect(() => {
    // Load the Help Scout Beacon script
    const beaconScript = document.createElement('script');
    beaconScript.type = 'text/javascript';
    beaconScript.innerHTML = `
      !function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});
    `;
    document.body.appendChild(beaconScript);

    // Do not initialize the Beacon here to prevent it from showing by default

    // Define a global function to open the Help Scout Beacon widget
    window.openIntegrationWidget = () => {
      function openBeacon() {
        if (window.Beacon) {
          // Initialize the Beacon if not already initialized
          if (!window.Beacon.hasInit) {
            window.Beacon('init', integrationAppId);
            window.Beacon.hasInit = true;
          }
          window.Beacon('open');
        } else {
          setTimeout(openBeacon, 500);
        }
      }
      openBeacon();
    };

    // Cleanup
    return () => {
      document.body.removeChild(beaconScript);
      delete window.openIntegrationWidget;
      delete window.Beacon;
    };
  }, [integrationAppId]);

  return null;
};

export default HelpScoutIntegration;
