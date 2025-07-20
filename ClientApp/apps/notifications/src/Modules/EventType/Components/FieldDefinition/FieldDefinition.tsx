import { Button, IconButton, InputAdornment, Tooltip, withStyles, TextField } from '@material-ui/core';
import React, { ReactNode } from 'react';
import { VIEW_MODE, BaseUpsertComponent } from '@wings/shared';
import { IClasses, IOptionValue, ISelectOption, UIStore, Utilities } from '@wings-shared/core';
import { styles } from './FieldDefinition.style';
import { observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { EventTypeStore, FieldDefinitionModel, FieldTypeModel, FieldTypeOptions, FIELD_TYPE } from '../../../Shared';
import { fields } from './Fields';
import classNames from 'classnames';
import { action, observable } from 'mobx';
import { RemoveRedEye } from '@material-ui/icons';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';

type Props = {
  classes: IClasses;
  title: string;
  fieldDefinition?: FieldDefinitionModel;
  viewMode?: VIEW_MODE;
  fieldDefinitions?: FieldDefinitionModel[];
  upsertField: (fieldDefinition: FieldDefinitionModel) => void;
  eventTypeStore?: EventTypeStore;
};

@observer
class FieldDefinition extends BaseUpsertComponent<Props, FieldDefinitionModel> {
  @observable private formattedDate: string = '';

  constructor(p: Props) {
    super(p, fields);
  }

  componentDidMount() {
    const fieldDefinition = this.props.fieldDefinition as FieldDefinitionModel;
    this.formattedDate = '';
    this.setFormValues(fieldDefinition);
  }

  /* istanbul ignore next */
  private previewDate(format: string): void {
    UIStore.setPageLoader(true);
    this.props.eventTypeStore
      ?.getPreviewDate(format)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => (this.formattedDate = response),
        error: error => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls {
    return {
      title: 'FieldDefinition',
      inputControls: [
        {
          fieldKey: 'fieldType',
          label: 'Data Type',
          type: EDITOR_TYPES.DROPDOWN,
          options: FieldTypeOptions.map(
            x => new FieldTypeModel({ id: x.value as FIELD_TYPE, name: x.label as FIELD_TYPE })
          ),
        },
        {
          fieldKey: 'context',
          label: 'Format',
          type: EDITOR_TYPES.TEXT_FIELD,
          isHidden: !this.isFieldTypeDate,
        },
        {
          fieldKey: 'displayName',
          label: 'Display Name',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'variableName',
          label: 'Variable Name',
          type: EDITOR_TYPES.TEXT_FIELD,
          isExists: this.isExists,
        },
        {
          fieldKey: 'description',
          label: 'Description',
          type: EDITOR_TYPES.TEXT_FIELD,
          multiline: true,
          rows: 5,
        },
        {
          fieldKey: 'required',
          label: 'Field required',
          type: EDITOR_TYPES.CHECKBOX,
        },
      ],
    };
  }

  private get isExists(): boolean {
    const { fieldDefinition, fieldDefinitions } = this.props;
    const variableName = this.getField('variableName').value;
    if (!fieldDefinitions?.length) {
      return false;
    }
    return fieldDefinitions.some(
      t => Utilities.isEqual(t.variableName, variableName) && !Utilities.isEqual(t.id, Number(fieldDefinition?.id))
    );
  }

  private get isFieldTypeDate(): boolean {
    const option = this.getField('fieldType')?.value as ISelectOption;
    return Utilities.isEqual(option?.value, FIELD_TYPE.DATE);
  }

  @action
  protected onValueChange(value: IOptionValue, fieldKey: string): void {
    this.getField(fieldKey).set(value);
    if (fieldKey === 'fieldType' && Utilities.isEqual((value as ISelectOption)?.value, FIELD_TYPE.DATE)) {
      this.getField('context').set('MMM. dd, yyyy');
      this.formattedDate = '';
    }

    if (fieldKey === 'context' && !value) {
      this.formattedDate = '';
    }
  }

  private get dialogContent(): ReactNode {
    const { classes, upsertField } = this.props;
    return (
      <div>
        <div>
          {this.groupInputControls.inputControls
            .filter(inputControl => !inputControl.isHidden)
            .map((inputControl: IViewInputControl, index: number) => {
              if (inputControl.fieldKey === 'context') {
                return (
                  <>
                    <div className={classes.formatContainer}>
                      <div>
                        <ViewInputControl
                          {...inputControl}
                          key={index}
                          isExists={inputControl.isExists}
                          classes={{
                            flexRow: classNames([ classes.inputControl ]),
                          }}
                          field={this.getField(inputControl.fieldKey)}
                          isEditable={this.isEditable}
                          onValueChange={(option, fieldKey) => this.onValueChange(option, fieldKey)}
                        />
                      </div>
                      <div className={classes.adornmentField}>
                        <TextField
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {
                                  <Tooltip title="Preview Date">
                                    <IconButton
                                      edge="end"
                                      onClick={() => this.previewDate(this.getField('context').value)}
                                    >
                                      <RemoveRedEye fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                }
                              </InputAdornment>
                            ),
                          }}
                          value={this.formattedDate}
                          disabled
                        />
                      </div>
                    </div>
                  </>
                );
              }
              return (
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  isExists={inputControl.isExists}
                  field={this.getField(inputControl.fieldKey || '')}
                  isEditable={this.isEditable}
                  onValueChange={(option, fieldKey) => this.onValueChange(option, fieldKey)}
                />
              );
            })}
          <div className={classes.btnContainer}>
            <Button
              color="primary"
              variant="contained"
              size="small"
              disabled={this.form.hasError || this.isExists}
              onClick={() => {
                const { fieldType } = this.form.values();
                const model = new FieldDefinitionModel({
                  ...this.props.fieldDefinition,
                  ...this.form.values(),
                  fieldType: new FieldTypeModel(fieldType),
                });
                upsertField(model);
              }}
            >
              {this.props.viewMode === VIEW_MODE.NEW ? 'Create' : 'Update'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  public render(): ReactNode {
    const { classes, title } = this.props;
    return (
      <Dialog
        title={title}
        open={true}
        classes={{
          dialogWrapper: classes.modalRoot,
          paperSize: classes.dialogWidth,
          header: classes.headerWrapper,
          content: classes.content,
        }}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
      />
    );
  }
}
export default withStyles(styles)(FieldDefinition);
export { FieldDefinition as PureFieldDefinition };
