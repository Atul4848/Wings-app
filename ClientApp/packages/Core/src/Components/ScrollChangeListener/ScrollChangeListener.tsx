import React, { FC, ReactNode, useState, useEffect } from 'react';

interface Props  {
  children: ReactNode;
  onScrollChange: (e: boolean) => void;
  tagName: string;
};

/* istanbul ignore next */
const ScrollChangeListener: FC<Props> = ({ children, onScrollChange, tagName }: Props) => {
  useEffect(() => {
    const onScrollChangeEvent = (event: Event) => {
      if ((event.target as HTMLElement).tagName.toLowerCase() !== tagName.toLowerCase()) {
        onScrollChange(false);
      }
    };

    window.addEventListener('scroll', onScrollChangeEvent, true);

    return () => {
      window.removeEventListener('scroll', onScrollChangeEvent, true);
    };
  }, [tagName, onScrollChange]);

  return <>{children}</>;
};

export default ScrollChangeListener