import { Box, Popover, Chip } from '@material-ui/core';
import { ISelectOption, ViewPermission } from '@wings-shared/core';
import React, { ReactElement, useRef, useState } from 'react';
import { useStyles } from './PopoverWrapper.styles';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';

type Props = {
  children: ReactElement;
  chipsValues: ISelectOption[];
  onClose?: () => void;
  tooltip?: string;
  hasError?: boolean;
  disabled?: boolean;
  isRowEditing: boolean;
  onOkClick: () => void;
  onCancelClick: () => void;
  onPopoverOpen: () => void;
};

export default function PopoverWrapper({ children, isRowEditing, chipsValues, ...props }: Props) {
  const styles = useStyles();
  const __ref = useRef();

  // Show or Hide popup
  const [ isOpen, setIsOpen ] = useState(false);
  const allowPopover = Boolean(chipsValues.length) || isRowEditing;

  return (
    <Box className={styles.root}>
      <ViewPermission hasPermission={allowPopover}>
        <Chip
          size="small"
          disabled={props.disabled}
          label={chipsValues.length ? `${chipsValues.length} item${chipsValues.length > 1 ? 's' : ''}` : 'Add Items'}
          innerRef={__ref}
          onClick={() => {
            if (!allowPopover) {
              return;
            }
            setIsOpen(true);
            props.onPopoverOpen();
          }}
        />
      </ViewPermission>
      <Popover
        open={isOpen}
        anchorEl={__ref.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box padding="10px" width="800px" maxWidth="800px">
          <>{children}</>
          <Box textAlign="right" pt="10px">
            <ViewPermission hasPermission={isRowEditing}>
              <SecondaryButton
                variant="outlined"
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  setIsOpen(false);
                  props.onCancelClick();
                }}
              >
                Cancel
              </SecondaryButton>
            </ViewPermission>
            <PrimaryButton
              variant="contained"
              size="small"
              disabled={isRowEditing && props.hasError}
              onClick={e => {
                e.stopPropagation();
                setIsOpen(false);
                props.onOkClick();
              }}
            >
              {isRowEditing ? 'Save' : 'Ok'}
            </PrimaryButton>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
