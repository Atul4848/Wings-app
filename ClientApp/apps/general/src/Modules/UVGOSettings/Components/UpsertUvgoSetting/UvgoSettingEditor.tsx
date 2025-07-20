import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { inject, observer } from 'mobx-react';
import { UvgoSettingsStore, UvgoSettings, SettingOptionsModel } from '../../../Shared';
import { fields } from './Fields';
import { observable } from 'mobx';
import { useStyles } from './UvgoSettingEditor.style';
import { AreaTypeOptions, SettingTypeOptions } from '../../../Shared/fields';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IClasses, IOptionValue, UIStore, Utilities, regex, GRID_ACTIONS } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { DetailsEditorWrapper, EditSaveButtons, Collapsable } from '@wings-shared/layout';
import OptionFieldGrid from '../OptionFieldGrid/OptionFieldGrid';
import OptionField from '../OptionField/OptionField';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  params?: { mode: VIEW_MODE; id: string };
  uvgoSettingsStore?: UvgoSettingsStore;
  navigate?: NavigateFunction;
};

const UvgoSettingEditor: FC<Props> = ({ ...props }: Props) => {
  const [ uvgoSetting, setUvgoSetting ] = useState(new UvgoSettings({ id: '' }));
  const localStates = observable({ isCronExpressionValid: false });
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!uvgoSettingId()) {
      useUpsert.setFormValues(uvgoSetting);
      return;
    }
    UIStore.setPageLoader(true);
    const { uvgoSettingsStore } = props;
    uvgoSettingsStore
      ?.getUvgoSetting(uvgoSettingId())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(uvgoSetting => {
        uvgoSetting = new UvgoSettings(uvgoSetting);
        props.uvgoSettingsStore?.setOptionsField(uvgoSetting.options);
        useUpsert.setFormValues(uvgoSetting);
        return;
      });
  }, []);

  const upsertUvgoSettings = (): void => {
    UIStore.setPageLoader(true);
    props.uvgoSettingsStore
      ?.upsertUvgoSettings(getUpsertUvgoSetting(), useUpsert.viewMode == VIEW_MODE.NEW)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => navigateToUvgoSettings(),
        error: error => AlertStore.critical(error.message),
      });
  }

  const getUpsertUvgoSetting = (): UvgoSettings =>{
    const formValues: UvgoSettings = useUpsert.form.values();
    const uvGOSetting = new UvgoSettings({
      ...uvgoSetting,
      ...formValues,
      options: props.uvgoSettingsStore?.optionsField,
    });
    return uvGOSetting;
  }

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'UvgoSetting',
      inputControls: [
        {
          fieldKey: 'id',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: useUpsert.viewMode == VIEW_MODE.NEW ? false : true,
          isExists: isExists(),
        },
        {
          fieldKey: 'assemblyName',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'name',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'area',
          type: EDITOR_TYPES.DROPDOWN,
          autoSelect: false,
          options: AreaTypeOptions,
        },
        {
          fieldKey: 'settingType',
          type: EDITOR_TYPES.DROPDOWN,
          autoSelect: false,
          options: SettingTypeOptions,
          isDisabled: useUpsert.viewMode == VIEW_MODE.EDIT,
        },
        {
          fieldKey: 'description',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'cronExpression',
          type: EDITOR_TYPES.TEXT_FIELD,
          isHidden: !cronExpressionHidden(),
          customErrorMessage: localStates.isCronExpressionValid ? 'The CronExpression format is invalid.' : '',
        },
      ],
    };
  }

  const hasError = (): boolean => {
    return useUpsert.form.hasError || UIStore.pageLoading || localStates.isCronExpressionValid;
  }

  const uvgoSettingId = (): string => {
    const { id } = params;
    return id ? id || '' : null;
  }

  const isExists = (): boolean => {
    const id = useUpsert.getField('id').value;
    if(!props.uvgoSettingsStore){
      return false
    }
    return props.uvgoSettingsStore.uvgoSetting.some(
      t => Utilities.isEqual(t.id, id) && !Utilities.isEqual(t.id, uvgoSettingId())
    );
  }

  const cronExpressionHidden = (): boolean => {
    return useUpsert.getField('settingType')?.value?.value === 'Recurring';
  }

  const onAction = (action: GRID_ACTIONS): void => {
    if (action === GRID_ACTIONS.CANCEL) {
      navigateToUvgoSettings();
      return;
    }
    upsertUvgoSettings();
  }

  const upsertOptionField = (optionField: SettingOptionsModel) => {
    if (optionField.id) {
      props.uvgoSettingsStore?.setOptionsField(
        props.uvgoSettingsStore?.optionsField.map(x => (x.id === optionField.id ? optionField : x))
      );
      ModalStore.close();
      return;
    }

    optionField.id = Utilities.getTempId(true);
    props.uvgoSettingsStore?.setOptionsField([ ...props.uvgoSettingsStore?.optionsField, optionField ]);
    ModalStore.close();
  }

  const deleteOptionField = (id: number) => {
    props.uvgoSettingsStore?.setOptionsField(
      props.uvgoSettingsStore?.optionsField.filter(field => !Utilities.isEqual(field.id, id))
    );
    ModalStore.close();
  }

  const navigateToUvgoSettings = (): void => {
    navigate && navigate('/general/uvgo-settings');
  }

  const headerActions = (): ReactNode => {
    return (
      <div className={classes.headerActions}>
        <EditSaveButtons
          disabled={useUpsert.form.hasError || UIStore.pageLoading || isExists() || hasError()}
          hasEditPermission={true}
          isEditMode={true}
          onAction={action => onAction(action)}
        /></div>
    );
  }

  const openOptionFieldDialog = (optionField: SettingOptionsModel, viewMode: VIEW_MODE): void => {
    ModalStore.open(
      <OptionField
        title={viewMode === VIEW_MODE.NEW ? 'Add Option' : 'Edit Option'}
        optionField={optionField}
        viewMode={viewMode}
        upsertOptionField={optionField => upsertOptionField(optionField)}
        optionsField={props.uvgoSettingsStore?.optionsField}
        uvgoSettingsStore={props.uvgoSettingsStore}
      />
    );
  }

  const uvGOSettingChildGrid = (): ReactNode => {
    return (
      <Collapsable title="Options">
        <OptionFieldGrid
          optionsField={props.uvgoSettingsStore?.optionsField || []}
          openOptionFieldDialog={(optionField, viewMode) => openOptionFieldDialog(optionField, viewMode)}
          upsertOptionField={optionField => upsertOptionField(optionField)}
          deleteOptionField={(id: number) => deleteOptionField(id)}
        />
      </Collapsable>
    );
  }

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    if (Utilities.isEqual(fieldKey, 'cronExpression')) {
      localStates.isCronExpressionValid = !regex.cronExpression_uvGOSetting.test(value.toString());
    }
  }

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
      <h2>{useUpsert.viewMode === VIEW_MODE.NEW ? 'Add uvGO Settings' : 'Edit uvGO Settings'}</h2>
      <div className={classes.flexRow}>
        <div className={classes.flexWrap}>
          {groupInputControls().inputControls
            .filter(inputControl => !inputControl.isHidden)
            .map((inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                isExists={inputControl.isExists}
                classes={{ flexRow: classes.fullFlex }}
                field={useUpsert.getField(inputControl.fieldKey || '')}
                isEditable={true}
                onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
              />
            ))}
        </div>
        <div>{uvGOSettingChildGrid()}</div>
      </div>
    </DetailsEditorWrapper>
  );
}

export default inject('uvgoSettingsStore')(observer(UvgoSettingEditor));