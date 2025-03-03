import React, { useEffect } from "react";
import CodeBlock from "@theme/CodeBlock";
import { useExampleContext } from "@site/src/context/CodeExamplesContext";
import useIsSmallScreen from "@site/src/hooks/useIsSmallScreen";
import useInjectExampleStyle from "./utils/useInjectExampleStyle";
import extractCodeAndLanguage from "./utils/extractCodeAndLanguage";

const Example = ({ title, children, type }) => {
  useInjectExampleStyle();

  const { registerExample } = useExampleContext();
  const isSmallScreen = useIsSmallScreen();

  const { code, language } = extractCodeAndLanguage(children);

  useEffect(() => {
    if (!isSmallScreen) {
      registerExample(type, { title, content: code, language });
    }
    return () => {
      registerExample(type, null);
    };
  }, []);

  if (isSmallScreen) {
    return (
      <CodeBlock
        language={language || "json"}
        title={
          title || `${type.charAt(0).toUpperCase() + type.slice(1)} Example`
        }
      >
        {code}
      </CodeBlock>
    );
  }

  // On larger screens, the example will be rendered via the TOC override.
  return null;
};

export default Example;
