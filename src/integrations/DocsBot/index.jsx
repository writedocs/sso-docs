import React, { useEffect } from "react";
import configurations from "../../../config.json";
import plan from "../../../plan.json";
import IntercomIntegration from "./Intercom";
import ZendeskIntegration from "./zendesk";
import FreshdeskIntegration from "./freshdesk";
import HubspotIntegration from "./hubspot";
import HelpScoutIntegration from "./HelpScout";

const DocsBot = () => {
  // Determine which integration to use
  let IntegrationComponent = null;
  let integrationAppId = null;
  let integration = null;

  if (configurations.integrations?.askAi?.intercom) {
    integration = "Intercom";
    IntegrationComponent = IntercomIntegration;
    integrationAppId = configurations.integrations.askAi.intercom;
  } else if (configurations.integrations?.askAi?.zendesk) {
    integration = "Zendesk";
    IntegrationComponent = ZendeskIntegration;
    integrationAppId = configurations.integrations.askAi.zendesk;
  } else if (configurations.integrations?.askAi?.hubspot) {
    integration = "HubSpot";
    IntegrationComponent = HubspotIntegration;
    integrationAppId = configurations.integrations.askAi.hubspot;
  } else if (configurations.integrations?.askAi?.freshdesk) {
    integration = "Freshdesk";
    IntegrationComponent = FreshdeskIntegration;
    integrationAppId = configurations.integrations.askAi.freshdesk;
  } else if (configurations.integrations?.askAi?.helpscout) {
    integration = "Help Scout";
    IntegrationComponent = HelpScoutIntegration;
    integrationAppId = configurations.integrations.askAi.helpscout;
  }

  useEffect(() => {
    // Initialize DocsBotAI
    const script1 = document.createElement("script");
    script1.type = "text/javascript";
    script1.innerHTML = `
      window.DocsBotAI = window.DocsBotAI || {};
      DocsBotAI.init = function(e) {
        return new Promise((t, r) => {
          var n = document.createElement("script");
          n.type = "text/javascript";
          n.async = !0;
          n.src = "https://widget.docsbot.ai/chat.js";
          let o = document.getElementsByTagName("script")[0];
          o.parentNode.insertBefore(n, o);
          n.addEventListener("load", () => {
            let n;
            Promise.all([
              new Promise((t, r) => {
                window.DocsBotAI.mount(Object.assign({}, e)).then(t).catch(r);
              }),
              (n = function e(t) {
                return new Promise(e => {
                  if (document.querySelector(t)) return e(document.querySelector(t));
                  let r = new MutationObserver(n => {
                    if (document.querySelector(t)) return e(document.querySelector(t)), r.disconnect();
                  });
                  r.observe(document.body, { childList: !0, subtree: !0 });
                });
              })("#docsbotai-root"),
            ])
            .then(() => t())
            .catch(r);
          });
          n.addEventListener("error", e => { r(e.message) });
        });
      };
    `;
    document.body.appendChild(script1);

    const script2 = document.createElement("script");
    script2.type = "text/javascript";

    // Define the supportCallback
    const supportCallback = `
      function (event, history) {
        event.preventDefault();
        DocsBotAI.unmount();
        if (window.openIntegrationWidget) {
          window.openIntegrationWidget();
        } else {
          console.error('Integration widget is not available.');
        }
      }
    `;

    const options = {
      labels: {
        poweredBy: "Powered by",
        inputPlaceholder: "Send a message...",
        firstMessage: "What can I help you with?",
        sources: "Sources",
        unhelpful: "Report as innacurate",
        getSupport: `Need help? Contact support`,
        floatingButton: "Ask AI",
        suggestions: "Not sure what to ask?",
        close: "Close",
        create: "Create your own!",
        thinking: "Thinking...",
      },
      customCSS: `
      .docsbot-chat-input {
        background-color: #fff !important;
      }
      .docsbot-chat-bot-message-support a {
        font-size: 14px;
        font-weight: 600;
        padding: 6px 12px !important;
        margin-bottom: 6px;
      }
    `,
    };

    // Initialize DocsBotAI with or without supportCallback based on integration
    script2.innerHTML = IntegrationComponent
      ? `
        DocsBotAI.init({
          id: "${plan.docsbot}",
          options: ${JSON.stringify(options)},
          supportCallback: ${supportCallback}
        });
      `
      : `
        DocsBotAI.init({
          id: "${plan.docsbot}",
          options: ${JSON.stringify(options)}
        });
      `;

    document.body.appendChild(script2);

    // Cleanup
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, [IntegrationComponent]);

  return (
    <div>
      <div id="docsbotai-root"></div>
      {IntegrationComponent && (
        <IntegrationComponent integrationAppId={integrationAppId} />
      )}
    </div>
  );
};

export default DocsBot;
