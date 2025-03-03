import React, { useEffect } from "react";
import CodeBlock from "@theme/CodeBlock";
import { useExampleContext } from "@site/src/context/CodeExamplesContext";
import useIsSmallScreen from "@site/src/hooks/useIsSmallScreen";
import useInjectExampleStyle from "./utils/useInjectExampleStyle";
import extractCodeAndLanguage from "./utils/extractCodeAndLanguage";

const Example = ({ title, children, type }) => {
  // Inject custom CSS for example styling.
  useInjectExampleStyle();

  const { registerExample } = useExampleContext();
  const isSmallScreen = useIsSmallScreen();

  // Extract both the code content and the language from the children.
  const { code, language } = extractCodeAndLanguage(children);

  useEffect(() => {
    if (!isSmallScreen) {
      // On larger screens, register the example for the TOC override.
      registerExample(type, { title, content: code, language });
    }
    return () => {
      // When unmounting, remove the registered example.
      registerExample(type, null);
    };
  }, [isSmallScreen, title, code, language, registerExample]);

  if (isSmallScreen) {
    // On small screens, render the CodeBlock inline using the extracted language.
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
