import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  EtpPenaltyModel,
  EtpScenarioDetailModel,
  EtpScenarioModel,
  EtpScenarioStore,
  EtpSettingsStore,
  SettingsStore,
  useAircraftModuleSecurity,
} from '../../../Shared';
import { observable } from 'mobx';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import EtpScenarioEditor from '../EtpScenarioEditor/EtpScenarioEditor';
import { useStyles } from './EtpScenarioDetailDialog.style';
import { forkJoin } from 'rxjs';
import { UIStore, ViewPermission, baseEntitySearchFilters } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { fields } from '../EtpScenarioEditor/Fields';

interface Props {
  viewMode?: VIEW_MODE;
  etpScenarioId: number;
  etpScenarioStore: EtpScenarioStore;
  etpSettingsStore: EtpSettingsStore;
  settingsStore: SettingsStore;
  onModelUpdate: (etpScenario: EtpScenarioModel) => void;
}
const EtpScenarioDetailDialog = ({
  viewMode,
  etpScenarioId,
  etpScenarioStore,
  etpSettingsStore,
  settingsStore,
  onModelUpdate,
}) => {
  const classes = useStyles();
  const [ viewModes, setViewMode ] = useState(viewMode);
  const useUpsert = useBaseUpsertComponent<EtpScenarioDetailModel>(viewModes, fields, baseEntitySearchFilters);
  const etpScenarioEditorRef = useRef<typeof EtpScenarioEditor>();
  const unsubscribe = useUnsubscribe();
  const _etpSettingsStore = etpSettingsStore as EtpSettingsStore;
  const _etpScenarioStore = etpScenarioStore as EtpScenarioStore;
  const _settingsStore = settingsStore as SettingsStore;
  const [ etpScenarioDetailModels, setEtpScenarioDetailModels ] = useState<EtpScenarioDetailModel>();
  const etpScenarioDetail = observable({
    data: new EtpScenarioDetailModel(),
  });
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    forkJoin([
      _etpScenarioStore.getEtpScenarioById(etpScenarioId),
      _etpSettingsStore.loadEtpSettings(),
      _settingsStore.getWeightUOMs(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ etpScenarioDetailModel ]) => {
        etpScenarioDetail.data = mapEtpScenarioDetail(etpScenarioDetailModel);
        setEtpScenarioDetailModels(new EtpScenarioDetailModel(etpScenarioDetail.data));
      });
  };

  /* istanbul ignore next */
  const mapEtpScenarioDetail = (etpScenarioDetailModel: EtpScenarioDetailModel): EtpScenarioDetailModel => {
    const { etpPenalties } = etpScenarioDetailModel;
    const { ETPPenaltyCategories } = _etpSettingsStore;
    etpScenarioDetailModel.etpPenalties = ETPPenaltyCategories.map(
      x => new EtpPenaltyModel({ ...etpPenalties.find(y => y.etpPenaltyCategory?.id === x.id), etpPenaltyCategory: x })
    );
    return etpScenarioDetailModel;
  };

  const hasError = (): boolean => {
    const { current } = etpScenarioEditorRef;
    return current ? current.hasError : true;
  };

  /* istanbul ignore next */
  const updateEtpScenarioDetailModel = (): void => {
    UIStore.setPageLoader(true);
    _etpScenarioStore
      .upsertEtpScenarioDetail(etpScenarioDetailModels as any)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          onModelUpdate(Object.assign(new EtpScenarioModel(), response));
          ModalStore.close();
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const isEditMode = (): boolean => {
    return viewModes === VIEW_MODE.EDIT;
  };

  const dialogActions = (): ReactNode => {
    if (isEditMode()) {
      return (
        <>
          <PrimaryButton
            variant="outlined"
            onClick={() => {
              setEtpScenarioDetailModels(new EtpScenarioDetailModel(etpScenarioDetail.data));
              etpScenarioEditorRef.current?.setInitialFormValues(etpScenarioDetailModels);
              useUpsert.onCancel(etpScenarioDetailModels);
              ModalStore.close();
            }}
            disabled={UIStore.pageLoading}
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            variant="contained"
            onClick={() => updateEtpScenarioDetailModel()}
            disabled={ UIStore.pageLoading||useUpsert.form.hasError || useUpsert.form.changed}
          >
            Save
          </PrimaryButton>
        </>
      );
    }

    return (
      <ViewPermission hasPermission={aircraftModuleSecurity.isEditable}>
        <PrimaryButton variant="contained" onClick={() => setViewMode(VIEW_MODE.EDIT)}>
          Edit
        </PrimaryButton>
      </ViewPermission>
    );
  };

  const dialogTitle = (): string => {
    if (etpScenarioDetailModels?.id) {
      return `ETP Scenario - ${etpScenarioDetailModels?.etpScenarioNumber}`;
    }
    return '';
  };

  return (
    <Dialog
      title={dialogTitle()}
      open={true}
      isLoading={() => UIStore.pageLoading}
      classes={{
        paperSize: classes.paperSize,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() =>
        etpScenarioDetailModels?.id && (
          <EtpScenarioEditor
            ref={etpScenarioEditorRef}
            viewMode={viewModes}
            etpScenarioDetailModel={etpScenarioDetailModels}
            etpScenarioStore={_etpScenarioStore}
            etpSettingsStore={_etpSettingsStore}
            settingsStore={_settingsStore}
            onChange={etpScenarioDetailModel => {
              setEtpScenarioDetailModels(etpScenarioDetailModel);
              useUpsert.setFormValues(etpScenarioDetailModel);
            }}
          />
        )
      }
      dialogActions={() => dialogActions()}
    />
  );
};

export default EtpScenarioDetailDialog;
