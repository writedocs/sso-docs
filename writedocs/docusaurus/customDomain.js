import dotenv from "dotenv";

dotenv.config();

function retrieveCustomDomain() {
  try {
    if (process.env.URL) return process.env.URL;
    const customDomain = process.env.CUSTOM_DOMAIN;
    if (!customDomain) return "https://docs.writedocs.io";
    return `https://${customDomain}`;
  } catch (error) {
    return "https://docs.writedocs.io";
  }
}

export default retrieveCustomDomain;
