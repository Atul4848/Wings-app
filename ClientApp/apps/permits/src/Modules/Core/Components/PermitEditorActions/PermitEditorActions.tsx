import { PrimaryButton } from '@uvgo-shared/buttons';
import { VIEW_MODE } from '@wings/shared';
import React, { FC } from 'react';
import { ArrowBack } from '@material-ui/icons';
import { ViewPermission } from '@wings-shared/core';
import { CustomLinkButton } from '@wings-shared/layout';
import { Typography } from '@material-ui/core';
import classNames from 'classnames';
import { useStyles } from './PermitEditorActions.styles';
import { usePermitModuleSecurity } from '../../../Shared';

type Props = {
  isDetailsView: boolean;
  hasError: boolean;
  onSetViewMode: (mode: VIEW_MODE) => void;
  onCancelClick: () => void;
  onUpsert: () => void;
  hideSaveButton?: boolean;
  isRowEditing?: boolean;
  title?: string;
};

const PermitEditorActions: FC<Props> = ({
  isDetailsView,
  hasError,
  onSetViewMode,
  onCancelClick,
  onUpsert,
  hideSaveButton,
  isRowEditing,
  title,
}) => {
  const classes = useStyles();
  const permitModuleSecurity = usePermitModuleSecurity();
  const titleClass = classNames({ [classes.title]: isDetailsView, [classes.textEllipsis]: true });
  if (isDetailsView) {
    return (
      <div className={classes.mainWrapper}>
        <div className={classes.titleContainer}>
          <CustomLinkButton to="/permits" title="Permits" startIcon={<ArrowBack />} />
          {title && (
            <Typography variant="h6" className={titleClass}>
              {title}
            </Typography>
          )}
        </div>

        <ViewPermission hasPermission={permitModuleSecurity.isEditable}>
          <PrimaryButton variant="contained" onClick={() => onSetViewMode(VIEW_MODE.EDIT)}>
            Edit
          </PrimaryButton>
        </ViewPermission>
      </div>
    );
  }
  return (
    <div className={classes.mainWrapper}>
      {title && (
        <Typography variant="h6" className={titleClass}>
          {title}
        </Typography>
      )}
      <div>
        <PrimaryButton variant="outlined" onClick={() => onCancelClick()} disabled={isRowEditing}>
          Cancel
        </PrimaryButton>
        <ViewPermission hasPermission={!hideSaveButton}>
          <PrimaryButton variant="contained" disabled={hasError} onClick={() => onUpsert()}>
            Save
          </PrimaryButton>
        </ViewPermission>
      </div>
    </div>
  );
};

export default PermitEditorActions;

PermitEditorActions.defaultProps = {
  hideSaveButton: false,
};
