import React from "react";
import TOC from "@theme-original/TOC";
import CodeBlock from "@theme/CodeBlock";
import { useExampleContext } from "@site/src/context/CodeExamplesContext";
import styles from "./styles.module.css";
import useIsSmallScreen from "../../hooks/useIsSmallScreen";

export default function TOCWrapper(props) {
  const { examples } = useExampleContext();
  const isSmallScreen = useIsSmallScreen();
  const hasExamples = examples.request || examples.response;

  if (hasExamples && !isSmallScreen) {
    return (
      <div className={styles.exampleToc}>
        {examples.request && (
          <div className={styles.exampleBlock}>
            <CodeBlock
              language={examples.request.language || "json"}
              title={examples.request.title || "Request Example"}
            >
              {examples.request.content}
            </CodeBlock>
          </div>
        )}
        {examples.response && (
          <div className={styles.exampleBlock}>
            <CodeBlock
              language={examples.response.language || "json"}
              title={examples.response.title || "Response Example"}
            >
              {examples.response.content}
            </CodeBlock>
          </div>
        )}
      </div>
    );
  }

  if (props.toc && props.toc.length > 0) {
    return <TOC {...props} />;
  }

  return null;
}
