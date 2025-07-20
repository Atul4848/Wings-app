import React, { FC, ReactElement } from 'react';
import { AxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { Dialog } from '@uvgo-shared/dialog';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useBaseUpsertComponent } from '@wings/shared';
import { EditSaveButtons } from '@wings-shared/layout';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AirportDataExportModel, AirportSettingsStore, AirportStore } from '../../Shared';
import { ViewInputControl, EDITOR_TYPES } from '@wings-shared/form-controls';
import { UIStore, GRID_ACTIONS, baseEntitySearchFilters } from '@wings-shared/core';

interface Props {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  onSaveAction: (response: AirportDataExportModel) => void;
}

const UpsertAirportDataDialog: FC<Props> = ({ ...props }: Props) => {
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent(
    params,
    {
      airportDataExportReportTypes: {
        label: 'Report Types',
        rules: 'required',
        value: [],
      },
    },
    baseEntitySearchFilters
  );
  const _airportStore = props.airportStore as AirportStore;
  const _airportSettingStore = props.airportSettingsStore as AirportSettingsStore;

  const onAction = (action: GRID_ACTIONS): void => {
    if (action !== GRID_ACTIONS.SAVE) {
      ModalStore.close();
      return;
    }
    const _request = new AirportDataExportModel({
      ...useUpsert.form.values(),
    });
    UIStore.setPageLoader(true);
    _airportStore
      .upsertAirportDataExport(_request.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: (response: AirportDataExportModel) => props.onSaveAction(response),
        error: (error: AxiosError) => AlertStore.info(error.message),
      });
  };

  const dialogContent = (): ReactElement => {
    return (
      <ViewInputControl
        type={EDITOR_TYPES.DROPDOWN}
        isDisabled={UIStore.pageLoading}
        multiple={true}
        isEditable={true}
        field={useUpsert.getField('airportDataExportReportTypes')}
        options={_airportSettingStore.reportTypes}
        onFocus={() => _airportSettingStore.loadReportTypes().subscribe()}
        onValueChange={useUpsert.onValueChange}
      />
    );
  };

  return (
    <Dialog
      title="Airport Data Export"
      open={true}
      onClose={() => ModalStore.close()}
      dialogContent={dialogContent}
      dialogActions={() => (
        <EditSaveButtons
          disabled={!useUpsert.form.changed || useUpsert.form.hasError || UIStore.pageLoading}
          hasEditPermission={true}
          isEditMode={true}
          onAction={onAction}
        />
      )}
    />
  );
};

export default UpsertAirportDataDialog;
