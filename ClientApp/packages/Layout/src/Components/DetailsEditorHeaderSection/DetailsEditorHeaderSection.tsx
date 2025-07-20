import React, { FC, ReactNode } from 'react';
import { Tooltip, Typography, withStyles } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { styles } from './DetailsEditorHeaderSection.styles';
import classNames from 'classnames';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { useNavigate } from 'react-router';
import { GRID_ACTIONS, IClasses, ViewPermission } from '@wings-shared/core';
import EditSaveButtons from '../EditSaveButtons/EditSaveButtons';
import CustomLinkButton from '../CustomLinkButton/CustomLinkButton';
import BreadCrumb from '../BreadCrumb/BreadCrumb';

interface Props {
  classes?: IClasses;
  title: string | ReactNode;
  isEditMode: boolean;
  backNavLink?: string; // It can be optional with useHistoryBackNav
  backNavTitle: string;
  hasEditPermission?: boolean;
  onAction?: (action: GRID_ACTIONS) => void;
  hideActionButtons?: boolean;
  disableActions?: boolean;
  isActive?: boolean;
  showStatusButton?: boolean;
  statusTooltip?: string; // tooltip for status button
  customActionButtons?: () => ReactNode;
  useHistoryBackNav?: boolean;
  onBackClick?: Function;
  showBreadcrumb?: boolean;
  isSaveVisible?: boolean;
  showEditControlls?: boolean; //Allow user to show save and cancel button with activate button
  isRowEditing?: boolean; // to disable form's Cancel button while editing grid inside the form
}

const DetailsEditorHeaderSection: FC<Props> = ({
  classes,
  isEditMode,
  isRowEditing,
  hideActionButtons,
  showBreadcrumb,
  ...props
}: Props) => {
  const titleClass = classNames({ [classes.title]: !isEditMode, [classes.textEllipsis]: true });
  const navigate = useNavigate();
  return (
    <div className={classes.root}>
      <ViewPermission hasPermission={showBreadcrumb}>
        <BreadCrumb />
      </ViewPermission>
      <div className={classes.container}>
        <div className={classes.titleContainer}>
          <ViewPermission hasPermission={!showBreadcrumb}>
            <ViewPermission hasPermission={!isEditMode}>
              {props.useHistoryBackNav ? (
                <PrimaryButton
                  variant="outlined"
                  color="primary"
                  startIcon={<ArrowBack />}
                  onClick={() => {
                    const isCallable = typeof props.onBackClick === 'function';
                    isCallable ? props.onBackClick() : navigate(-1);
                  }}
                >
                  {props.backNavTitle}
                </PrimaryButton>
              ) : (
                <CustomLinkButton
                  to={props.backNavLink}
                  title={props.backNavTitle}
                  startIcon={<ArrowBack />}
                />
              )}
            </ViewPermission>
          </ViewPermission>
          <Typography variant="h6" className={titleClass}>
            {props.title}
          </Typography>
        </div>
        <ViewPermission hasPermission={!hideActionButtons}>
          <div className={classes.contentContainer}>
            <ViewPermission hasPermission={props.showStatusButton}>
              <Tooltip title={props.statusTooltip || ''}>
                <SecondaryButton
                  variant="contained"
                  onClick={() => props.onAction(GRID_ACTIONS.TOGGLE_STATUS)}
                  disabled={!props.hasEditPermission}
                  className={props.showEditControlls ? classes.activateButton : ''}
                >
                  {props.isActive ? 'Deactivate' : 'Activate'}
                </SecondaryButton>
              </Tooltip>
            </ViewPermission>
            {props.customActionButtons()}
            <ViewPermission hasPermission={props.showEditControlls || props.isActive}>
              <EditSaveButtons
                disabled={props.disableActions}
                isEditMode={isEditMode}
                isEditing={isRowEditing}
                hasEditPermission={props.hasEditPermission}
                onAction={action => props.onAction(action)}
                isSaveVisible={!props.isSaveVisible}
              />
            </ViewPermission>
          </div>
        </ViewPermission>
      </div>
    </div>
  );
};

/* istanbul ignore next */
DetailsEditorHeaderSection.defaultProps = {
  useHistoryBackNav: false,
  isActive: true,
  hasEditPermission: false,
  hideActionButtons: false,
  showBreadcrumb: false,
  isSaveVisible: true,
  onAction: () => null,
  customActionButtons: () => null,
};

export default withStyles(styles)(DetailsEditorHeaderSection);
