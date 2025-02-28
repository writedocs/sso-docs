import React, { useEffect, Suspense } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useLocation, useHistory } from "react-router-dom";
import Layout from "@theme/Layout";
import Homepage from "./Homepage.js";
import "./homepage.css";
import "../css/api.css";
import "../css/changelog.css";
import "../css/codeLanguages.css";
import "../css/customDark.css";
import "../css/main.css";
import "../css/navbar.css";
import "../css/navbarIcons.css";
import "../css/pagination.css";
import "../css/searchbar.css";
import "../css/sidebar.css";
import "../css/table.css";
import "../css/tabs.css";
import "../css/_custom.css";
import { languagesMap } from "../utils/languagesMap.js";

import configurations from "../utils/configurations.js";

export default function Home() {
  // const { siteConfig } = useDocusaurusContext();
  const location = useLocation();
  const history = useHistory();

  const { i18n } = useDocusaurusContext();
  const currentLocale = i18n.currentLocale;

  const SelectedHomepage = languagesMap[currentLocale] || Homepage;

  const hasHome = configurations?.homepage?.endsWith(".html");

  useEffect(() => {
    if (!hasHome) {
      history.push(configurations.homepage);
    }
  }, [history]);

  useEffect(() => {
    const homeBtn = document.querySelector(".home_btn");

    if (location.pathname === "/" && hasHome) {
      homeBtn?.classList.add("highlight_home");
    } else if (location.pathname !== "/" && hasHome) {
      homeBtn?.classList.remove("highlight_home");
    }
  }, [location.pathname]);
  return (
    <Suspense fallback={<></>}>
      <Layout description="">
        <main>
          {configurations.homepage &&
            configurations.homepage.endsWith(".html") && <SelectedHomepage />}
        </main>
      </Layout>
    </Suspense>
  );
}
