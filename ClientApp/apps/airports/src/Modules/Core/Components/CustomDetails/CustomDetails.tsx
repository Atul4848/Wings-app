import React, { FC, ReactNode, useEffect, useRef, useMemo, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { Route, Routes } from 'react-router-dom';
import { useLocation, useNavigate, useParams } from 'react-router';
import GeneralInfo from './GeneralInfo/GeneralInfo';
import { useStyles } from './CustomDetails.styles';
import {
  AirportStore,
  AirportCustomGeneralModel,
  AirportModel,
  AirportCustomDetailStore,
  CUSTOM_DETAILS,
  IntlCustomsDetailsModel,
  QuarantineOrImmigrationInfoModel,
  FeeInformationModel,
  useAirportModuleSecurity,
  CustomsDetailInfoModel,
  UsCustomsDetailsModel,
  airportSidebarOptions,
  ReimbursableServicesProgramModel,
} from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import CustomDetailsInfo from './CustomDetailsInfo/CustomDetailsInfo';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import IntlCustomsDetails from './IntlCustomsDetails/IntlCustomsDetails';
import { GRID_ACTIONS, Utilities, UIStore, baseEntitySearchFilters } from '@wings-shared/core';
import UsCustomsDetails from './UsCustomsDetails/UsCustomsDetails';
import CustomContacts from './CustomContacts/CustomContacts';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore, ConfirmNavigate } from '@wings-shared/layout';
import CustomNotes from './CustomNotes/CustomNotes';
interface Props {
  sidebarStore?: typeof SidebarStore;
  title?: string;
  airportStore?: AirportStore;
  airportCustomDetailStore?: AirportCustomDetailStore;
}

const CustomDetails: FC<Props> = ({ ...props }) => {
  const params = useParams();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const historyBasePath = useRef('');
  const unsubscribe = useUnsubscribe();
  const _useConfirmDialog = useConfirmDialog();
  const useUpsert = useBaseUpsertComponent(params, {}, baseEntitySearchFilters);
  const { isGRSUser, isEditable } = useAirportModuleSecurity();
  const _airportStore = props.airportStore as AirportStore;
  const _customDetailStore = props.airportCustomDetailStore as AirportCustomDetailStore;
  const selectedAirport: AirportModel = _airportStore.selectedAirport as AirportModel;
  const [ currentComponent, setCurrentComponent ] = useState('general');
  const [ isRowEditing, setRowEditing ] = useState(false);
  const [ isDataUpdated, setDataUpdate ] = useState(false);

  const basePath = useMemo(() => {
    const pathList = location.pathname.split('/');
    const indexOfOR = pathList.indexOf('custom-detail');
    setCurrentComponent(pathList[indexOfOR + 1]);
    return pathList.slice(0, indexOfOR).join('/');
  }, [ location.pathname ]);

  const isContactsScreen = useMemo(() => Utilities.isEqual(currentComponent, CUSTOM_DETAILS.CUSTOM_CONTACTS), [
    currentComponent,
  ]);

  const airportId = params.airportId || '';

  /* istanbul ignore next */
  useEffect(() => {
    props.sidebarStore?.setNavLinks(
      airportSidebarOptions(
        false,
        !Boolean(airportId),
        !Boolean(_airportStore.selectedAirport?.customs?.customsDetailId)
      ),
      basePath
    );
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
  }, []);

  /* istanbul ignore next */
  const setFormValues = response => {
    useUpsert.form.reset();
    useUpsert.setFormValues(response);
    if (Utilities.isEqual(params.viewMode?.toUpperCase() as VIEW_MODE, VIEW_MODE.DETAILS)) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
    }
  };

  const saveGeneral = () => {
    const request = new AirportCustomGeneralModel({
      ...useUpsert.form.values(),
      airportId: Number(params.airportId),
      id: selectedAirport?.customsGeneralInfo?.id,
    });
    UIStore.setPageLoader(true);
    _customDetailStore
      .upsertGeneral(request.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          props.airportStore?.setSelectedAirport({
            ...selectedAirport,
            customsGeneralInfo: response,
          });
          setFormValues(response);
        },
        error: error => useUpsert.showAlert(error.message, 'upsertGeneral'),
      });
  };

  const saveIntlCustomsDetails = () => {
    const { customsNonUsInfo } = selectedAirport;
    const values = useUpsert.form.values();
    const _quarantineInfo = Utilities.objectHasValues(values.quarantineInfo)
      ? new QuarantineOrImmigrationInfoModel({
        ...values.quarantineInfo,
        id: customsNonUsInfo?.quarantineInfo?.id,
      })
      : null;
    const feeInfo = Utilities.objectHasValues(values.feeInformation)
      ? new FeeInformationModel({
        ...values.feeInformation,
        id: customsNonUsInfo?.feeInformation?.id,
      })
      : null;

    const request = new IntlCustomsDetailsModel({
      ...useUpsert.form.values(),
      id: customsNonUsInfo?.id || 0,
      airportId: Number(params.airportId),
      quarantineInfo: _quarantineInfo,
      feeInformation: feeInfo,
    });
    UIStore.setPageLoader(true);
    _customDetailStore
      .upsertIntlCustomsInfo(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          _airportStore?.setSelectedAirport({
            ...selectedAirport,
            customsNonUsInfo: response,
          });
          setFormValues(response);
        },
        error: error => useUpsert.showAlert(error.message, 'upsertIntlCustomsInfo'),
      });
  };

  const saveUsCustomDetails = () => {
    const { customsUsInfo } = selectedAirport;
    const values = useUpsert.form.values();
    const reimbursableServicesProgramInfo = Utilities.objectHasValues(values.reimbursableServicesProgram)
      ? new ReimbursableServicesProgramModel({
        ...values.reimbursableServicesProgram,
        id: customsUsInfo?.reimbursableServicesProgram?.id,
      })
      : null;
    const request = new UsCustomsDetailsModel({
      ...useUpsert.form.values(),
      airportId: Number(params.airportId),
      id: selectedAirport?.customsUsInfo?.id || 0,
      reimbursableServicesProgram: reimbursableServicesProgramInfo,
    });

    UIStore.setPageLoader(true);
    _customDetailStore
      .upsertUsCustomsInfo(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          _airportStore?.setSelectedAirport({
            ...selectedAirport,
            customsUsInfo: response,
          });
          setFormValues(response);
        },
        error: error => {
          useUpsert.showAlert(error.message, 'upsertUsCustomDetail');
        },
      });
  };

  const saveCustomsDetail = () => {
    const request = new CustomsDetailInfoModel({
      ...useUpsert.form.values(),
      id: selectedAirport.customsDetail?.id || 0,
      airportId: Number(params.airportId),
    });
    UIStore.setPageLoader(true);
    _customDetailStore
      .upsertCustomsDetail(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: any) => {
          _airportStore?.setSelectedAirport({
            ...selectedAirport,
            customs: {
              ...selectedAirport.customs,
              customsDetailId: response.id,
            },
            customsDetail: {
              ...response,
              customsLeadTimes: response.customsLeadTimes,
            },
          });
          setFormValues(response);
          setDataUpdate(false);
          props.sidebarStore?.setNavLinks(
            airportSidebarOptions(
              false,
              !Boolean(airportId),
              !Boolean(response.id)
            ),
            basePath
          );
        },
        error: error => {
          useUpsert.showAlert(error.message, 'upsertCustom');
        },
      });
  };

  const saveChanges = () => {
    switch (currentComponent) {
      case CUSTOM_DETAILS.GENERAL:
        saveGeneral();
        break;
      case CUSTOM_DETAILS.INTL_CUSTOMS_DETAILS:
        saveIntlCustomsDetails();
        break;
      case CUSTOM_DETAILS.US_CUSTOMS_DETAILS:
        saveUsCustomDetails();
        break;
      case CUSTOM_DETAILS.CUSTOMS_DETAIL_INFO:
        saveCustomsDetail();
        break;
    }
  };

  const formReset = () => {
    const { customsGeneralInfo, customsNonUsInfo, customsDetail, customsUsInfo } = selectedAirport;
    useUpsert.form.reset();
    switch (currentComponent) {
      case CUSTOM_DETAILS.GENERAL:
        useUpsert.setFormValues(customsGeneralInfo || new AirportCustomGeneralModel());
        break;
      case CUSTOM_DETAILS.INTL_CUSTOMS_DETAILS:
        useUpsert.setFormValues(customsNonUsInfo || new IntlCustomsDetailsModel());
        break;
      case CUSTOM_DETAILS.CUSTOMS_DETAIL_INFO:
        useUpsert.setFormValues(customsDetail || new CustomsDetailInfoModel());
        break;
      case CUSTOM_DETAILS.US_CUSTOMS_DETAILS:
        useUpsert.setFormValues(customsUsInfo || new UsCustomsDetailsModel());
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
        navigate(`/${historyBasePath.current.replace(/\/custom-detail.*$/, '')}`);
        break;
    }
  };

  const disableAction = () => {
    if (isRowEditing) {
      return true;
    }
    if (isDataUpdated) {
      return useUpsert.form.hasError || UIStore.pageLoading;
    }
    return useUpsert.isActionDisabled;
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={selectedAirport.title}
        isEditMode={useUpsert.isEditView}
        onAction={onAction}
        backNavLink="/airports"
        backNavTitle="Airports"
        hasEditPermission={isEditable || isGRSUser}
        disableActions={disableAction()}
        isActive={selectedAirport.isActive}
        isRowEditing={isRowEditing}
        isSaveVisible={!isContactsScreen}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched || useUpsert.form.changed}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditView}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <Routes>
          <Route path="general" element={<GeneralInfo useUpsert={useUpsert} key="general" />} />
          <Route
            path="us-customs-details"
            element={<UsCustomsDetails useUpsert={useUpsert} key="usCustomsDetails" />}
          />
          <Route
            path="customs-notes"
            element={<CustomNotes isEditable={useUpsert.isEditable} isRowEditing={setRowEditing} />}
          />
          <Route
            path="customs-detail-info"
            element={
              <CustomDetailsInfo
                useUpsert={useUpsert}
                isRowEditing={setRowEditing}
                onCustomDetailsUpdate={setDataUpdate}
                key="customsDetailInfo"
              />
            }
          />
          <Route
            path="nonus-customs-details"
            element={<IntlCustomsDetails useUpsert={useUpsert} key="nonUsCustomsDetails" />}
          />
          <Route
            path="custom-contacts"
            element={
              <CustomContacts key="custom-contacts" isEditable={useUpsert.isEditable} isRowEditing={setRowEditing} />
            }
          />
        </Routes>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('sidebarStore', 'airportStore', 'airportCustomDetailStore')(observer(CustomDetails)) as FC<Props>;
