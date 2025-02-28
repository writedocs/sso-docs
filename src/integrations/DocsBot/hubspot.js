import React, { useEffect } from 'react';

const HubspotIntegration = ({ integrationAppId }) => {
  useEffect(() => {
    // Prevent the widget from showing by default
    window.hsConversationsSettings = {
      loadImmediately: false,
    };

    // Load the HubSpot script
    const hubspotScript = document.createElement('script');
    hubspotScript.type = 'text/javascript';
    hubspotScript.id = 'hs-script-loader';
    hubspotScript.async = true;
    hubspotScript.defer = true;
    hubspotScript.src = `//js.hs-scripts.com/${integrationAppId}.js`;
    document.body.appendChild(hubspotScript);

    // Define a global function to open the HubSpot widget
    window.openIntegrationWidget = () => {
      function openWidget() {
        if (window.HubSpotConversations && window.HubSpotConversations.widget) {
          // Force the widget to load in an open state
          window.HubSpotConversations.widget.load({ widgetOpen: true });
          // Force the widget to open to a specific chat flow
          window.HubSpotConversations.widget.refresh({ openToNewThread: true });
        } else {
          setTimeout(openWidget, 500);
        }
      }
      openWidget();
    };

    // Cleanup
    return () => {
      document.body.removeChild(hubspotScript);
      delete window.hsConversationsSettings;
      delete window.openIntegrationWidget;
    };
  }, [integrationAppId]);

  return null;
};

export default HubspotIntegration;
