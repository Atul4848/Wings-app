import React, { Component, ReactNode } from 'react';
import { withStyles, Tabs, Tab } from '@material-ui/core';
import { observer } from 'mobx-react';
import { styles } from './RecurrenceTabs.styles';
import classNames from 'classnames';
import { IClasses } from '@wings-shared/core';

type Props = {
  children: ReactNode;
  activeTab: number;
  tabs: string[];
  classes: IClasses;
  onTabChange?: (tabIndex: number, tabName: string) => void;
  isDisable?: (tabIndex: number) => boolean;
};

@observer
class RecurrenceTabs extends Component<Props> {
  render() {
    const { children, tabs, classes, activeTab, isDisable } = this.props;

    return (
      <>
        <Tabs value={activeTab} classes={{ root: classes.root, indicator: classes.indicator }}>
          {tabs.map((tab, index) => {
            return (
              <Tab
                fullWidth
                key={index}
                disabled={isDisable instanceof Function ? isDisable(index) : false}
                onClick={() => this.props.onTabChange(index, tab)}
                classes={{
                  root: classNames({ [classes.tabRoot]: true, [classes.lastTab]: index === tabs.length - 1 }),
                  selected: classes.tabSelected,
                }}
                label={tab}
              />
            );
          })}
        </Tabs>
        {children[activeTab]}
      </>
    );
  }
}

export default withStyles(styles)(RecurrenceTabs);
