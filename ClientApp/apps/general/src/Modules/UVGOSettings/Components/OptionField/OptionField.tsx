import { Button } from '@material-ui/core';
import React, { FC, ReactNode, useEffect } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { useStyles } from './OptionField.style';
import { observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { UvgoSettingsStore, SettingOptionsModel, JobTypeOptions, JOB_TYPE, BoolTypeOptions } from '../../../Shared';
import { fields } from './Fields';
import classNames from 'classnames';
import { FieldTypeModel } from '@wings/notifications/src/Modules';
import { IOptionValue, ISelectOption, Utilities } from '@wings-shared/core';
import { useParams } from 'react-router';

type Props = {
  title: string;
  optionField?: SettingOptionsModel;
  viewMode?: VIEW_MODE;
  optionsField?: SettingOptionsModel[];
  upsertOptionField: (optionField: SettingOptionsModel) => void;
  uvgoSettingsStore?: UvgoSettingsStore;
};

const OptionField: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);

  useEffect(() => {
    const optionField = props.optionField as SettingOptionsModel;
    useUpsert.setFormValues(optionField);
    setValueFieldRules((optionField.type as ISelectOption)?.label);
  }, []);

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'OptionField',
      inputControls: [
        {
          fieldKey: 'keyName',
          label: 'Key',
          type: EDITOR_TYPES.TEXT_FIELD,
          isExists: isExists(),
        },
        {
          fieldKey: 'type',
          label: 'Type',
          type: EDITOR_TYPES.DROPDOWN,
          options: JobTypeOptions,
        },
        {
          fieldKey: 'value',
          label: 'Value',
          type: EDITOR_TYPES.TEXT_FIELD,
          isHidden: isBoolValue(),
        },
        {
          fieldKey: 'value',
          label: 'Value',
          type: EDITOR_TYPES.DROPDOWN,
          options: BoolTypeOptions,
          isHidden: !isBoolValue(),
        },
      ],
    };
  }

  const isBoolValue = (): boolean => {
    return useUpsert.getField('type')?.value?.value === JOB_TYPE.BOOL;
  }

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    if (value && Utilities.isEqual(fieldKey, 'type')) {
      useUpsert.getField('value').set('');
      setValueFieldRules((value as ISelectOption).label);
    }
    useUpsert.getField(fieldKey).set(value);
  }

  const setValueFieldRules = (value: string): void => {
    if (Utilities.isEqual(value, JOB_TYPE.INT)) {
      useUpsert.getField('value').set('rules', 'required:true|integer|min:1|max:999999999');
    }
    if (Utilities.isEqual(value, JOB_TYPE.STRING)) {
      useUpsert.getField('value').set('rules', 'required:true|string|between:1,100');
    }
    if (Utilities.isEqual(value, JOB_TYPE.BOOL)) {
      useUpsert.getField('value').set('rules', 'required');
    }
  }

  const isExists = (): boolean => {
    const { optionField, optionsField } = props;
    const keyName = useUpsert.getField('keyName').value;
    if(!optionsField?.length){
      return false
    }
    return optionsField.some(
      t => Utilities.isEqual(t.keyName, keyName) && !Utilities.isEqual(t.keyName, optionField?.keyName || '')
    );
  }

  const dialogContent = (): ReactNode => {
    const { upsertOptionField } = props;
    return (
      <div>
        <div>
          {groupInputControls().inputControls
            .filter(inputControl => !inputControl.isHidden)
            .map((inputControl: IViewInputControl, index: number) => {
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
                        field={useUpsert.getField(inputControl.fieldKey || '')}
                        isEditable={true}
                        onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
                      />
                    </div>
                  </div>
                </>
              );
            })}
          <div className={classes.btnContainer}>
            <Button
              color="primary"
              variant="contained"
              size="small"
              disabled={useUpsert.form.hasError || isExists() || !useUpsert.form.changed}
              onClick={() => {
                const formValues = useUpsert.form.values()
                const { fieldType } = useUpsert.form.values();
                const model = new SettingOptionsModel({
                  ...props.optionField,
                  ...useUpsert.form.values(),
                  fieldType: new FieldTypeModel(fieldType),
                  value: typeof formValues?.value == 'object' ? formValues?.value?.value : formValues?.value,
                });
                upsertOptionField(model);
              }}
            >
              {useUpsert.viewMode === VIEW_MODE.NEW ? 'Create' : 'Update'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog
      title={props.title}
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.dialogWidth,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}

export default (observer(OptionField));
