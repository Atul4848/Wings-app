import { Box, Button, Popover, Chip } from '@material-ui/core';
import { ISelectOption } from '@wings-shared/core';
import React, { ReactElement, useRef, useState } from 'react';
import { useStyles } from './AgGridPopoverWrapper.styles';
import classNames from 'classnames';
import AgGridTooltip from '../AgGridTooltip/AgGridTooltip';

type Props = {
  suppressPopover?: boolean;
  children: ReactElement;
  chipsValues: ISelectOption[];
  onClose?: () => void;
  tooltip?: string;
  hasError?: boolean;
};

export default function AgGridPopoverWrapper({ children, suppressPopover, chipsValues, ...props }: Props) {
  const styles = useStyles();
  const __ref = useRef();

  // Show or Hide popup
  const [ isOpen, setIsOpen ] = useState(false);

  if (suppressPopover) {
    return <>{children}</>;
  }

  return (
    <AgGridTooltip arrow open={props.hasError && !isOpen} title={props.tooltip || ''} placement="bottom-start">
      <Box
        onClick={() => setIsOpen(true)}
        className={classNames({
          [styles.root]: true,
          [styles.errorBorder]: props.hasError && !isOpen,
        })}
      >
        <Chip
          size="small"
          label={`${chipsValues.length} item ${chipsValues.length > 1 ? 's' : ''}..`}
          innerRef={__ref}
        />
        <Popover
          open={isOpen}
          anchorEl={__ref.current}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box padding="10px" minWidth="200px" maxWidth="400px">
            <>{children}</>
            <Box textAlign="right" pt="10px">
              <Button
                variant="outlined"
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                Ok
              </Button>
            </Box>
          </Box>
        </Popover>
      </Box>
    </AgGridTooltip>
  );
}
