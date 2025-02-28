import React, { useState } from 'react';
import {useThemeConfig, ErrorCauseBoundary} from '@docusaurus/theme-common';
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarSearch from '@theme/Navbar/Search';
import styles from './styles.module.css';
import NavbarSecondLine from './navbarSecondLine';
import configurations from '../../../utils/configurations';
import plan from '../../../utils/plan';
import VARIABLES from '../../../../writedocs/variables';
import { useApiToken } from '../../../context/ApiTokenContext';
import TokenInput from '../TokenInput/TokenInput'
import SavePopup from '../TokenInput/SavePopup';

function useNavbarItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useThemeConfig().navbar.items;
}
function NavbarItems({items}) {
  return (
    <>
      {items.map((item, i) => (
        <ErrorCauseBoundary
          key={i}
          onError={(error) =>
            new Error(
              `A theme navbar item failed to render.
Please double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:
${JSON.stringify(item, null, 2)}`,
              {cause: error},
            )
          }>
          <NavbarItem {...item} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}
function NavbarContentLayout({left, right}) {
  return (
    <div className="navbar__inner">
      <div className="navbar__items">{left}</div>
      <div className="navbar__items navbar__items--right">{right}</div>
    </div>
  );
}

function RenderApiInput() {
  const { apiToken, saveApiToken } = useApiToken();
  const [inputToken, setInputToken] = useState(apiToken);
  const [showPopup, setShowPopup] = useState(false);

  const handleSaveToken = () => {
    saveApiToken(inputToken);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1500);
  };

  return (
    <>
      {
        plan.apitoken && (
          <TokenInput 
            showPopup={showPopup}
            inputToken={inputToken}
            setInputToken={setInputToken}
            handleSaveToken={handleSaveToken}
          />
        )
      }
      { (plan.apitoken && showPopup) && <SavePopup inputToken={inputToken}/>}
    </>
  )
}

export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(items);
  const searchBarItem = items.find((item) => item.type === 'search');
  const { homepage, styles } = configurations;
  const isHomepage = homepage.endsWith('.html') ? 0 : 1;

  const totalItems = leftItems.length - isHomepage;

  const renderRightComponents = () => (
    <>
      {
        plan.apitoken && <RenderApiInput/>
      }
      <NavbarItems items={rightItems} />
      <NavbarColorModeToggle className={styles.colorModeToggle} />
      {!searchBarItem && (
        <NavbarSearch>
          <SearchBar />
        </NavbarSearch>
      )}
    </>
  )

  if (totalItems <= 1) {
    return (
      <div>
    <NavbarContentLayout
      left={
        // TODO stop hardcoding items?
        <>
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
          <NavbarLogo />
        </>
      }
      right={
        // TODO stop hardcoding items?
        // Ask the user to add the respective navbar items => more flexible
        renderRightComponents()
      }
    />
    <div className='navbar_aux_margin'></div>
    </div>
    )
  }

  return (
    <div>
    <NavbarContentLayout
      left={
        // TODO stop hardcoding items?
        <>
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
          <NavbarLogo />
          {/* <NavbarItems items={leftItems} /> */}
        </>
      }
      right={
        // TODO stop hardcoding items?
        // Ask the user to add the respective navbar items => more flexible
        renderRightComponents()
      }
    />
    <NavbarSecondLine/>
    {/* { navbarToShow ? (
      <>
        <NavbarSecondLine/>
      </>
    ) : <div className='navbar_aux_margin'></div> } */}
    </div>
  );
}
