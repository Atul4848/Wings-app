import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { useStyles } from './ThreatLevel.styles';
import { Typography, Tooltip } from '@material-ui/core';
import { Utilities } from '@wings-shared/core';
import { IThreatLevel } from './Interfaces';
import { THREAT_LEVEL, THREAT_LEVEL_TYPE } from './Enums';

interface Props {
  levelValue: THREAT_LEVEL;
}

const ThreatLevel: FC<Props> = ({ levelValue }) => {
  const classes = useStyles();
  const tooltipItems: IThreatLevel[] = [
    { level: THREAT_LEVEL.ONE, levelClass: classes.levelOne },
    { level: THREAT_LEVEL.TWO, levelClass: classes.levelTwo },
    { level: THREAT_LEVEL.THREE, levelClass: classes.levelThree },
    { level: THREAT_LEVEL.FOUR, levelClass: classes.levelFour },
    { level: THREAT_LEVEL.FIVE, levelClass: classes.levelFive },
  ];

  const threatLevel = ({ level, levelClass }: IThreatLevel): ReactNode => {
    const isActive: boolean = Utilities.isEqual(level, levelValue);
    return (
      <Tooltip
        key={level}
        title={`Level ${level} (${THREAT_LEVEL_TYPE[level]})`}
      >
        <div
          className={classNames(classes.threatBarStep, levelClass, {
            [classes.threatBarStepActive]: isActive,
            [classes.threatBarStepInActive]: !levelValue,
          })}
        >
          <Typography color="inherit">{level}</Typography>
        </div>
      </Tooltip>
    );
  };

  return (
    <div className={classes.root}>
      {tooltipItems.map(threatLevelItem => threatLevel(threatLevelItem))}
    </div>
  );
};

export default ThreatLevel;
