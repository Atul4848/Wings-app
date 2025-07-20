import React, { ReactElement, ReactNode, Component } from 'react';
import { Box, IconButton, withStyles } from '@material-ui/core';
import { styles } from './CollapsibleWithButtonV2.style';
import { Variant } from '@material-ui/core/styles/createTypography';
import Collapsable from '../Collapsable/Collapsable';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { IClasses, ViewPermission } from '@wings-shared/core';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import CollapsableV2 from '../CollapsableV2/CollapsableV2';

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

@observer
export class CollapsibleWithButtonV2 extends Component<Props> {
  static defaultProps = {
    hasPermission: true,
  };
  @observable isExpanded: boolean = true;

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
      hasPermission,
      customIconButton,
      onExpandButtonClick,
      actionButtons,
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
              {
                this.isExpanded ? actionButtons : ''
              }
            </Box>
          )}
        </ViewPermission>
        <CollapsableV2
          children={children}
          title={title}
          titleVariant={titleVariant}
          titleChildren={titleChildren}
          isExpanded={this.isExpanded}
          onChange={(_event: React.ChangeEvent<{}>, expanded: boolean) =>
            this.onChange(expanded)
          }
        />
      </div>
    );
  }
}

export default withStyles(styles)(CollapsibleWithButtonV2);
