import React, { FC } from 'react';
import { Tooltip } from '@mui/material';
import { Root, StyledFormLabel, StyledIcon } from './InfoComponent.styles';

type Props = {
  label: string;
  tooltipText?: string;
};

export const InfoComponent: FC<Props> = ({ label, tooltipText }) => {
  return (
    <Root>
      <StyledFormLabel>{label}</StyledFormLabel>
      <Tooltip title={tooltipText || ''} disableFocusListener disableTouchListener arrow>
        <StyledIcon />
      </Tooltip>
    </Root>
  );
};

export default InfoComponent;
