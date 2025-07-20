import { Typography, withStyles } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';
import React, { FC, ReactElement, useState, ReactChild } from 'react';
import { styles } from './PartialCollapsible.styles';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { IClasses, ViewPermission } from '@wings-shared/core';

// Note : Adding new prop add description
interface Props {
  classes?: IClasses;
  key?: string | number;
  className?: string;
  title?: string;
  titleVariant?: Variant;
  isCollapsible?: boolean;
  renderView: ReactElement;
  renderCollapsibleView?: ReactElement;
  defaultCollapsed?: boolean;
}

const PartialCollapsible: FC<Props> = ({
  titleVariant = 'h6',
  className,
  title,
  isCollapsible,
  classes,
  defaultCollapsed,
  ...props
}) => {
  const [ isCollapsed, setIsCollapsed ] = useState(defaultCollapsed);

  return (
    <div className={className}>
      <ViewPermission hasPermission={Boolean(title)}>
        <div className={classes.titleWrapper}>
          <Typography variant={titleVariant} className={classes?.title}>
            {title}
          </Typography>
          <ViewPermission hasPermission={isCollapsible}>
            <span className={classes.collapsibleIcons} onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
            </span>
          </ViewPermission>
        </div>
      </ViewPermission>
      <div className={classes.flexWrap}>
        {props.renderView}
        {isCollapsed && props.renderCollapsibleView}
      </div>
    </div>
  );
};

// Do not use it outside this Input controls Group
export default withStyles(styles)(PartialCollapsible);
export { PartialCollapsible as PurePartialCollapsible };
