import React, {isValidElement, useEffect, useState} from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import ElementContent from '@theme/CodeBlock/Content/Element';
import StringContent from '@theme/CodeBlock/Content/String';
import styles from './styles.module.css';
import clsx from 'clsx';
import { useApiToken } from '../../context/ApiTokenContext';
import plan from '../../utils/plan';
/**
 * Best attempt to make the children a plain string so it is copyable. If there
 * are react elements, we will not be able to copy the content, and it will
 * return `children` as-is; otherwise, it concatenates the string children
 * together.
 */
function maybeStringifyChildren(children) {
  if (React.Children.toArray(children).some((el) => isValidElement(el))) {
    return children;
  }
  // The children is now guaranteed to be one/more plain strings
  return Array.isArray(children) ? children.join('') : children;
}
export default function CodeBlock({children: rawChildren, ...props}) {
  const [isHovered, setIsHovered] = useState(false);
  const [replacedChildren, setReplacedChildren] = useState(null);
  const { apiToken } = plan.apiToken ? useApiToken() : {apiToken: 'YOUR_API_TOKEN_HERE'};

  
  const [processedChildren, setProcessedChildren] = useState('');
  
  // The Prism theme on SSR is always the default theme but the site theme can
  // be in a different mode. React hydration doesn't update DOM styles that come
  // from SSR. Hence force a re-render after mounting to apply the current
  // relevant styles.
  const isBrowser = useIsBrowser();
  const children = maybeStringifyChildren(rawChildren);
  const containsToken = children?.includes('YOUR_API_TOKEN_HERE');

  useEffect(() => {
    if (containsToken) {
      setProcessedChildren(children.replace(/YOUR_API_TOKEN_HERE/g, apiToken || 'YOUR_API_TOKEN_HERE'));
    } else {
      setProcessedChildren(children);
    }
  }, [children, containsToken, apiToken]);

  const CodeBlockComp =
    typeof children === 'string' ? StringContent : ElementContent;
  return (
    <div
      className={clsx(styles.codeWrapper)}
      onMouseEnter={() => containsToken && setIsHovered(true)}
      onMouseLeave={() => containsToken && setIsHovered(false)}
    >
      <CodeBlockComp key={String(isBrowser)} {...props}>
        {processedChildren || children}
      </CodeBlockComp>
    </div>
    
  );
}
