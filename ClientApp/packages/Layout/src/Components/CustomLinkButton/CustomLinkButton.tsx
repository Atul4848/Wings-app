import React, { FC, ReactNode } from 'react';
import { Tooltip, withStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { styles } from './CustomLinkButton.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IClasses } from '@wings-shared/core';

type Props = {
  to: string;
  tooltip?: string;
  classes?: IClasses;
  buttonClasses?: IClasses;
  variant?: 'text' | 'outlined' | 'contained';
  title: string | ReactNode;
  startIcon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

const CustomLinkButton: FC<Props> = ({
  classes,
  buttonClasses,
  to,
  tooltip,
  title,
  variant,
  startIcon,
  disabled,
  onClick,
}: Props) => {
  return (
    <Tooltip title={tooltip}>
      <Link
        className={classes.link}
        to={disabled ? '' : to}
        onClick={() => onClick()}
      >
        <PrimaryButton
          size="small"
          color="primary"
          disabled={disabled}
          classes={buttonClasses}
          variant={variant}
          startIcon={startIcon}
        >
          {title}
        </PrimaryButton>
      </Link>
    </Tooltip>
  );
};

CustomLinkButton.defaultProps = {
  tooltip: '',
  variant: 'outlined',
  disabled: false,
  onClick: () => {},
};

export default withStyles(styles)(CustomLinkButton);
