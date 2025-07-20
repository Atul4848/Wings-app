import React, { FC, ReactNode } from 'react';
import Tab from '@material-ui/core/Tab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import { Typography, withStyles, TabScrollButton, TabScrollButtonProps } from '@material-ui/core';
import { getTabsStyles } from './TabsLayout.styles';
import { IClasses } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  activeTab?: string;
  onTabChange?: (tabName: string) => void;
  tabs?: string[];
  children?: ReactNode;
  headingTitle?: string;
  isDisable?: (tabIndex: number) => boolean;
}

const TabsLayout: FC<Props> = ({
  classes,
  headingTitle = 'Settings',
  children,
  tabs,
  activeTab,
  isDisable,
  onTabChange,
}) => {
  return (
    <div className={classes.root}>
      <Typography variant="h5">{headingTitle}</Typography>
      <TabContext value={activeTab}>
        <TabList
          className={classes.tabList}
          textColor="primary"
          indicatorColor="primary"
          scrollButtons="auto"
          variant="scrollable"
          ScrollButtonComponent={(props: TabScrollButtonProps) => !props.disabled && <TabScrollButton {...props} />}
          onChange={(event: React.ChangeEvent<{}>, newValue: string) => onTabChange(newValue)}
        >
          {tabs.map((tab: string, index: number) => (
            <Tab
              key={index}
              label={tab}
              value={tab}
              disabled={isDisable instanceof Function ? isDisable(index) : false}
              classes={{ root: classes.tabRoot, wrapper: classes.tabWrapper }}
            />
          ))}
        </TabList>
        {children}
      </TabContext>
    </div>
  );
};
export default withStyles(getTabsStyles)(TabsLayout);
