import React, { Component, Fragment, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { Tabs, Tab, withStyles } from '@material-ui/core';
import { SURVEY_TAB_LABELS } from './../../Enums/index';
import Info from '@material-ui/icons/Info';
import { IClasses } from '@wings-shared/core';
import { styles } from './SurveyTabs.styles';

type Props = {
  airport?: ReactNode;
  handler?: ReactNode;
  classes?: IClasses;
};

@observer
class SurveyTabs extends Component<Props> {
  @observable private activeTab: number = 0;
  @observable private hasAccessed: boolean = false;

  @action
  private handleChange(tabIndex: number): void {
    this.activeTab = tabIndex;
    if (tabIndex === 1) {
      this.hasAccessed = true;
    }
  }

  private getTabLabel(content: ReactNode, label: SURVEY_TAB_LABELS): string {
    return Boolean(content) ? label : '';
  }

  private get tabLabels(): string[] {
    const { airport, handler } = this.props;
    return [
      this.getTabLabel(airport, SURVEY_TAB_LABELS.AIRPORT),
      this.getTabLabel(handler, SURVEY_TAB_LABELS.HANDLER),
    ].filter(Boolean);
  }

  private get contents(): ReactNode[] {
    const { airport, handler } = this.props;
    return [ airport, handler ].filter(Boolean);
  }

  private get infoIcon(): ReactNode {
    const { classes } = this.props;

    if (this.tabLabels.length === 1 || this.hasAccessed) {
      return null;
    }

    return (
      <div className={classes.infoIcon}>
        <Info fontSize="small" />
      </div>
    );
  }

  private get surveyTabs(): ReactNode {
    const { classes } = this.props;
    return (
      <Fragment>
        <div className={classes.container}>
          <div className={`${classes.tabsRoot} test`}>
            {this.infoIcon}
            <Tabs indicatorColor="primary" value={this.activeTab}>
              {this.tabLabels.map((label: string, index: number) => (
                <Tab key={label} label={label} value={index} onClick={() => this.handleChange(index)} />
              ))}
            </Tabs>
          </div>
        </div>
        <div className={`${classes.tabsContent} tabsContent`}>
          {this.contents.map((content: ReactNode, index: number) => (
            <div
              key={index}
              style={{
                display: this.activeTab === index ? 'block' : 'none',
              }}
            >
              {content}
            </div>
          ))}
        </div>
      </Fragment>
    );
  }

  render() {
    return <Fragment>{this.surveyTabs}</Fragment>;
  }
}

export default withStyles(styles)(SurveyTabs);
