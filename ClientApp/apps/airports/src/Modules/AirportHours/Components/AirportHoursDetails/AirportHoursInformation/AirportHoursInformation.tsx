import React, { Component, ReactNode } from 'react';
import { Divider, Typography, withStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import TabPanel from '@material-ui/lab/TabPanel';
import { AirportModel } from '@wings/shared';
import { action, observable } from 'mobx';
import { AirportHoursModel } from '../../../../Shared';
import { styles } from './AirportHoursInformation.styles';
import classNames from 'classnames';
import { IClasses, ViewPermission } from '@wings-shared/core';
import { TabsLayout } from '@wings-shared/layout';
import AirportTimeZoneInformationV2 from '../AirportTimeZoneInformation/AirportTimeZoneInformationV2';

interface Props {
  classes?: IClasses;
  airport: AirportModel;
  airportHours?: AirportHoursModel[];
  defaultActiveTab?: string;
  onTabChange?: (nextTab: string) => void;
}

@observer
class AirportHoursInformation extends Component<Props> {
  private readonly tabs: string[] = [ 'Summary Information', 'Time Zone Information' ];
  @observable private activeTab: string = this.tabs[0];

  static defaultProps = {
    onTabChange: (nextTab: string) => '',
  };

  constructor(p) {
    super(p);
    this.activeTab = p.defaultActiveTab || this.tabs[0];
  }

  private get hasSummaryInformation(): boolean {
    if (!this.props.airportHours?.length) {
      return false;
    }
    return this.props.airportHours.some(({ scheduleSummary }) => Boolean(scheduleSummary));
  }

  private get hasComments(): boolean {
    if (!this.props.airportHours?.length) {
      return false;
    }
    return this.props.airportHours.some(({ cappsComment }) => Boolean(cappsComment));
  }

  private get summaryInformation(): ReactNode {
    const { classes, airportHours } = this.props as Required<Props>;
    if (!this.hasSummaryInformation) {
      return <Typography>NOT AVAILABLE</Typography>;
    }

    return (
      <div className={classes.informationArea}>
        {airportHours.map(({ airportHoursSubType, scheduleSummary, cappsComment }, index) => (
          <div key={index}>
            <div className={classes.rowWrapper}>
              <ViewPermission hasPermission={Boolean(scheduleSummary) || Boolean(cappsComment)}>
                <div
                  className={classNames({
                    [classes.evenRow]: Boolean(index % 2),
                    [classes.hourType]: true,
                  })}
                >
                  <Typography variant="body2">{airportHoursSubType?.label.replace(' Hours', '')}</Typography>
                </div>
              </ViewPermission>
              <ViewPermission hasPermission={Boolean(scheduleSummary)}>
                <div
                  className={classNames({
                    [classes.evenRow]: Boolean(index % 2),
                    [classes.flexRow]: true,
                    [classes.border]: true,
                  })}
                >
                  <Typography variant="body2">{scheduleSummary}</Typography>
                </div>
              </ViewPermission>
              <ViewPermission hasPermission={this.hasComments}>
                <div
                  className={classNames({
                    [classes.evenRow]: Boolean(index % 2),
                    [classes.flexRow]: true,
                    [classes.border]: true,
                  })}
                >
                  <Typography variant="body2">{cappsComment}</Typography>
                </div>
              </ViewPermission>
            </div>
            <Divider />
          </div>
        ))}
      </div>
    );
  }

  @action
  private setActiveTab(nextTab: string): void {
    this.activeTab = nextTab;
    this.props.onTabChange && this.props.onTabChange(nextTab);
  }

  public render() {
    const { classes, airport } = this.props as Required<Props>;
    return (
      <div className={classes.root}>
        <TabsLayout
          headingTitle=""
          tabs={this.tabs}
          activeTab={this.activeTab}
          onTabChange={(nextTab: string) => this.setActiveTab(nextTab)}
        >
          <TabPanel className={classes.tabPanel} value={this.tabs[0]}>
            {this.summaryInformation}
          </TabPanel>
          <TabPanel className={classes.tabPanel} value={this.tabs[1]}>
            <AirportTimeZoneInformationV2 icaoOrUwaCode={airport.displayCode} />
          </TabPanel>
        </TabsLayout>
      </div>
    );
  }
}

export default withStyles(styles)(AirportHoursInformation);
export { AirportHoursInformation as PureAirportHoursInformation };
