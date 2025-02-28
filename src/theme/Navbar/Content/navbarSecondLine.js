import React from 'react';
import {useThemeConfig, ErrorCauseBoundary} from '@docusaurus/theme-common';
import {
  splitNavbarItems,
} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';

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
function NavbarContentLayout({left}) {
  return (
    <div className="navbar__inner">
      <div className="navbar__items">{left}</div>
    </div>
  );
}
export default function NavbarSecondLine() {
  const items = useNavbarItems();
  const [leftItems] = splitNavbarItems(items);
  return (
    <div className="navbar_second_line">
    <NavbarContentLayout
      left={
        // TODO stop hardcoding items?
        <>
          <NavbarItems items={leftItems} />
        </>
      }
    />
    
    </div>
  );
}
