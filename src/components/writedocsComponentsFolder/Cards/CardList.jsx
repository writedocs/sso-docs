import React from 'react';
import Card from './Card';
import './cards.css';

const CardList = ({ data, cols, children }) => {

  const setGridColumns = () => {
    if (cols) {
      return `wd_cards_container grid-columns-${cols}`;
    } else {
      return `wd_cards_container grid-columns-auto`;
    }
  };
  
  return (
    <div className={setGridColumns()} >
      {/* {data.map((item, index) => (
        <Card 
          key={index}
          logo={item.logo}
          name={item.name}
          description={item.description}
          linkTo={item.linkTo}
          externalLink={item.externalLink}
        />
      ))} */}
      {children}
    </div>
  );
};

export default CardList;