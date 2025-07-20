import React, { FC, ReactNode, useState } from 'react';
import { Divider, Typography } from '@material-ui/core';
import TabPanel from '@material-ui/lab/TabPanel';
import { AirportModel } from '@wings/shared';
import { AirportHoursModel } from '../../../../Shared';
import { useStyles } from './AirportHoursInformation.styles';
import classNames from 'classnames';
import { IClasses, ViewPermission } from '@wings-shared/core';
import { TabsLayout } from '@wings-shared/layout';
import AirportTimeZoneInformation from '../AirportTimeZoneInformation/AirportTimeZoneInformationV2';

interface Props {
  classes?: IClasses;
  airport: AirportModel;
  airportHours?: AirportHoursModel[];
  defaultActiveTab?: string;
  onTabChange?: (nextTab: string) => void;
}

const AirportHoursInformation: FC<Props> = ({ airport, airportHours, defaultActiveTab, onTabChange }) => {
  const classes = useStyles();
  const tabs: string[] = [ 'Summary Information', 'Time Zone Information' ];
  const [ activeTabs, setActiveTabs ] = useState(tabs[0] || defaultActiveTab);

  const hasSummaryInformation = (): boolean => {
    if (!airportHours?.length) {
      return false;
    }
    return airportHours.some(({ scheduleSummary }) => Boolean(scheduleSummary));
  };

  const hasComments = (): boolean => {
    if (!airportHours?.length) {
      return false;
    }
    return airportHours.some(({ cappsComment }) => Boolean(cappsComment));
  };

  const summaryInformation = (): ReactNode => {
    if (!hasSummaryInformation()) {
      return <Typography>NOT AVAILABLE</Typography>;
    }

    return (
      <div className={classes.informationArea}>
        {airportHours?.map(({ airportHoursSubType, scheduleSummary, cappsComment }, index) => (
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
              <ViewPermission hasPermission={hasComments()}>
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
  };

  const setActiveTab = (nextTab: string): void => {
    setActiveTabs(nextTab);
    onTabChange && onTabChange(nextTab);
  };

  return (
    <div className={classes.root}>
      <TabsLayout
        headingTitle=""
        tabs={tabs}
        activeTab={activeTabs}
        onTabChange={(nextTab: string) => setActiveTab(nextTab)}
      >
        <TabPanel className={classes.tabPanel} value={tabs[0]}>
          {summaryInformation()}
        </TabPanel>
        <TabPanel className={classes.tabPanel} value={tabs[1]}>
          <AirportTimeZoneInformation icaoOrUwaCode={airport.displayCode} />
        </TabPanel>
      </TabsLayout>
    </div>
  );
};

export default AirportHoursInformation;
