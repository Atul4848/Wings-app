import React, { ReactNode } from 'react';
import { ICellEditorReactComp } from 'ag-grid-react';
import { RowNode } from 'ag-grid-community';
import MobxReactForm from 'mobx-react-form';
import { withStyles } from '@material-ui/core';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { IBaseEditorProps } from '../../Interfaces';
import { styles } from './AgGridTextArea.styles';
import AgGridPopover from '../AgGridPopover/AgGridPopover';
import AgGridTextField from '../AgGridTextField/AgGridTextField';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import { IClasses, getFormValidation } from '@wings-shared/core';
import { EDITOR_TYPES } from '@wings-shared/form-controls';
import { ExpandIcon } from '@uvgo-shared/icons';

interface Props extends Partial<IBaseEditorProps> {
  readOnly?: boolean;
  multiline?: boolean;
  classes?: IClasses;
  editorType?: EDITOR_TYPES;
  getReadOnlyState?: (node: RowNode) => boolean;
}

@observer
class AgGridTextArea extends AgGridBaseEditor<Props> implements ICellEditorReactComp {
  static defaultProps = {
    multiline: true,
    editorType: EDITOR_TYPES.TEXT_FIELD,
  };

  @observable private form: MobxReactForm;

  constructor(props) {
    super(props);
    this.form = getFormValidation({
      field: {
        type: 'text',
        label: props.colDef.headerName,
        value: props.value,
        placeholder: props.placeholder,
        rules: props.rules,
      },
    });
  }

  // needs to access from parent component
  public get errorMessage(): string {
    const { errorSync } = this.form.$('field');
    return this.hasError ? errorSync : '';
  }

  // needs to access from parent component
  public get hasError(): boolean {
    return this.form.hasError;
  }

  public getValue(): string {
    return this.form.$('field').value;
  }

  public setValue(value: string): void {
    this.form.$('field').set(value);
    this.form.validate();
  }

  // set rules using instance
  public setRules(rules: string): void {
    this.form.$('field').set('rules', rules);
    this.form.validate();
  }

  public isCancelAfterEnd(): boolean {
    return this.form.hasError;
  }

  public refresh(params: any): boolean {
    return true;
  }

  @action
  private onPopperCancelClick(value: string): void {
    this.form.$('field').set(value || '');
  }

  @action
  private onPopperOkClick(): void {
    const { componentParent } = this.props.context;
    if (!componentParent.onInputChange) {
      return;
    }
    componentParent.onInputChange(this.props, this.form.$('field').value);
  }

  private get isReadOnly(): boolean {
    const { node, getReadOnlyState, readOnly } = this.props;
    const isCallable: boolean = typeof getReadOnlyState === 'function';
    return isCallable ? getReadOnlyState(node) : readOnly;
  }

  private get popperContent(): ReactNode {
    const { classes, multiline, editorType, value } = this.props;

    if (this.isReadOnly && editorType === EDITOR_TYPES.RICH_TEXT_EDITOR) {
      return <div className={classes.editorOuter} dangerouslySetInnerHTML={{ __html: value }} />;
    }

    const { hasError } = this.form.$('field');
    const showError: boolean = (hasError && Boolean(this.errorMessage)) || (!!value && hasError);

    return (
      <div className={classes.flexRow}>
        <AgGridTextField
          {...this.form.$('field').bind()}
          autoFocus
          variant="outlined"
          autoComplete="off"
          multiline={multiline}
          rows={5}
          error={showError}
          disabled={this.isDisable}
          inputProps={{ readOnly: this.isReadOnly }}
          helperText={this.errorMessage}
        />
      </div>
    );
  }

  public render(): ReactNode {
    const { multiline, editorType } = this.props;
    return (
      <AgGridPopover
        textFieldRef={this.textFieldRef}
        popperContent={this.popperContent}
        isDisabled={this.isDisable}
        endAdornmentIcon={<ExpandIcon />}
        onOkClick={() => this.onPopperOkClick()}
        onCancelClick={(popOverValue: string) => this.onPopperCancelClick(popOverValue)}
        value={this.form.$('field').value}
        multiline={multiline}
        readOnly={this.isReadOnly}
        editorType={editorType}
        hasError={this.hasError}
      />
    );
  }
}

export default withStyles(styles)(AgGridTextArea);
export { AgGridTextArea as PureAgGridTextArea };
