import React, { ReactElement, ReactNode, Component } from 'react';
import { Box, IconButton, withStyles } from '@material-ui/core';
import { styles } from './CollapsibleWithButton.style';
import { Variant } from '@material-ui/core/styles/createTypography';
import Collapsable from '../Collapsable/Collapsable';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { IClasses, ViewPermission } from '@wings-shared/core';
import { ExpandCollapseButton } from '@wings-shared/form-controls';

interface Props {
  buttonText: string;
  children: ReactElement;
  title: string;
  classes: IClasses;
  onButtonClick: () => void;
  isButtonDisabled?: boolean;
  titleVariant?: Variant;
  titleChildren?: ReactElement;
  hasPermission?: boolean;
  customIconButton?: ReactElement;
  onExpandButtonClick?: () => void;
  defaultOpen?: boolean;
}

@observer
export class CollapsibleWithButton extends Component<Props> {
  static defaultProps = {
    hasPermission: true,
    defaultOpen: true,
  };
  @observable isExpanded: boolean = this.props.defaultOpen;

  @action
  private onBtnClickHandler(): void {
    if (!this.isExpanded) {
      this.isExpanded = true;
    }

    this.props.onButtonClick();
  }

  @action
  private onChange(expanded: boolean): void {
    this.isExpanded = expanded;
  }

  public render(): ReactNode {
    const {
      children,
      title,
      classes,
      titleVariant,
      titleChildren,
      buttonText,
      isButtonDisabled,
      hasPermission,
      customIconButton,
      onExpandButtonClick,
      defaultOpen,
    } = this.props;
    return (
      <div className={classes.collapsibleContainer}>
        <ViewPermission hasPermission={hasPermission}>
          {customIconButton ? (
            <IconButton
              className={classes.button}
              onClick={() => this.onBtnClickHandler()}
            >
              {customIconButton}
            </IconButton>
          ) : (
            <Box className={classes.buttonContainer}>
              {onExpandButtonClick && (
                <ExpandCollapseButton onExpandCollapse={onExpandButtonClick} />
              )}
              <PrimaryButton
                disabled={isButtonDisabled}
                variant="contained"
                onClick={() => this.onBtnClickHandler()}
              >
                {buttonText}
              </PrimaryButton>
            </Box>
          )}
        </ViewPermission>
        <Collapsable
          children={children}
          title={title}
          titleVariant={titleVariant}
          titleChildren={titleChildren}
          isExpanded={this.isExpanded}
          onChange={(_event: React.ChangeEvent<{}>, expanded: boolean) =>
            this.onChange(expanded)
          }
          defaultExpanded={defaultOpen}
        />
      </div>
    );
  }
}

export default withStyles(styles)(CollapsibleWithButton);
