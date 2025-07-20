import React, { ReactElement } from 'react';
import { Variant } from '@material-ui/core/styles/createTypography';
import { IClasses } from '@wings-shared/core';
import { Collapsable, CollapsibleWithButton } from '@wings-shared/layout';

interface CollapsableProps {
  buttonText?: string;
  children: ReactElement;
  title: string;
  classes: IClasses;
  onButtonClick?: () => void;
  isButtonDisabled?: boolean;
  titleVariant?: Variant;
  titleChildren?: ReactElement;
  hasPermission?: boolean;
  customIconButton?: ReactElement;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onChange?: (event: React.ChangeEvent<{}>, expanded: boolean) => void;
  isWithButton: boolean;
}

const AircraftCollapsable: React.FC<CollapsableProps> = ({
  isWithButton,
  children,
  title,
  titleVariant,
  titleChildren,
  isExpanded,
  defaultExpanded,
  onChange,
  buttonText,
  onButtonClick = () => {},
  isButtonDisabled,
  hasPermission,
  customIconButton,
}) => {
  return isWithButton ? (
    <CollapsibleWithButton
      title={title}
      titleVariant={titleVariant}
      titleChildren={titleChildren}
      buttonText={buttonText || ''}
      onButtonClick={onButtonClick}
      isButtonDisabled={isButtonDisabled}
      hasPermission={hasPermission}
      customIconButton={customIconButton}
    >
      {children}
    </CollapsibleWithButton>
  ) : (
    <Collapsable
      title={title}
      titleVariant={titleVariant}
      titleChildren={titleChildren}
      isExpanded={isExpanded}
      defaultExpanded={defaultExpanded}
      onChange={onChange}
    >
      {children}
    </Collapsable>
  );
};

export default AircraftCollapsable;
