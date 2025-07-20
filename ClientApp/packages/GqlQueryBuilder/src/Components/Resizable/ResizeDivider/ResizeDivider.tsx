import DragHandleIcon from '@material-ui/icons/DragHandle';
import { Divider } from '@material-ui/core';
import React, { HTMLAttributes } from 'react';
import { useStyles } from './ResizeDivider.styles';

interface Props extends HTMLAttributes<HTMLDivElement> {
  showDragControl?: boolean;
}

export const ResizeDivider = ({ showDragControl = true, ...props }: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.dividerRoot} {...props}>
      <Divider />
      {showDragControl && (
        <DragHandleIcon className={classes.dragIcon} fontSize="small" />
      )}
    </div>
  );
};
