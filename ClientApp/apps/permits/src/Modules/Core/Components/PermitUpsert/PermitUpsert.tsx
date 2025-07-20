import React, { useEffect, useMemo, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import {
  PermitSettingsStore,
  PermitModel,
  PermitStore,
  RuleFilterModel,
  PermitExceptionRuleModel,
  sidebarOptions,
} from '../../../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IOptionValue, UIStore, Utilities, baseEntitySearchFilters } from '@wings-shared/core';
import { SidebarStore } from '@wings-shared/layout';
import { useNavigate, useParams } from 'react-router';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './PermitUpsert.styles';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';


export interface BaseProps {
  sidebarStore?: typeof SidebarStore;
  permitStore?: PermitStore;
  permitSettingsStore?: PermitSettingsStore;
  fields;
}

const PermitUpsert = ({ sidebarStore, permitStore, permitSettingsStore, fields }: BaseProps) => {
  const params = useParams();
  const classes = useStyles();
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent(params, fields, baseEntitySearchFilters);
  const _permitStore = permitStore as PermitStore;
  const _permitSettingsStore = permitSettingsStore as PermitSettingsStore;
  const [ permitModel, setPermitModel ] = useState<PermitModel>(new PermitModel());
  const [ isDataChanged, setIsDataChanged ] = useState(false);
  const _useConfirmDialog = useConfirmDialog();

  const hasExtensionDataEmpty = (): boolean => {
    const { hasRouteOrAirwayExtension, permitRouteAirwayExtensions } = permitModel;
    return !(hasRouteOrAirwayExtension && permitRouteAirwayExtensions?.length) && hasRouteOrAirwayExtension;
  };

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.EDIT);
    setPermitModel(new PermitModel(_permitStore?.permitDataModel));
  }, []);

  const hasError = useMemo(() => {
    const { hasError } = useUpsert.form;
    return hasError || !useUpsert.form.changed;
  }, [ useUpsert.form.hasError, useUpsert.form.changed ]);

  /* istanbul ignore next */
  const upsertPermit = (permitRouteAirway): void => {
    if (hasExtensionDataEmpty()) {
      useUpsert.showAlert('Permit Routes are required', 'permitRouteAlert');
      return;
    }

    const { permitDocuments } = permitModel;
    const docs = permitDocuments.every(x => x.document.id);
    if (permitDocuments?.length && !docs) {
      useUpsert.showAlert('Document is required', 'permitDocument');
      return;
    }

    setPermitDataChanged(false);
    UIStore.setPageLoader(true);
    _permitStore
      .upsertPermit(permitRouteAirway)
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(unsubscribe.destroy$)
      )
      .subscribe({
        next: (updatedModel: PermitModel) => {
          if (!Boolean(permitId())) {
            useUpsert.form.reset();
            setPermitDataChanged(false);
            const basePath: string = `permits/${updatedModel.id}/${VIEW_MODE.EDIT.toLowerCase()}`;
            sidebarStore?.setNavLinks(sidebarOptions(true, false, VIEW_MODE.EDIT), basePath);
            navigate(`/${basePath}/exceptions`, useUpsert.noBlocker);
          }
          const model = new PermitModel({
            ...updatedModel,
            country: permitModel.country,
          });
          _permitStore.setPermitDataModel(model);
          setPermitModel(model);
          useUpsert.form.reset();
          useUpsert.form.set(model);
          setPermitDataChanged(false);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const navigateToPermits = (): void => {
    navigate('/permits');
  };

  const onUpsertAction = (permitRouteAirway): void => {
    if (!isShowConfirmDialog()) {
      upsertPermit(permitRouteAirway);
      return;
    }

    _useConfirmDialog.confirmAction(
      () => {
        upsertPermit(permitRouteAirway), ModalStore.close();
      },
      {
        title: 'Confirm Save',
        message: 'Are you sure you want to save your changes.',
      }
    );
  };

  const setPermitDataChanged = (isChanged: boolean): void => {
    setIsDataChanged(isChanged);
  };

  /* istanbul ignore next */
  const onCancel = (): void => {
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    useUpsert.resetExpandedMode();
    setPermitDataChanged(false);
  };

  /* istanbul ignore next */
  const setIsExceptionRuleAndValue = (): void => {
    const { isException } = useUpsert.form.values();
    const { hasExceptionTextOrRuleExists } = permitModel;
    const _isException: IOptionValue = hasExceptionTextOrRuleExists && !isException ? '' : Boolean(isException);
    useUpsert.getField('isException').set(_isException);
    useUpsert.setFormRules('isException', hasExceptionTextOrRuleExists, 'Is Exception');
  };

  const setExceptionTextDisabled = (isDisabled: boolean): void => {
    useUpsert.getField('exception').set('disabled', isDisabled);
  };

  /* istanbul ignore next */
  const groupTitle = (): string => {
    const { country } = useUpsert.form.values();
    return country?.commonName || 'Country';
  };

  /* istanbul ignore next */
  const isShowConfirmDialog = (): boolean => {
    const { permitDataModel } = _permitStore;
    if (Boolean(permitDataModel?.exceptionText) && !Boolean(permitModel.exceptionText)) {
      return true;
    }
    if (permitDataModel?.permitExceptionRules.length && !permitModel.permitExceptionRules.length) {
      return true;
    }
    return false;
  };

  const isDetailsView = (): boolean => {
    return Utilities.isEqual(params?.mode, VIEW_MODE.DETAILS);
  };

  /* istanbul ignore next */
  const permitId = (): Number | null => {
    const permitId = params?.permitId;
    return Number(permitId) || 0;
  };

  /* istanbul ignore next */
  const isExceptionDataInValid = (): boolean => {
    return (
      (permitModel.isException && (!Boolean(permitModel.exceptionText) || !permitModel.permitExceptionRules.length)) ||
      (!permitModel.isException && permitModel.hasExceptionTextOrRuleExists)
    );
  };

  /* istanbul ignore next */
  const hasPermitExceptionRuleError = (): boolean => {
    return (
      permitModel.hasInValidPermitExceptionRules ||
      permitModel.permitExceptionRules.some(
        (rule: PermitExceptionRuleModel) =>
          Boolean(rule.hasInvalidName) ||
          rule.ruleFilters.some((ruleFilter: RuleFilterModel) =>
            Boolean(ruleFilter.hasInvalidRuleValue(_permitSettingsStore.getSelectedEntityParamConfig(ruleFilter)))
          )
      )
    );
  };
  return {
    hasPermitExceptionRuleError,
    isExceptionDataInValid,
    hasError,
    isDetailsView,
    groupTitle,
    setExceptionTextDisabled,
    setIsExceptionRuleAndValue,
    onCancel,
    navigateToPermits,
    onUpsertAction,
    isDataChanged,
    setPermitModel,
    setPermitDataChanged,
    permitModel,
    useUpsert,
    params,
    classes,
    _permitStore,
    _permitSettingsStore,
    permitId,
  };
};

export default PermitUpsert;
