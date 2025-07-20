import React, { FC, ReactNode, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { VIEW_MODE } from '@wings/shared';
import { PermitSettingsStore, PermitModel, RevisionTriggerModel, PermitStore } from '../../../Shared';
import { useStyles } from './AdditionalInfo.styles';
import PermitEditorActions from '../PermitEditorActions/PermitEditorActions';
import { PermitAdditionalInfoModel } from '../../../Shared/Models/PermitAdditionalInfo.model';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IOptionValue, UIStore } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { ConfirmNavigate, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import RevisionTriggerGrid from './RevisionTriggerGrid';
import PermitUpsert from '../PermitUpsert/PermitUpsert';
import { fields } from './Fields';
import { useConfirmDialog } from '@wings-shared/hooks';

interface Props {
  sidebarStore?: typeof SidebarStore;
  permitStore?: PermitStore;
  permitSettingsStore?: PermitSettingsStore;
}

const AdditionalInfo: FC<Props> = ({ sidebarStore, permitStore, permitSettingsStore }) => {
  const classes = useStyles();
  const [ isRowEditing, setIsRowEditing ] = useState(false);
  const {
    params,
    setPermitModel,
    setPermitDataChanged,
    isDataChanged,
    navigateToPermits,
    permitModel,
    hasError,
    _permitStore,
    _permitSettingsStore,
    onUpsertAction,
    useUpsert,
  } = PermitUpsert({
    sidebarStore,
    permitStore,
    permitSettingsStore,
    fields,
  });
  const _useConfirmDialog = useConfirmDialog();
  const [ isDataSave, setIsDataSave ] = useState(false);

  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    setInitialFormData(false);
  }, []);

  /* istanbul ignore next */
  const setInitialFormData = (shouldSetDetail: boolean = true): void => {
    const { permitDataModel } = _permitStore;
    useUpsert.form.reset();
    setPermitDataChanged(false);
    useUpsert.setFormValues(permitDataModel);
    setPermitModel(new PermitModel({ ...permitDataModel }));
    if (shouldSetDetail) useUpsert.setViewMode(VIEW_MODE.DETAILS);
  };

  /* istanbul ignore next */
  const onCancel = (): void => {
    const viewMode = params.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      if (useUpsert.form.touched || isDataChanged) {
        return _useConfirmDialog.confirmAction(
          () => {
            setInitialFormData(), ModalStore.close();
          },
          {
            title: 'Confirm Cancellation',
            message: 'Leaving Edit Mode will cause your changes to be lost. Are you sure you want to exit Edit Mode?',
          }
        );
      }
      setInitialFormData();
      return;
    }
    navigateToPermits();
  };

  /* istanbul ignore next */
  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    updatePermitModel();
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'appliedPermitPrerequisiteType':
        useUpsert.observeSearch(_permitSettingsStore.getpermitPrerequisiteTypes());
        break;
      case 'appliedBlanketValidityType':
        useUpsert.observeSearch(_permitSettingsStore.getBlanketValidityTypes());
        break;
      case 'appliedPermitDiplomaticType':
        useUpsert.observeSearch(_permitSettingsStore.getPermitDiplomaticTypes());
        break;
      case 'appliedPermitNumberExceptionType':
        useUpsert.observeSearch(_permitSettingsStore.getPermitNumberExceptions());
        break;
      default:
        break;
    }
  };

  /* istanbul ignore next */
  const updatePermitModel = (): void => {
    const { permitAdditionalInfo } = useUpsert.form.values();
    const { permitDataModel } = _permitStore;
    setPermitModel(
      new PermitModel({
        ...permitDataModel,
        ...useUpsert.form.values(),
        permitAdditionalInfo: new PermitAdditionalInfoModel({
          ...permitDataModel?.permitAdditionalInfo,
          ...permitAdditionalInfo,
        }),
      })
    );
    setPermitDataChanged(true);
  };

  /* istanbul ignore next */
  const updateRevisions = (revisions: RevisionTriggerModel[]): void => {
    const { permitAdditionalInfo } = useUpsert.form.values();
    setPermitDataChanged(true);
    setPermitModel(
      new PermitModel({
        ..._permitStore?.permitDataModel,
        permitAdditionalInfo: {
          ...permitModel?.permitAdditionalInfo,
          ...permitAdditionalInfo,
          permitAdditionalInfoRevisions: revisions.map(({ id, ...rest }) => {
            return new RevisionTriggerModel({ id: Math.floor(id), ...rest });
          }),
        },
      })
    );
    setIsDataSave(true);
  };

  const updateRowEditing = (isEditing: boolean): void => {
    setIsRowEditing(isEditing);
  };

  /* istanbul ignore next */
  const inputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'permitAdditionalInfo.permitIssuanceAuthority',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'permitAdditionalInfo.appliedPermitPrerequisiteType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _permitSettingsStore.permitPrerequisiteTypes,
            multiple: true,
          },
          {
            fieldKey: 'permitAdditionalInfo.isBlanketAvailable',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.appliedBlanketValidityType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _permitSettingsStore.blanketValidityTypes,
            multiple: true,
          },
          {
            fieldKey: 'permitAdditionalInfo.appliedPermitDiplomaticType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _permitSettingsStore.permitDiplomaticTypes,
            multiple: true,
          },
          {
            fieldKey: 'permitAdditionalInfo.isDirectToCAA',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.isATCFollowUp',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.isPermitNumberIssued',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.appliedPermitNumberExceptionType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _permitSettingsStore.permitNumberExceptions,
            multiple: true,
          },
          {
            fieldKey: 'permitAdditionalInfo.isBlanketPermitNumberIssued',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.isShortNoticePermitAvailability',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.isRampCheckPossible',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.isFAOCRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.isHandlerCoordinationRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          // new fields
          {
            fieldKey: 'permitAdditionalInfo.isCAAPermitFeeApplied',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            excludeEmptyOption: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.isPermitFeeNonRefundable',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            excludeEmptyOption: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.isWindowPermitsAllowed',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.isOptionPermitsAllowed',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.isCharterAirTransportLicenseRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.isTemporaryImportationRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'permitAdditionalInfo.temporaryImportationTiming',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Hrs',
          },
          {
            fieldKey: 'permitAdditionalInfo.isLandingPermitRqrdForAircraftRegisteredCountry',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'permitAdditionalInfo.firstEntryNonAOE',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            multiline: true,
            rows: 5,
          },
          {
            fieldKey: 'permitAdditionalInfo.temporaryImportation',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            multiline: true,
            rows: 5,
          },
          {
            fieldKey: 'permitAdditionalInfo.isRevisionAllowed',
            type: EDITOR_TYPES.CHECKBOX,
          },
        ],
      },
    ];
  };

  const upsertData = () => {
    const permitRouteAirway = new PermitModel({
      ..._permitStore?.permitDataModel,
      ...permitModel,
    });
    useUpsert.setFormValues(permitRouteAirway);
    setPermitModel(permitRouteAirway);
    onUpsertAction(permitRouteAirway);
  };

  const hasGeneralError = (): boolean => {
    if (isDataSave) {
      return isRowEditing;
    }
    return hasError || isRowEditing;
  };

  const headerActions = (): ReactNode => {
    return (
      <PermitEditorActions
        hasError={hasGeneralError() || UIStore.pageLoading || isRowEditing}
        isDetailsView={useUpsert.isDetailView}
        onCancelClick={onCancel}
        onUpsert={upsertData}
        onSetViewMode={(mode: VIEW_MODE) => useUpsert.setViewMode(mode)}
        title={permitModel.permitTitle}
      />
    );
  };
  const { permitAdditionalInfo } = useUpsert.form.values();
  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={!useUpsert.isDetailView}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <div className={classes.flexWrap}>
          <ViewInputControlsGroup
            groupInputControls={inputControls()}
            field={fieldKey => useUpsert.getField(fieldKey)}
            isEditing={useUpsert.isEditable}
            isLoading={useUpsert.loader.isLoading}
            onValueChange={(option: IOptionValue, fieldKey: string) => onValueChange(option, fieldKey)}
            onFocus={(fieldKey: string) => onFocus(fieldKey)}
          />
        </div>
        <div className={classes.gridRoot}>
          <RevisionTriggerGrid
            isEditable={(useUpsert.isEditable || !useUpsert.isDetailView) && permitAdditionalInfo.isRevisionAllowed}
            permitAdditionalInfoRevisions={permitModel?.permitAdditionalInfo?.permitAdditionalInfoRevisions}
            onDataSave={revisions => updateRevisions(revisions)}
            onRowEditingChange={isEditing => updateRowEditing(isEditing)}
          />
        </div>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('permitStore', 'permitSettingsStore', 'sidebarStore')(observer(AdditionalInfo));
