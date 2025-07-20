import React, { FC } from 'react';
import { Tooltip as MaterialTooltip, TooltipProps, withStyles } from '@material-ui/core';
import { getTooltipStyles } from './AgGridTooltip.styles';

const Tooltip = withStyles(getTooltipStyles)(MaterialTooltip);

const AgGridTooltip: FC<TooltipProps> = ({ children, ...otherProps }) => {
  return (
    <Tooltip
      PopperProps={{
        disablePortal: true,
        popperOptions: {
          positionFixed: true,
          modifiers: {
            preventOverflow: {
              enabled: true,
              boundariesElement: 'window', // where "window" is the boundary
            },
            flip:{
              padding: 30,
            },
          },
        },
      }}
      {...otherProps}
    >
      {children}
    </Tooltip>
  );
};
export default AgGridTooltip;
