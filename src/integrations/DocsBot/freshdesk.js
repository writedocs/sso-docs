import React, { useEffect } from 'react';

const FreshdeskIntegration = ({ integrationAppId }) => {
  useEffect(() => {
    // Script to set window.fwSettings and initialize FreshworksWidget
    const fwSettingsScript = document.createElement('script');
    fwSettingsScript.type = 'text/javascript';
    fwSettingsScript.innerHTML = `
      window.fwSettings = {
        'widget_id': ${integrationAppId},
        'locale': 'en'
      };
      !function(){
        if ("function" != typeof window.FreshworksWidget) {
          var n = function () {
            n.q.push(arguments);
          };
          n.q = [];
          window.FreshworksWidget = n;
        }
      }();
    `;
    document.body.appendChild(fwSettingsScript);

    // Load the Freshdesk widget JavaScript
    const freshdeskScript = document.createElement('script');
    freshdeskScript.type = 'text/javascript';
    freshdeskScript.src = `https://widget.freshworks.com/widgets/${integrationAppId}.js`;
    freshdeskScript.async = true;
    freshdeskScript.defer = true;
    document.body.appendChild(freshdeskScript);

    // Hide the launcher by default
    const hideLauncherScript = document.createElement('script');
    hideLauncherScript.type = 'text/javascript';
    hideLauncherScript.innerHTML = `
      window.FreshworksWidget('hide', 'launcher');
    `;
    document.body.appendChild(hideLauncherScript);

    // Define a global function to open the Freshdesk widget
    window.openIntegrationWidget = () => {
      function openWidget() {
        if (window.FreshworksWidget) {
          window.FreshworksWidget('show', 'launcher');
          window.FreshworksWidget('open');
        } else {
          setTimeout(openWidget, 500);
        }
      }
      openWidget();
    };

    // Cleanup
    return () => {
      document.body.removeChild(fwSettingsScript);
      document.body.removeChild(freshdeskScript);
      document.body.removeChild(hideLauncherScript);
      delete window.openIntegrationWidget;
    };
  }, [integrationAppId]);

  return null;
};

export default FreshdeskIntegration;
