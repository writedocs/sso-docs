import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

export default function PaginatorNavLink(props) {
  const {permalink, title, subLabel, isNext} = props;
  return (
    <Link
      className={clsx(
        'pagination-nav__link',
        isNext ? 'pagination-nav__link--next' : 'pagination-nav__link--prev',
      )}
      to={permalink}>
      {subLabel && <div className="pagination-nav__sublabel">{subLabel}</div>}
      <div className="pagination-nav__label">{title}</div>
      {
        isNext ? 
          <ArrowRight size={20} className="next_arrow arrow" weight="bold"/> : 
          <ArrowLeft size={20} className="previous_arrow arrow" weight="bold"/>
      }
    </Link>
  );
}
