import React, { FC } from 'react';
import { FormLabel, withStyles, IconButton } from '@material-ui/core';
import { styles } from './InputMaximizeLabel.styles';
import { AspectRatio, CallToActionOutlined } from '@material-ui/icons';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import Tooltip from '@material-ui/core/Tooltip';
import { IClasses, ViewPermission } from '@wings-shared/core';
import ExpandCollapseButton from '../ExpandCollapseButton/ExpandCollapseButton';

type Props = {
  classes?: IClasses;
  label: string;
  hasError?: boolean;
  onLabelClick: () => void;
  showEditIcon?: boolean;
  onEditClick?: () => void;
  showExpandButton?: boolean;
  tooltipText?: string;
  isExpanded?: boolean;
};

const InputMaximizeLabel: FC<Props> = ({
  classes,
  label,
  hasError,
  tooltipText,
  onLabelClick,
  showEditIcon = false,
  showExpandButton = true,
  onEditClick,
  isExpanded,
}) => {
  return (
    <div className={classes.customLabel}>
      <div>
        <FormLabel error={hasError} className={classes.textRoot}>
          {label}
        </FormLabel>
        <ViewPermission hasPermission={Boolean(tooltipText)}>
          <Tooltip title={tooltipText}>
            <HelpOutlineOutlinedIcon className={classes.helpIcon} />
          </Tooltip>
        </ViewPermission>
      </div>
      <div>
        {showEditIcon && (
          <IconButton className={classes.iconButton} onClick={() => onEditClick()}>
            <CallToActionOutlined />
          </IconButton>
        )}
        {showExpandButton && (
          <ExpandCollapseButton
            isExpandMode={isExpanded}
            onExpandCollapse={() => {
              onLabelClick();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default withStyles(styles)(InputMaximizeLabel);
