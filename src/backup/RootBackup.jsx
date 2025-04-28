import React, { useState, useEffect } from "react";
import supabase from "../utils/supabase/client";
import { useLocation, useHistory } from "react-router-dom";
import { getLoginPainelStatus } from "../utils/supabase/loginPainel";
import plan from "../../plan.json";
import DocsBot from "../integrations/DocsBot";
import PostHogProvider from "../integrations/PostHog";
import { ApiTokenProvider } from "../context/ApiTokenContext";
import { ExampleProvider } from "@site/src/context/CodeExamplesContext";
import Feedback from "../components/writedocsComponentsFolder/Feedback/Feedback";

const integrations = {
  docsbot: { component: DocsBot, provider: null },
  posthog: { component: null, provider: PostHogProvider },
  apitoken: { component: null, provider: ApiTokenProvider },
};

export default function Root({ children }) {
  const [requireLogin, setRequireLogin] = useState(false);
  const [session, setSession] = useState(null);
  const [appInitialized, setAppInitialized] = useState(false);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    let subscription;
    async function init() {
      const status = await getLoginPainelStatus();
      if (status) {
        setRequireLogin(true);
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        setSession(initialSession);
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (_event, currentSession) => {
            setSession(currentSession);
          }
        );
        subscription = authListener?.subscription;
      } else {
        setRequireLogin(false);
      }
      setAppInitialized(true);
    }

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (!appInitialized) {
    return null;
  }

  if (!requireLogin && location.pathname === "/login") {
    history.replace("/");
    return null;
  }

  if (requireLogin && !session && location.pathname !== "/login") {
    history.replace("/login");
    return null;
  }

  if (session && location.pathname === "/login") {
    history.replace("/");
    return null;
  }

  const enabledIntegrations = Object.keys(plan).filter(
    (key) => plan[key] && integrations[key]
  );

  const dynamicProviders = [];
  const components = [];

  enabledIntegrations.forEach((integrationName) => {
    const { component, provider } = integrations[integrationName];
    if (provider) {
      dynamicProviders.push(provider);
    }
    if (component) {
      const Component = component;
      components.push(
        <React.Fragment key={integrationName}>
          <Component />
        </React.Fragment>
      );
    }
  });

  const InnerContent = dynamicProviders.reduceRight(
    (acc, Provider) => {
      return <Provider>{acc}</Provider>;
    },
    <>
      {components}
      {plan.feedback && <Feedback />}
      {children}
    </>
  );

  return <ExampleProvider>{InnerContent}</ExampleProvider>;
}
