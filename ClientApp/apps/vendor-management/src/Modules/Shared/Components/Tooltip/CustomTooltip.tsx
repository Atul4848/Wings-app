import React, { FC } from 'react';
import { Tooltip, Typography, withStyles } from '@material-ui/core';

const BlueOnGreenTooltip = withStyles({
  tooltip: {
    color: '#000000',
    backgroundColor: '#FFFFFF',
    boxShadow: '1px 2px 0px 1px lightgray'
  },
  arrow: {
    color: '#FFFFFF',
  },
})(Tooltip);

interface Props {
  title: string;
}

const CustomTooltip: FC<Props> = ({ title }) => {
  return (
    <BlueOnGreenTooltip placement="right-start" title={<Typography>{title}</Typography>} arrow>
      {<Typography variant="h6">{title}</Typography>}
    </BlueOnGreenTooltip>
  );
};

export default CustomTooltip;
