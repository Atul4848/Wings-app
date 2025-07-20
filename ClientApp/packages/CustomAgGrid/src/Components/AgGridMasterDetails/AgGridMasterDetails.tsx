import React, { FC, ReactNode } from 'react';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { useStyles } from './AgGridMasterDetails.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import classNames from 'classnames';
import { IClasses, ViewPermission } from '@wings-shared/core';
import { ExpandCollapseButton } from '@wings-shared/form-controls';

type Props = {
  classes?: IClasses;
  addButtonTitle: string;
  hasAddPermission?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onAddButtonClick: Function;
  resetHeight?: boolean;
  isPrimaryBtn?: boolean; // Deprecated
  noPadding?: boolean;
  infoMessage?: string;
  onExpandCollapse?: () => void;
};

const AgGridMasterDetails: FC<Props> = ({
  hasAddPermission,
  addButtonTitle,
  disabled,
  children,
  resetHeight,
  noPadding,
  infoMessage,
  ...props
}) => {
  const classes = useStyles();
  const wrapper = classNames({
    [classes.root]: true,
    [classes.resetHeight]: resetHeight,
    [classes.noPadding]: noPadding,
  });
  // const ActionButton = props.isPrimaryBtn ? PrimaryButton : SecondaryButton;
  return (
    <div className={wrapper}>
      <div className={Boolean(infoMessage) ? classes.infoContainer : ''}>
        <ViewPermission hasPermission={Boolean(infoMessage)}>
          <div className={classes.infoMessage}>{infoMessage}</div>
        </ViewPermission>
        <div className={classes.btnContainer}>
          <ViewPermission hasPermission={typeof props.onExpandCollapse === 'function'}>
            <ExpandCollapseButton onExpandCollapse={() => props.onExpandCollapse()} />
          </ViewPermission>
          <ViewPermission hasPermission={hasAddPermission}>
            <PrimaryButton
              variant="contained"
              startIcon={<AddIcon />}
              disabled={disabled}
              onClick={() => props.onAddButtonClick()}
            >
              {addButtonTitle}
            </PrimaryButton>
          </ViewPermission>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AgGridMasterDetails;
