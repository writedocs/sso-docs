import dotenv from "dotenv";

dotenv.config();

function loadGtag(configurations) {
  try {
    const gtag = process.env.GTAG;
    if (gtag) {
      return {
        gtag: {
          trackingID: gtag,
          anonymizeIP: true,
        },
      };
    }
    if (configurations.integrations?.gtag) {
      return {
        gtag: {
          trackingID: configurations.integrations.gtag,
          anonymizeIP: true,
        },
      };
    }
  } catch (error) {
    console.error("[GTAG] Error loading GTAG");
  }
}

function loadGoogleTagManager(configurations) {
  try {
    const containerId = process.env.GOOGLE_TAG_MANAGER_ID;
    if (containerId) {
      return {
        googleTagManager: {
          containerId: containerId,
        },
      };
    }
    if (configurations.integrations?.googleTagManager) {
      return {
        googleTagManager: {
          containerId: configurations.integrations.googleTagManager,
        },
      };
    }
  } catch (error) {
    console.error("[GOOGLE_TAG_MANAGER] Error loading GoogleTagManager");
    console.log(error);
  }
}

export { loadGtag, loadGoogleTagManager };
