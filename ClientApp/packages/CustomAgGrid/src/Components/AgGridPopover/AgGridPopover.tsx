import React, { ReactNode, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import { withStyles } from '@material-ui/core';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { IBaseEditorProps } from '../../Interfaces';
import { styles } from './AgGridPopover.styles';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import AgGridTooltip from '../AgGridTooltip/AgGridTooltip';
import AgGridTextField from '../AgGridTextField/AgGridTextField';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import { IClasses } from '@wings-shared/core';
import { EDITOR_TYPES } from '@wings-shared/form-controls';

interface Props extends Partial<IBaseEditorProps> {
  textFieldRef?: RefObject<HTMLInputElement>;
  endAdornmentIcon: ReactNode;
  popperContent: ReactNode;
  onOkClick: Function;
  onCancelClick: Function;
  value: string;
  multiline?: boolean;
  isDisabled?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
  editorType?: EDITOR_TYPES;
  classes?: IClasses;
  toolTip?: string;
}

@observer
class AgGridPopover extends AgGridBaseEditor<Props> {
  @observable public isOpen: boolean = false;
  @observable private toggleElement: Element = null;
  @observable private editorValue: string = '';

  @action
  private onPopperCancelClick(): void {
    this.isOpen = false;
    this.props.onCancelClick(this.editorValue);
  }

  @action
  private onPopperOkClick(): void {
    this.isOpen = false;
    this.props.onOkClick();
  }

  @action
  private onEndAdornmentClick(event: ReactMouseEvent<Element>): void {
    this.toggleElement = event.currentTarget;
    this.editorValue = this.props.value;
    this.isOpen = true;
  }

  private get contentValueRenderer(): ReactNode {
    const { editorType, value, classes } = this.props;

    if (editorType === EDITOR_TYPES.RICH_TEXT_EDITOR) {
      return <div className={classes.textRoot} dangerouslySetInnerHTML={{ __html: value }} />;
    }
    return <div className={classes.textRoot}>{value}</div>;
  }

  private get contentRenderer(): ReactNode {
    const { classes, multiline, textFieldRef, value, readOnly, endAdornmentIcon, isDisabled, editorType } = this.props;
    if (readOnly || editorType === EDITOR_TYPES.RICH_TEXT_EDITOR) {
      return (
        <div className={classes.flex}>
          <div className={classes.container}>{this.contentValueRenderer}</div>
          {value && (
            <div className={classes.center}>
              <IconButton
                disabled={isDisabled}
                edge="end"
                onClick={(event: ReactMouseEvent<Element>) => this.onEndAdornmentClick(event)}
                color="primary"
              >
                {endAdornmentIcon}
              </IconButton>
            </div>
          )}
        </div>
      );
    }

    const { toolTip } = this.props;
    const hasError = this.hasFocus && Boolean(toolTip);
    return (
      <AgGridTooltip arrow open={hasError} title={toolTip || ''} placement="bottom-start">
        <AgGridTextField
          inputRef={textFieldRef}
          autoFocus={true}
          value={value}
          multiline={multiline}
          disabled={isDisabled}
          onFocus={() => (this.hasFocus = true)}
          onBlur={() => (this.hasFocus = false)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" className={classes.inputAdornment}>
                <IconButton
                  disabled={isDisabled}
                  edge="end"
                  onClick={(event: ReactMouseEvent<Element>) => this.onEndAdornmentClick(event)}
                  color="primary"
                >
                  {endAdornmentIcon}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </AgGridTooltip>
    );
  }

  public render(): ReactNode {
    const { classes, popperContent, isDisabled, readOnly, hasError } = this.props;
    return (
      <>
        {this.contentRenderer}
        <Popover
          open={this.isOpen}
          anchorEl={this.toggleElement}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          onClose={() => this.onPopperCancelClick()}
        >
          <Paper className={classes.root}>
            {popperContent}
            <div className={classes.actions}>
              <PrimaryButton variant="contained" onClick={() => this.onPopperCancelClick()}>
                Cancel
              </PrimaryButton>
              {!readOnly && (
                <SecondaryButton
                  variant="contained"
                  onClick={() => this.onPopperOkClick()}
                  disabled={isDisabled || hasError}
                >
                  Ok
                </SecondaryButton>
              )}
            </div>
          </Paper>
        </Popover>
      </>
    );
  }
}

export default withStyles(styles)(AgGridPopover);
export { AgGridPopover as PureAgGridPopover };
