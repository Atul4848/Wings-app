import React, { ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { inject, observer } from 'mobx-react';
import { Observable, forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  FlightPlanningServiceStore,
  SettingsStore,
  RegistryAssociationDetailModel,
  RegistryAssociationModel,
  FlightPlanningServiceModel,
  useAircraftModuleSecurity,
} from '../../Shared';
import { fields } from './Fields';
import { UIStore, ViewPermission, SettingsTypeModel, baseEntitySearchFilters } from '@wings-shared/core';
import classNames from 'classnames';
import { Paper } from '@material-ui/core';
import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { Collapsable } from '@wings-shared/layout';
import { useStyles } from './RegistryAssociationDetails.style';
import { useUnsubscribe } from '@wings-shared/hooks';
import { observable } from 'mobx';

interface Props {
  registryAssociationModel: RegistryAssociationModel;
  registryDetailModel?: RegistryAssociationDetailModel;
  flightPlanningServiceStore?: FlightPlanningServiceStore;
  settingsStore?: SettingsStore;
  viewMode: VIEW_MODE;
  flightPlanningServiceModel: FlightPlanningServiceModel;
  onUpsertDetail: (model: RegistryAssociationDetailModel) => Observable<void>;
}

const RegistryAssociationDetails = ({
  registryAssociationModel,
  registryDetailModel,
  flightPlanningServiceStore,
  settingsStore,
  viewMode,
  flightPlanningServiceModel,
  onUpsertDetail,
  data,
}) => {
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const _flightPlanningServiceStore = flightPlanningServiceStore as FlightPlanningServiceStore;
  const _settingsStore = settingsStore as SettingsStore;
  const [ viewModes, setViewMode ] = useState(viewMode);
  const [ registryDetailId, setRegistryDetailId ] = useState(0);
  const registrySubHeader = observable({
    data: 'Departure (B) Destination (L) Destination Alternate (B)',
  });
  const aircraftModuleSecurity = useAircraftModuleSecurity();
  const useUpsert = useBaseUpsertComponent<RegistryAssociationDetailModel>(viewModes, fields, baseEntitySearchFilters);

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const subTitle = (departure: string, destination: string, destinationAlternate: string): string => {
    const departureCode = departure?.charAt(0);
    const destinationCode = destination?.charAt(0);
    const destinationAlternateCode = destinationAlternate?.charAt(0);

    return `Departure (${departureCode}) 
            Destination (${destinationCode}) 
             Destination Alternate (${destinationAlternateCode})`;
  };

  /* istanbul ignore next */
  const fetchRegistryDetail = (id): void => {
    _flightPlanningServiceStore
      .getRegistryAssociationDetail(id.customersWithNonStandardRunwayAnalysisRegistryOptionId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: RegistryAssociationDetailModel) => {
          useUpsert.form.set(response);
          setRegistryDetailId( response?.id);
          const { departure, destination, destinationAlternate } = response;
          registrySubHeader.data = subTitle(departure?.name, destination?.name, destinationAlternate?.name);
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const loadInitialData = () => {
    // eslint-disable-next-line max-len
    const option = registryAssociationModel?.customersWithNonStandardRunwayAnalysisRegistryOption as RegistryAssociationDetailModel;
    UIStore.setPageLoader(true);

    forkJoin([ _settingsStore?.getRunwayAnalysisType(), _settingsStore?.getDeliveryPackageType() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {})
      )
      .subscribe({
        next: ([ runwayAnalysisType ]: [SettingsTypeModel[]]) => {
          if (option?.customersWithNonStandardRunwayAnalysisRegistryOptionId) {
            fetchRegistryDetail(registryAssociationModel?.customersWithNonStandardRunwayAnalysisRegistryOption);
            return;
          }
          const bothValue = runwayAnalysisType.find(x => x.name == 'Both');
          const noneValue = runwayAnalysisType.find(x => x.name == 'None');
          const landingValue = runwayAnalysisType.find(x => x.name == 'Landing');
          useUpsert.form.set({
            departure: bothValue,
            destination: landingValue,
            destinationAlternate: bothValue,
            takeoffAlternate: noneValue,
            reclearDestination: noneValue,
            reclearAlternate: noneValue,
            etp: noneValue,
            etops: noneValue,
            pointOfSafeReturn: noneValue,
          });
          UIStore.setPageLoader(false);
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'Runway Analysis',
        inputControls: [
          {
            fieldKey: 'deliveryPackageType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore?.deliveryPackageType,
          },
        ],
      },
      {
        title: 'Airport and Analysis Types',
        subTitle: registrySubHeader.data,
        inputControls: [
          {
            fieldKey: 'departure',
            type: EDITOR_TYPES.DROPDOWN,
            isHalfFlex: true,
            options: _settingsStore?.runwayAnalysisType,
          },
          {
            fieldKey: 'destination',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore?.runwayAnalysisType,
            isHalfFlex: true,
          },
          {
            fieldKey: 'destinationAlternate',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore?.runwayAnalysisType,
            isHalfFlex: true,
          },
          {
            fieldKey: 'takeoffAlternate',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore?.runwayAnalysisType,
            isHalfFlex: true,
          },
          {
            fieldKey: 'reclearDestination',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore?.runwayAnalysisType,
            isHalfFlex: true,
          },
          {
            fieldKey: 'reclearAlternate',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore?.runwayAnalysisType,
            isHalfFlex: true,
          },
          {
            fieldKey: 'etp',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore?.runwayAnalysisType,
            isHalfFlex: true,
          },
          {
            fieldKey: 'etops',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore?.runwayAnalysisType,
            isHalfFlex: true,
          },
          {
            fieldKey: 'pointOfSafeReturn',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore?.runwayAnalysisType,
            isHalfFlex: true,
          },
        ],
      },
    ];
  };

  const isEditMode = (): boolean => {
    return viewModes === VIEW_MODE.EDIT;
  };

  /* istanbul ignore next */
  const upsertRegistryDetails = (): void => {
    UIStore.setPageLoader(true);
    const registryDetail: RegistryAssociationDetailModel = new RegistryAssociationDetailModel({
      id: registryDetailId,
      customersWithNonStandardRunwayAnalysisRegistryId: registryAssociationModel.id,
      ...useUpsert.form.values(),
    });
    _flightPlanningServiceStore
      .upsertRegistryAssociationDetail(registryDetail.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: RegistryAssociationDetailModel) => {
          useUpsert.form.set(response);
          ModalStore.close();
          onUpsertDetail(response);
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const dialogActions = (): ReactNode => {
    if (isEditMode()) {
      return (
        <>
          <PrimaryButton
            variant="contained"
            onClick={() => {
              ModalStore.close();
            }}
            disabled={UIStore.pageLoading}
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            variant="contained"
            onClick={() => upsertRegistryDetails()}
            disabled={useUpsert.form.hasError || UIStore.pageLoading}
          >
            Save
          </PrimaryButton>
        </>
      );
    }

    return (
      <ViewPermission hasPermission={aircraftModuleSecurity.isEditable}>
        <PrimaryButton variant="contained" onClick={() => ((viewMode = VIEW_MODE.EDIT), setViewMode(VIEW_MODE.EDIT))}>
          Edit
        </PrimaryButton>
      </ViewPermission>
    );
  };

  const isEditable = (): boolean => {
    return viewModes === VIEW_MODE.EDIT || viewModes === VIEW_MODE.NEW;
  };

  /* istanbul ignore next */
  const dialogContent = (): ReactNode => {
    return (
      <Paper className={classes.root}>
        <div className={classes.flexContainer}>
          <div className={classes.flexRow}>
            {groupInputControls().map(({ title, inputControls, subTitle }, index) => (
              <Collapsable key={index} title={title} subTitle={subTitle}>
                <div className={classes.flexWrap}>
                  {inputControls
                    .filter(inputControl => !inputControl.isHidden)
                    .map((inputControl: IViewInputControl, index: number) => (
                      <ViewInputControl
                        {...inputControl}
                        key={index}
                        isExists={inputControl.isExists}
                        classes={{
                          flexRow: classNames({
                            [classes.halfFlex]: inputControl.isHalfFlex,
                            [classes.inputControl]: !inputControl.isHalfFlex,
                          }),
                          autoCompleteRoot: classNames({
                            [classes.labelRoot]: inputControl.isFullFlex,
                          }),
                        }}
                        customErrorMessage={inputControl.customErrorMessage}
                        field={useUpsert.getField(inputControl.fieldKey || '')}
                        isEditable={isEditable()}
                        onValueChange={(option, fieldKey) =>
                          useUpsert.onValueChange(option, inputControl.fieldKey || '')
                        }
                      />
                    ))}
                </div>
              </Collapsable>
            ))}
          </div>
        </div>
      </Paper>
    );
  };

  return (
    <Dialog
      // eslint-disable-next-line max-len
      title={`${flightPlanningServiceModel?.customerNumber?.name}-${flightPlanningServiceModel?.customerName}-${registryAssociationModel?.registry}`}
      open={true}
      isLoading={() => UIStore.pageLoading}
      classes={{
        paperSize: classes.paperSize,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => flightPlanningServiceModel && dialogContent()}
      dialogActions={() => dialogActions()}
    />
  );
};

export default inject('flightPlanningServiceStore', 'settingsStore')(observer(RegistryAssociationDetails));
