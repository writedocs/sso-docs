import posthog from "posthog-js";
import configurations from "../../../config.json";

const PostHogProvider = ({ children }) => {
  useEffect(() => {
    let posthogKey = process.env.REACT_APP_POSTHOG_API_KEY;
    let posthogHost = process.env.REACT_APP_POSTHOG_HOST;

    if (!posthogKey) {
      posthogKey = configurations.integrations?.posthog?.api_key;
    }
    if (!posthogHost) {
      posthogHost = configurations.integrations?.posthog?.api_host;
    }
    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        loaded: (posthog) => {
          console.log("PostHog loaded:", posthog);
        },
      });
    }
    return () => {
      posthog.shutdown();
    };
  }, []);

  return <>{children}</>;
};

export default PostHogProvider;
