import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { AlertStore } from '@uvgo-shared/alert';
import { VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { EtpScenarioStore, EtpSettingsStore, SettingsStore } from '../../../Shared/Stores';
import { EtpPenaltyModel, EtpScenarioDetailModel, updateAircraftSidebarOptions } from '../../../Shared';
import { useStyles } from './AddEtpScenario.style';
import { ArrowBack } from '@material-ui/icons';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useNavigate } from 'react-router';
import { UIStore } from '@wings-shared/core';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import EtpScenarioEditor from '../EtpScenarioEditor/EtpScenarioEditor';

interface Props {
  etpScenarioStore?: EtpScenarioStore;
  etpSettingsStore?: EtpSettingsStore;
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const AddEtpScenario: FC<Props> = ({ settingsStore, etpScenarioStore, etpSettingsStore, sidebarStore }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  const _etpScenarioStore = etpScenarioStore as EtpScenarioStore;
  const _etpSettingsStore = etpSettingsStore as EtpSettingsStore;
  const _settingsStore = settingsStore as SettingsStore;
  const [ etpScenarioDetailModel, setEtpScenarioDetailModel ] = useState<EtpScenarioDetailModel>();
  const etpScenarioEditorRef = useRef<typeof EtpScenarioEditor>();
  const [ hasError, setHasError ] = useState(etpScenarioEditorRef.current?.hasError);

  // Load Data on Mount
  useEffect(() => {
    sidebarStore?.setNavLinks(updateAircraftSidebarOptions('ETP Scenario'), 'aircraft');
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _etpSettingsStore.loadEtpSettings(), _settingsStore.getWeightUOMs() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(() => setEtpScenarioDetailModel(etpScenarioDetailTemplate()));
  };

  const etpScenarioDetailTemplate = (): EtpScenarioDetailModel => {
    return new EtpScenarioDetailModel({
      id: 0,
      etpPenalties: getEtpPenalties(),
    });
  };

  const getEtpPenalties = (): EtpPenaltyModel[] => {
    return _etpSettingsStore.ETPPenaltyCategories.map(
      etpPenaltyCategory => new EtpPenaltyModel({ etpPenaltyCategory })
    );
  };

  const addEtpScenario = (): void => {
    UIStore.setPageLoader(true);
    _etpScenarioStore
      .upsertEtpScenarioDetail(etpScenarioDetailModel as EtpScenarioDetailModel)
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(unsubscribe.destroy$),
        tap(() => navigate('/aircraft/etp-scenario'))
      )
      .subscribe({
        error: error => AlertStore.critical(error.message),
      });
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <CustomLinkButton to="/aircraft/etp-scenario" title="ETP Scenarios" startIcon={<ArrowBack />} />
        <PrimaryButton variant="contained" disabled={hasError} onClick={() => addEtpScenario()}>
          Save
        </PrimaryButton>
      </div>
      <EtpScenarioEditor
        ref={etpScenarioEditorRef}
        viewMode={VIEW_MODE.NEW}
        etpScenarioDetailModel={etpScenarioDetailModel as EtpScenarioDetailModel}
        etpScenarioStore={_etpScenarioStore}
        etpSettingsStore={_etpSettingsStore}
        settingsStore={_settingsStore}
        onChange={updatedModel => {
          setEtpScenarioDetailModel(updatedModel);
        }}
        isSaveEnabled={updatedModel => {
          setHasError(updatedModel);
        }}
      />
    </div>
  );
};

export default inject(
  'etpScenarioStore',
  'etpSettingsStore',
  'settingsStore',
  'sidebarStore'
)(observer(AddEtpScenario));
