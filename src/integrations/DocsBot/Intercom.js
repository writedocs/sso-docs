import React, { useEffect } from 'react';

const IntercomIntegration = ({ integrationAppId }) => {
  useEffect(() => {
    // First script to set APP_ID
    const intercomScript1 = document.createElement("script");
    intercomScript1.type = "text/javascript";
    intercomScript1.innerHTML = `
      var APP_ID = "${integrationAppId}";
    `;
    document.body.appendChild(intercomScript1);

    // Second script to load Intercom
    const intercomScript2 = document.createElement("script");
    intercomScript2.type = "text/javascript";
    intercomScript2.innerHTML = `
      (function(){
        var w=window;
        var ic=w.Intercom;
        if(typeof ic==="function"){
          ic('update',w.intercomSettings);
        } else {
          var d=document;
          var i=function(){
            i.c(arguments);
          };
          i.q=[];
          i.c=function(args){
            i.q.push(args);
          };
          w.Intercom=i;
          var l=function(){
            var s=d.createElement('script');
            s.type='text/javascript';
            s.async=true;
            s.src='https://widget.intercom.io/widget/' + "${integrationAppId}";
            var x=d.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);
          };
          if(document.readyState==='complete'){
            l();
          } else if(w.attachEvent){
            w.attachEvent('onload',l);
          } else {
            w.addEventListener('load',l,false);
          }
        }
      })();
    `;
    document.body.appendChild(intercomScript2);

    // Define a global function to open the Intercom widget
    window.openIntegrationWidget = () => {
      if (window.Intercom) {
        window.Intercom('boot', {
          app_id: integrationAppId
        });
        window.Intercom('show');
      } else {
        console.error('Intercom is not loaded yet.');
      }
    };

    // Cleanup
    return () => {
      document.body.removeChild(intercomScript1);
      document.body.removeChild(intercomScript2);
      delete window.openIntegrationWidget;
    };
  }, [integrationAppId]);

  return null;
};

export default IntercomIntegration;
