import React from "react";
import plan from "../../plan.json";
import DocsBot from "../integrations/DocsBot";
import PostHogProvider from "../integrations/PostHog";
import { ApiTokenProvider } from "../context/ApiTokenContext";
import Feedback from "../components/writedocsComponentsFolder/Feedback/Feedback";

const integrations = {
  docsbot: {
    component: DocsBot,
    provider: null,
  },
  posthog: {
    component: null,
    provider: PostHogProvider,
  },
  apitoken: {
    component: null,
    provider: ApiTokenProvider,
  },
};

export default function Root({ children }) {
  const enabledIntegrations = Object.keys(plan).filter(
    (key) => plan[key] && integrations[key]
  );

  const providers = [];
  const components = [];

  enabledIntegrations.forEach((integrationName) => {
    const { component, provider } = integrations[integrationName];
    if (provider) {
      providers.push(provider);
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

  const WrappedChildren = providers.reduceRight(
    (acc, Provider) => {
      return <Provider>{acc}</Provider>;
    },
    <>
      {components}
      {plan.feedback && <Feedback/>}
      {children}
    </>
  );

  return WrappedChildren;
}
