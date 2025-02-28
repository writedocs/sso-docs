import React, { useEffect } from 'react';

const ZendeskIntegration = ({ integrationAppId }) => {
  useEffect(() => {
    // Load the Zendesk widget script
    const zendeskScript = document.createElement('script');
    zendeskScript.id = 'ze-snippet';
    zendeskScript.src = `https://static.zdassets.com/ekr/snippet.js?key=${integrationAppId}`;
    document.body.appendChild(zendeskScript);

    // Hide the Zendesk widget by default after it loads
    zendeskScript.addEventListener('load', () => {
      if (window.zE) {
        window.zE(() => {
          window.zE.hide();
        });
      } else {
        console.error('Zendesk widget failed to load.');
      }
    });

    // Define a global function to open the Zendesk widget
    window.openIntegrationWidget = () => {
      if (window.zE) {
        window.zE.activate();
      } else {
        console.error('Zendesk is not loaded yet.');
      }
    };

    // Cleanup
    return () => {
      document.body.removeChild(zendeskScript);
      delete window.openIntegrationWidget;
    };
  }, [integrationAppId]);

  return null;
};

export default ZendeskIntegration;
