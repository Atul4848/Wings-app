import React, { FC, ReactNode } from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { useStyles } from './RecurrenceTabs.styles';
import classNames from 'classnames';
import { observer } from 'mobx-react';

type Props = {
  children: ReactNode;
  activeTab: number;
  tabs: string[];
  onTabChange?: (tabIndex: number, tabName: string) => void;
  isDisable?: (tabIndex: number) => boolean;
};

const RecurrenceTabsV2: FC<Props> = props => {
  const styles = useStyles();
  const { children, tabs, activeTab, isDisable } = props;
  return (
    <>
      <Tabs
        value={activeTab}
        classes={{ root: styles.root, indicator: styles.indicator }}
      >
        {tabs.map((tab, index) => {
          return (
            <Tab
              fullWidth
              key={index}
              disabled={
                isDisable instanceof Function ? isDisable(index) : false
              }
              onClick={() => props.onTabChange(index, tab)}
              classes={{
                root: classNames({
                  [styles.tabRoot]: true,
                  [styles.lastTab]: index === tabs.length - 1,
                }),
                selected: styles.tabSelected,
              }}
              label={tab}
            />
          );
        })}
      </Tabs>
      {children[activeTab]}
    </>
  );
};
export default observer(RecurrenceTabsV2);
