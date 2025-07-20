import { GRID_ACTIONS, Utilities, UIStore, baseEntitySearchFilters } from '@wings-shared/core';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore, ConfirmNavigate } from '@wings-shared/layout';
import {
  CountryModel,
  useBaseUpsertComponent,
  VIEW_MODE,
  CabotageModel,
  FlightPlanningModel,
  CustomModel,
  GeneralModel,
} from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useRef, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, Navigate } from 'react-router';
import { Route, Routes } from 'react-router-dom';
import {
  OPERATIONAL_REQUIREMENTS,
  CountryStore,
  OperationalRequirementStore,
  countrySidebarOptions,
  upsertCountryBackNavLink,
  useCountryModuleSecurity,
} from '../../../Shared';
import Cabotage from './Cabotage/Cabotage';
import General from './General/General';
import { useStyles } from './OperationalRequirements.styles';
import Custom from './Custom/Custom';
import { finalize, takeUntil } from 'rxjs/operators';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import FlightPlanning from './FlightPlanning/FlightPlanning';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { apiUrls } from '../../../Shared/Stores/API.url';

interface Props {
  sidebarStore?: typeof SidebarStore;
  countryId?: string;
  title: string;
  continentId?: string;
  operationalRequirementStore?: OperationalRequirementStore;
  countryStore?: CountryStore;
}

const OperationalRequirements: FC<Props> = ({ ...props }) => {
  const historyBasePath = useRef('');
  const location = useLocation();
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const params = useParams();
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(params, {}, baseEntitySearchFilters);
  const _useConfirmDialog = useConfirmDialog();
  const [ currentComponent, setCurrentComponent ] = useState('general');
  const [ isRowEditing, setRowEditing ] = useState(false);
  const [ isDataUpdated, setDataUpdate ] = useState(false);
  const countryModuleSecurity = useCountryModuleSecurity()
  const basePath = useMemo(() => {
    const pathList = location.pathname.split('/');
    const indexOfOR = pathList.indexOf('operational-requirements');
    setCurrentComponent(pathList[indexOfOR + 1]);
    return pathList.slice(0, indexOfOR).join('/');
  }, [ location.pathname ]);

  const countryId = params.countryId || '';

  useEffect(() => {
    props.sidebarStore?.setNavLinks(countrySidebarOptions(false, !Boolean(countryId)), basePath);
  }, []);

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
  }, []);

  const _sidebarStore = props.sidebarStore as typeof SidebarStore;

  const setFormValues = response => {
    useUpsert.form.reset();
    useUpsert.setFormValues(response);
    if (Utilities.isEqual(params.viewMode?.toUpperCase() as VIEW_MODE, VIEW_MODE.DETAILS)) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
    }
  };

  /* istanbul ignore next */
  const selectedCountry = (): CountryModel => {
    return props.countryStore?.selectedCountry as CountryModel;
  };

  const saveGeneral = () => {
    const request = new GeneralModel({
      ...useUpsert.form.values(),
      countryId: Number(params.countryId),
      id: selectedCountry().generalOperationalRequirement?.id,
    });
    UIStore.setPageLoader(true);

    props.operationalRequirementStore
      ?.upsertRequirement(request.serialize(), 'General Requirements', apiUrls.general)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: any) => {
          const _response = GeneralModel.deserialize(response);
          props.countryStore?.setSelectedCountry({
            ...selectedCountry(),
            generalOperationalRequirement: _response,
          });
          setFormValues(_response);
        },
        error: error => {
          useUpsert.showAlert(error.message, 'upsertGeneral');
        },
      });
  };

  const saveCabotage = () => {
    const formData = useUpsert.form.values();
    const _appliedRegionCabotageExemptions = Utilities.isEqual(formData?.exemptionLevel?.name?.toLowerCase(), 'region')
      ? formData.cabotageAssociatedEntities
      : [];

    const _appliedCountryCabotageExemptions = Utilities.isEqual(
      formData?.exemptionLevel?.name?.toLowerCase(),
      'country'
    )
      ? formData.cabotageAssociatedEntities
      : [];

    const request = new CabotageModel({
      ...formData,
      countryId: Number(params.countryId),
      id: selectedCountry().cabotageOperationalRequirement?.id,
      appliedRegionCabotageExemptions: _appliedRegionCabotageExemptions,
      appliedCountryCabotageExemptions: _appliedCountryCabotageExemptions,
    });

    UIStore.setPageLoader(true);

    props.operationalRequirementStore
      ?.upsertRequirement(request.serialize(), 'Cabotage Requirements', apiUrls.cabotage)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: any) => {
          const _response = CabotageModel.deserialize(response);
          props.countryStore?.setSelectedCountry({
            ...selectedCountry(),
            cabotageOperationalRequirement: _response,
          });
          setFormValues(_response);
        },
        error: error => {
          useUpsert.showAlert(error.message, 'upsertCabotage');
        },
      });
  };

  const upsertFlightPlanning = request => {
    UIStore.setPageLoader(true);

    props.operationalRequirementStore
      ?.upsertRequirement(request.serialize(), 'Flight Planning Requirements', apiUrls.flightPlanning)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: any) => {
          const _response = FlightPlanningModel.deserialize(response);
          props.countryStore?.setSelectedCountry({
            ...selectedCountry(),
            flightPlanningOperationalRequirement: {
              ..._response,
              acasiiAdditionalInformations: _response.acasiiAdditionalInformations,
            },
          });
          setFormValues(_response);
          setDataUpdate(false);
        },
        error: error => {
          useUpsert.showAlert(error.message, 'upsertCustom');
        },
      });
  };

  const saveFlightPlanning = () => {
    const request = new FlightPlanningModel({
      ...useUpsert.form.values(),
      countryId: Number(params.countryId),
      id: selectedCountry().flightPlanningOperationalRequirement?.id,
    });
    if (request.acasiIdataIsRqrd && !Boolean(request.acasiiAdditionalInformations?.length)) {
      useUpsert.showAlert('ACAS Information are required', 'Acis');
    } else {
      upsertFlightPlanning(request);
    }
  };

  const saveCustoms = () => {
    const request = new CustomModel({
      ...useUpsert.form.values(),
      countryId: Number(params.countryId),
      id: selectedCountry().customsOperationalRequirement?.id,
    });
    UIStore.setPageLoader(true);

    props.operationalRequirementStore
      ?.upsertRequirement(request.serialize(), 'Custom Requirements', apiUrls.customs)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: any) => {
          const _response = CustomModel.deserialize(response);
          props.countryStore?.setSelectedCountry({
            ...selectedCountry(),
            customsOperationalRequirement: _response,
          });
          setFormValues(_response);
        },
        error: error => {
          useUpsert.showAlert(error.message, 'upsertCustom');
        },
      });
  };

  const saveChanges = () => {
    switch (currentComponent) {
      case OPERATIONAL_REQUIREMENTS.GENERAL:
        saveGeneral();
        break;
      case OPERATIONAL_REQUIREMENTS.CABOTAGE:
        saveCabotage();
        break;
      case OPERATIONAL_REQUIREMENTS.FLIGHT_PLANNING:
        saveFlightPlanning();
        break;
      case OPERATIONAL_REQUIREMENTS.CUSTOMS:
        saveCustoms();
        break;
    }
  };

  const formReset = () => {
    useUpsert.form.reset();
    switch (currentComponent) {
      case OPERATIONAL_REQUIREMENTS.GENERAL:
        useUpsert.setFormValues(selectedCountry().generalOperationalRequirement || new GeneralModel());
        break;
      case OPERATIONAL_REQUIREMENTS.CABOTAGE:
        useUpsert.setFormValues(selectedCountry().cabotageOperationalRequirement || new CabotageModel());
        break;
      case OPERATIONAL_REQUIREMENTS.FLIGHT_PLANNING:
        useUpsert.setFormValues(selectedCountry().flightPlanningOperationalRequirement || new FlightPlanningModel());
        break;
      case OPERATIONAL_REQUIREMENTS.CUSTOMS:
        useUpsert.setFormValues(selectedCountry().customsOperationalRequirement || new CustomModel());
        break;
    }
  };

  const onConfirmation = () => {
    formReset();
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    ModalStore.close();
    return;
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        saveChanges();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode?.toUpperCase() as VIEW_MODE, VIEW_MODE.DETAILS)) {
          if (useUpsert.form.touched || useUpsert.form.changed) {
            _useConfirmDialog.confirmAction(() => onConfirmation(), {});
            return;
          }
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(upsertCountryBackNavLink(params.continentId || ''));
        break;
    }
  };

  const updateRowEditing = (isEditing: boolean): void => {
    setRowEditing(isEditing);
  };

  const updateData = (dataUpdated: boolean): void => {
    setDataUpdate(dataUpdated);
  };

  const disableAction = () => {
    if (isRowEditing) {
      return true;
    }
    if (isDataUpdated) {
      return useUpsert.form.hasError || UIStore.pageLoading || !isDataUpdated;
    }
    return useUpsert.isActionDisabled;
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={props.title}
        backNavTitle="Countries Details"
        disableActions={disableAction()}
        isEditMode={useUpsert.isEditView}
        onAction={onAction}
        backNavLink={`/${historyBasePath.current}`}
        hasEditPermission={countryModuleSecurity.isEditable}
        showBreadcrumb={true}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched || useUpsert.form.changed}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditView}
        classes={{
          root: classes.root,
          container: classes.editorWrapperContainer,
          headerActionsEditMode: classes.headerActionsEditMode,
        }}
        isBreadCrumb={true}
      >
        <Routes>
          <Route path="general" element={<General useUpsert={useUpsert} />} />
          <Route path="cabotage" element={<Cabotage useUpsert={useUpsert} key="cabotage" />} />
          <Route
            path="flight-planning"
            element={
              <FlightPlanning
                useUpsert={useUpsert}
                onRowEditingChange={isEditing => updateRowEditing(isEditing)}
                onFlightPlanningUpdate={dataUpdate => updateData(dataUpdate)}
              />
            }
          />
          <Route path="customs" element={<Custom useUpsert={useUpsert} key="customs" />} />
          <Route path="*" element={<Navigate to="general" />} />
        </Routes>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject(
  'sidebarStore',
  'operationalRequirementStore',
  'countryStore'
)(observer(OperationalRequirements)) as FC<Props>;
