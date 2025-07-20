import React from 'react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { styles } from './ChildGridWrapper.styles';
import { withStyles } from '@material-ui/core';
import { IClasses, ViewPermission } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  children?: any;
  onAdd?: () => void;
  hasAddPermission?: boolean;
  disabled?: boolean;
  title?: string;
}

const ChildGridWrapper: React.FC<Props> = ({
  classes,
  onAdd,
  hasAddPermission,
  disabled,
  children,
  title = 'Add',
}) => {
  return (
    <div className={classes.container}>
      <ViewPermission hasPermission={hasAddPermission}>
        <PrimaryButton
          className={classes.addButton}
          variant="contained"
          startIcon={<AddIcon />}
          disabled={disabled}
          onClick={() => onAdd()}
        >
          {title}
        </PrimaryButton>
      </ViewPermission>
      {children}
    </div>
  );
};

export default withStyles(styles)(ChildGridWrapper);
