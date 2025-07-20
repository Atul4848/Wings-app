import React, { FC, ReactNode, useEffect, useState } from 'react';
import { ModelStatusOptions, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import {
  EtpPolicyStore,
  SettingsStore,
  EtpScenarioStore,
  EtpPolicyModel,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
} from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import {
  UIStore,
  GRID_ACTIONS,
  baseEntitySearchFilters,
  Utilities,
  SettingsTypeModel,
  ISelectOption,
} from '@wings-shared/core';
import { CustomLinkButton, EditSaveButtons, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useNavigate, useParams } from 'react-router';
import { fields } from './Fields';
import { observable } from 'mobx';
import { AlertStore } from '@uvgo-shared/alert';
import { useStyles } from './EtpPolicyEditor.style';
import {
  AuditFields,
  EDITOR_TYPES,
  IGroupInputControls,
  IViewInputControl,
  ViewInputControl,
} from '@wings-shared/form-controls';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { Chip, Typography } from '@material-ui/core';
import classNames from 'classnames';
import { ArrowBack } from '@material-ui/icons';

interface Props {
  etpPolicyStore?: EtpPolicyStore;
  settingsStore?: SettingsStore;
  etpScenarioStore?: EtpScenarioStore;
  sidebarStore?: typeof SidebarStore;
}

const EtpPolicyEditor: FC<Props> = ({ etpPolicyStore, settingsStore, etpScenarioStore, sidebarStore }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<EtpPolicyModel>(params, fields, baseEntitySearchFilters);
  const _etpPolicyStore = etpPolicyStore as EtpPolicyStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _etpScenarioStore = etpScenarioStore as EtpScenarioStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const [ etpPolicys, seteEtpPolicys ] = useState(new EtpPolicyModel());
  const etpPolicyId = params?.id;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  useEffect(() => {
    useUpsert.setViewMode((params.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    _sidebarStore?.setNavLinks(updateAircraftSidebarOptions('ETP Policy'), 'aircraft');
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([
      getEtpPolicyById(),
      _etpPolicyStore.getEtpPolicies(),
      _settingsStore.getAccessLevels(),
      _settingsStore.getSourceTypes(),
      _etpScenarioStore.getEtpScenarios(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ etpPolicy ]) => {
        useUpsert.setFormValues(etpPolicy as any);
        seteEtpPolicys(etpPolicy);
      });
  };

  const getEtpPolicyById = (): Observable<EtpPolicyModel> => {
    if (!etpPolicyId) {
      return of(etpPolicys);
    }
    return _etpPolicyStore.getEtpPolicyById(etpPolicyId as any);
  };

  /* istanbul ignore next */
  const upsertEtpPolicy = (): void => {
    const etpPolicy: EtpPolicyModel = getUpdatedModel();
    if (_etpPolicyStore.isAlreadyExists(etpPolicy)) {
      useUpsert.showAlert('Policy Code should be unique.', 'etpPolicyId');
      return;
    }
    UIStore.setPageLoader(true);
    _etpPolicyStore
      .upsertEtpPolicy(etpPolicy)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => navigateToEtpPolicy(),
        error: error => AlertStore.critical(error.message),
      });
  };

  const getUpdatedModel = (): EtpPolicyModel => {
    return new EtpPolicyModel({
      ...etpPolicys,
      ...useUpsert.form.values(),
    });
  };

  const onCancel = (): void => {
    const viewMode = params.mode?.toUpperCase() || VIEW_MODE.DETAILS;
    if (!Utilities.isEqual(viewMode, VIEW_MODE.DETAILS)) {
      navigateToEtpPolicy();
      return;
    }
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    useUpsert.form.reset();
    useUpsert.setFormValues(etpPolicys);
  };

  const onAction = (action: GRID_ACTIONS) => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertEtpPolicy();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel();
        break;
    }
  };

  /* istanbul ignore next */
  const navigateToEtpPolicy = (): void => {
    navigate('/aircraft/etp-policy');
  };

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: '',
      inputControls: [
        {
          fieldKey: 'code',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'etpScenarios',
          type: EDITOR_TYPES.DROPDOWN,
          options: _etpScenarioStore.etpScenarios,
          isLoading: true,
          multiple: true,
        },
        {
          fieldKey: 'description',
          type: EDITOR_TYPES.TEXT_FIELD,
          isFullFlex: true,
          multiline: true,
          rows: 5,
        },
        {
          fieldKey: 'comments',
          type: EDITOR_TYPES.TEXT_FIELD,
          isFullFlex: true,
          multiline: true,
          rows: 5,
        },
        {
          fieldKey: 'accessLevel',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.accessLevels,
          isLoading: true,
        },
        {
          fieldKey: 'sourceType',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.sourceTypes,
          isLoading: true,
        },
        {
          fieldKey: 'status',
          type: EDITOR_TYPES.DROPDOWN,
          options: ModelStatusOptions,
        },
      ],
    };
  };

  const title = (): string => {
    const { code } = useUpsert.form.values();
    return code || 'Policy Code';
  };

  const viewRenderer = (etpScenario: SettingsTypeModel[], getTagProps?: AutocompleteGetTagProps): ReactNode => {
    return etpScenario
      .sort((a, b) => Number(a.label) - Number(b.label))
      .map((etpScenario: SettingsTypeModel, index) => (
        <Chip
          classes={{ root: classes?.chip }}
          key={etpScenario.id}
          label={etpScenario.label}
          {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
        />
      ));
  };

  /* istanbul ignore next */
  const getOptionDisabled = (option: ISelectOption, value: ISelectOption[]): boolean => {
    return value?.length > 5 && !value.some(x => x.label === option?.label);
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        {!useUpsert.isEditable && (
          <CustomLinkButton to="/aircraft/etp-policy" title="ETP Policy" startIcon={<ArrowBack />} />
        )}
        <EditSaveButtons
          disabled={useUpsert.form.hasError || UIStore.pageLoading || !useUpsert.form.changed}
          hasEditPermission={aircraftModuleSecurity.isEditable}
          isEditMode={useUpsert.isEditable}
          onAction={action => onAction(action)}
        />
      </>
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
      <div className={classes.container}>
        <Typography className={classes.typography} variant="h5">
          {title()}
        </Typography>
        <div className={classes.flexWrap}>
          {groupInputControls()
            .inputControls.filter(inputControl => !inputControl.isHidden)
            .map((inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                field={useUpsert.getField(inputControl.fieldKey || '')}
                isEditable={useUpsert.isEditable}
                getOptionDisabled={(option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => {
                  return getOptionDisabled(option, selectedOption as ISelectOption[]);
                }}
                classes={{
                  flexRow: classNames({
                    [classes.inputControl]: true,
                    [classes.fullFlex]: inputControl.isFullFlex,
                  }),
                  autoCompleteInputRoot: classNames({
                    [classes.autoCompleteInputRoot]: inputControl.multiple,
                  }),
                }}
                renderTags={(values, getTagProps: AutocompleteGetTagProps) =>
                  viewRenderer(values as SettingsTypeModel[], getTagProps)
                }
                onValueChange={(option, fieldKey) => useUpsert.onValueChange(option, inputControl.fieldKey || '')}
              />
            ))}
        </div>
        <AuditFields
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          isNew={useUpsert.isAddNew}
        />
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject(
  'etpPolicyStore',
  'settingsStore',
  'etpScenarioStore',
  'sidebarStore'
)(observer(EtpPolicyEditor));
