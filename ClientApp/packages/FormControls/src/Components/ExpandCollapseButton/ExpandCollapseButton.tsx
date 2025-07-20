import React, { FC, useState } from 'react';
import { IconButton, withStyles } from '@material-ui/core';
import { ExpandIcon, CompressIcon } from '@uvgo-shared/icons';
import { IClasses } from '@wings-shared/core';
import classNames from 'classnames';
import { styles } from './ExpandCollapseButton.styles';

type Props = {
  classes?: IClasses;
  onExpandCollapse?: () => void;
  isExpandMode?: boolean;
};

const ExpandCollapseButton: FC<Props> = ({ isExpandMode, classes, onExpandCollapse }: Props) => {
  const [ isExpanded, setIsExpanded ] = useState(onExpandCollapse ? isExpandMode : false);
  const handleExpandCollapse = () => {
    setIsExpanded(!isExpanded);
    onExpandCollapse && onExpandCollapse();
  };

  const buttonClass = classNames({
    [classes.iconButton]: true,
  });
  return (
    <IconButton onClick={handleExpandCollapse} color="primary" className={buttonClass}>
      {isExpanded ? <CompressIcon /> : <ExpandIcon />}
    </IconButton>
  );
};

export default withStyles(styles)(ExpandCollapseButton);
