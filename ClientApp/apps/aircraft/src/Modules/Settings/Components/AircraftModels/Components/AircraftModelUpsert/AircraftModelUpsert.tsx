import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { ViewInputControl } from '@wings-shared/form-controls';
import { observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { fields } from './Fields';
import { useStyles } from './AircraftModelUpsert.styles';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { AircraftModel, AircraftModelMakeModel, SettingsStore } from '../../../../../index';
import { AircraftModelMakeMasterDetail } from '../index';
import { AxiosError } from 'axios';
import { takeUntil, finalize } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { IClasses, UIStore, Utilities, baseEntitySearchFilters } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  settingsStore?: SettingsStore;
  model?: AircraftModel;
  onUpsert?: (response: AircraftModel) => void;
}

const AircraftModelUpsert: FC<Props> = ({ ...props }) => {
  const [ isRowEditing, setIsRowEditing ] = useState(false);
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<AircraftModel>(props, fields, baseEntitySearchFilters);
  const _classes = useStyles();
  const _settingsStore = props.settingsStore as SettingsStore;
  const modelMakes = useUpsert.getField('modelMakes').value;
  const _model = props.model as AircraftModel;
  const isExist = (): boolean => {
    const { name } = useUpsert.form.values();
    return _settingsStore.aircraftModels.some(x => Utilities.isEqual(x.name, name) && x.id !== _model.id);
  };
  const hasError = useUpsert.form.hasError || isRowEditing || isExist();

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setFormValues(_model);
  }, []);

  /* istanbul ignore next */
  const upsertAircraftModel = (): void => {
    const model = new AircraftModel({ ..._model, ...useUpsert.form.values() });
    UIStore.setPageLoader(true);
    props.settingsStore
      ?.upsertAircraftModel(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AircraftModel) => {
          props.onUpsert && props.onUpsert(response);
          ModalStore.close();
        },
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
        },
      });
  };

  const modelMakesGrid = (): ReactNode => {
    return (
      <AircraftModelMakeMasterDetail
        settingsStore={_settingsStore}
        modelMakes={modelMakes}
        onDataSave={(modelMakes: AircraftModelMakeModel[]) => useUpsert.getField('modelMakes').set(modelMakes)}
        onRowEditing={isRowEditing => setIsRowEditing(isRowEditing)}
      />
    );
  };

  /* istanbul ignore next */
  const dialogContent = (): ReactNode => {
    return (
      <div className={props.classes?.modalDetail}>
        <ViewInputControl
          key="name"
          field={useUpsert.getField('name')}
          isEditable={useUpsert.isEditable}
          isExists={isExist()}
          onValueChange={(option, _) => useUpsert.getField('name').set(option)}
        />
        {modelMakesGrid()}
      </div>
    );
  };

  const dialogActions = (): ReactNode => {
    return (
      <>
        <PrimaryButton disabled={isRowEditing} variant="contained" onClick={() => ModalStore.close()}>
          Cancel
        </PrimaryButton>
        <SecondaryButton variant="contained" disabled={hasError} onClick={upsertAircraftModel}>
          Save
        </SecondaryButton>
      </>
    );
  };

  return (
    <Dialog
      title={`${props.viewMode === VIEW_MODE.NEW ? 'Add' : 'Edit'} Aircraft Model`}
      open={true}
      classes={{
        paperSize: _classes.paperSize,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={dialogContent}
      dialogActions={dialogActions}
    />
  );
};

export default observer(AircraftModelUpsert);
