import React, { FC, ReactElement, ReactNode, useState } from 'react';
import { Box, IconButton, withStyles } from '@material-ui/core';
import { styles } from './CollapsibleWithShowHideButton.style';
import { Variant } from '@material-ui/core/styles/createTypography';
import Collapsable from '../Collapsable/Collapsable';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { observer } from 'mobx-react';
import { IClasses, ViewPermission } from '@wings-shared/core';
import { ExpandCollapseButton } from '@wings-shared/form-controls';

interface Props {
  children: ReactElement;
  title: string;
  classes: IClasses;
  onButtonClick: () => void;
  titleVariant?: Variant;
  titleChildren?: ReactElement;
  hasPermission?: boolean;
  customIconButton?: ReactElement;
  onExpandButtonClick?: () => void;
  actionButtons?: ReactElement;
}

const CollapsibleWithShowHideButton: FC<Props> = ({
  children,
  title,
  classes,
  titleVariant,
  titleChildren,
  hasPermission = true,
  customIconButton,
  onExpandButtonClick,
  actionButtons,
  onButtonClick,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const onBtnClickHandler = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    onButtonClick();
  };

  const onChange = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return (
    <div className={classes.collapsibleContainer}>
      <ViewPermission hasPermission={hasPermission}>
        {customIconButton ? (
          <IconButton className={classes.button} onClick={onBtnClickHandler}>
            {customIconButton}
          </IconButton>
        ) : (
          <Box className={classes.buttonContainer}>
            {onExpandButtonClick && (
              <ExpandCollapseButton onExpandCollapse={onExpandButtonClick} />
            )}
            {isExpanded ? actionButtons : ''}
          </Box>
        )}
      </ViewPermission>
      <div className={classes.titleRoot}>
        <Collapsable
          children={children}
          title={title}
          titleVariant={titleVariant}
          titleChildren={titleChildren}
          isExpanded={isExpanded}
          onChange={(_, expanded) => onChange(expanded)}
        />
      </div>
    </div>
  );
};

export default withStyles(styles)(observer(CollapsibleWithShowHideButton));
