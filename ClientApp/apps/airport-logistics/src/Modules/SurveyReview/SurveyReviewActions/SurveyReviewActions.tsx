import React, { FC } from 'react';
import { IconButton, Tooltip, withTheme } from '@material-ui/core';
import { NotInterested, Check, Close, Edit } from '@material-ui/icons';
import { Palette } from '@material-ui/core/styles/createPalette';
import { styles } from './SurveyReviewActions.styles';

type Props = {
  isEditMode: boolean;
  isValid: boolean;
  editHandler: () => void;
  isDisabledApprove?: boolean;
  isEvent?: boolean;
  ignoreHandler?: () => void;
  approveHandler?: () => void;
  cancelHandler?: () => void;
  removeHandler?: () => void;
  palette?: Palette;
};

export const SurveyReviewActions: FC<Props> = ({
  palette,
  isEditMode,
  isValid,
  isDisabledApprove,
  isEvent,
  editHandler,
  ignoreHandler = () => null,
  approveHandler = () => null,
  cancelHandler = () => null,
  removeHandler = () => null,
}) => {
  const classes = styles(palette);
  const tooltipPlacement = 'top';
  if (isEditMode) {
    return (
      <div className={classes.container}>
        <Tooltip title="Save" placement={tooltipPlacement}>
          <div>
            <IconButton className={classes.editButton} size="small" onClick={editHandler} disabled={!isValid}>
              <Check />
            </IconButton>
          </div>
        </Tooltip>
        <Tooltip title="Cancel" placement={tooltipPlacement}>
          <div>
            <IconButton className={classes.button} size="small" onClick={cancelHandler}>
              <Close />
            </IconButton>
          </div>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <Tooltip title="Ignore" placement={tooltipPlacement}>
        <div>
          <IconButton
            className={classes.button}
            size="small"
            onClick={isEvent ? removeHandler : ignoreHandler}
          >
            <NotInterested />
          </IconButton>
        </div>
      </Tooltip>
      <Tooltip title="Approve" placement={tooltipPlacement}>
        <div>
          <IconButton className={classes.button} size="small" onClick={approveHandler} disabled={isDisabledApprove}>
            <Check />
          </IconButton>
        </div>
      </Tooltip>
      <Tooltip title="Edit" placement={tooltipPlacement}>
        <div>
          <IconButton className={classes.button} size="small" onClick={editHandler}>
            <Edit />
          </IconButton>
        </div>
      </Tooltip>
    </div>
  );
};

export default withTheme(SurveyReviewActions);
