import React, { FC, ReactElement, ReactNode, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { PermitModel } from '../../../Shared';
import { PermitEditorActions, PermitExceptionDetails, PermitException, PermitUpsert } from '../../Components';
import { IOptionValue, UIStore } from '@wings-shared/core';
import { ConfirmNavigate, DetailsEditorWrapper } from '@wings-shared/layout';
import { useConfirmDialog } from '@wings-shared/hooks';
import { BaseProps } from '../PermitUpsert/PermitUpsert';
import { useStyles } from './PermitExceptionUpsert.styles';
import { fields } from './Fields';
import { VIEW_MODE } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Alert } from '@material-ui/lab';
import { EDITOR_TYPES, IViewInputControl, ViewExpandInput, ViewInputControl } from '@wings-shared/form-controls';

type Props = BaseProps;

const PermitExceptionUpsert: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const {
    params,
    setPermitModel,
    setPermitDataChanged,
    isDataChanged,
    navigateToPermits,
    permitModel,
    hasError,
    _permitStore,
    setExceptionTextDisabled,
    setIsExceptionRuleAndValue,
    isExceptionDataInValid,
    hasPermitExceptionRuleError,
    onUpsertAction,
    useUpsert,
  } = PermitUpsert({
    ...props,
    fields,
  });
  const _useConfirmDialog = useConfirmDialog();

  // Load Data on Mount
  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    setInitialFormData(false);
  }, []);

  const setInitialFormData = (shouldSetDetail: boolean = true): void => {
    const { permitDataModel } = _permitStore;
    setPermitModel(new PermitModel({ ...permitDataModel }));
    useUpsert.form.reset();
    useUpsert.setFormValues(permitDataModel);
    setExceptionTextDisabled(!permitDataModel.isException);
    setIsExceptionRuleAndValue();
    if (shouldSetDetail) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      setPermitDataChanged(false);
    }
  };

  const onCancel = (): void => {
    const viewMode = params.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      if (isDataChanged) {
        return _useConfirmDialog.confirmAction(() => {
          setInitialFormData(), ModalStore.close();
        }, {});
      }
      setInitialFormData();
      return;
    }
    navigateToPermits();
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    if (fieldKey === 'isException') {
      setExceptionTextDisabled(!Boolean(value));
    }
    useUpsert.getField(fieldKey).set(value);
    updatePermitModel(permitModel);
  };

  const updatePermitModel = (updatedPermitModel: PermitModel): void => {
    const { permitDataModel } = _permitStore;

    setPermitModel(
      new PermitModel({
        ...permitDataModel,
        ...useUpsert.form.values(),
        permitExceptionRules: [ ...updatedPermitModel?.permitExceptionRules ],
      })
    );
    setPermitDataChanged(true);
    if (!updatedPermitModel.permitExceptionRules?.length) {
      setIsExceptionRuleAndValue();
    }
  };

  const hasExceptionsError = (): boolean => {
    return isExceptionDataInValid() || hasPermitExceptionRuleError();
  };

  /* istanbul ignore next */
  const exceptionTabInputControls = (): IViewInputControl[] => {
    return [
      {
        fieldKey: 'isException',
        type: EDITOR_TYPES.CHECKBOX,
        customErrorMessage: 'This field is required',
        isDisabled: permitModel.hasException,
        showTooltip: permitModel.hasException,
        tooltipText: permitModel.exceptionTooltipText,
      },
      {
        fieldKey: 'exception',
        type: EDITOR_TYPES.RICH_TEXT_EDITOR,
        isInputCustomLabel: true,
        multiline: true,
        rows: 10,
      },
    ];
  };

  const exceptionTabViewInputControls = (): ReactNode => {
    return exceptionTabInputControls().map((inputControl: IViewInputControl, index: number) => (
      <ViewInputControl
        {...inputControl}
        key={index}
        customErrorMessage={inputControl.customErrorMessage}
        field={useUpsert.getField(inputControl.fieldKey || '')}
        isEditable={useUpsert.isEditable}
        onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
        onLabelClick={(label, fieldKey) => useUpsert.setExpandedMode(label, fieldKey, EDITOR_TYPES.RICH_TEXT_EDITOR)}
        classes={{ flexRow: classes.flexRow }}
      />
    ));
  };

  const exceptionAlert = (): ReactElement => {
    if (useUpsert.isEditable && permitModel.isException && Boolean(permitModel.exceptionAlertText)) {
      return (
        <Alert severity="error" className={classes.filledError}>
          {permitModel.exceptionAlertText}
        </Alert>
      );
    }
    return <></>;
  };

  const headerActions = (): ReactNode => {
    return (
      <PermitEditorActions
        hasError={hasExceptionsError() || UIStore.pageLoading}
        isDetailsView={useUpsert.isDetailView}
        onCancelClick={() => onCancel()}
        onUpsert={() => onUpsertAction(permitModel)}
        onSetViewMode={(mode: VIEW_MODE) => useUpsert.setViewMode(mode)}
        title={permitModel.permitTitle}
      />
    );
  };
  const { permitExceptionRules } = useUpsert.form.values();
  return (
    <ConfirmNavigate isBlocker={isDataChanged}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={!useUpsert.isDetailView}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <ViewExpandInput
          isExpandMode={useUpsert.expandMode}
          isEditable={useUpsert.isEditable}
          expandModeField={useUpsert.expandModeField}
          onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
          onLabelClick={(label, fieldKey) => useUpsert.setExpandedMode(label, fieldKey, EDITOR_TYPES.TEXT_FIELD)}
        />
        {!useUpsert.expandMode && (
          <>
            {exceptionAlert()}
            {exceptionTabViewInputControls()}
            {useUpsert.isDetailView && !useUpsert.isEditable && (
              <PermitExceptionDetails permitExceptionRules={permitExceptionRules} />
            )}
            {useUpsert.isEditable && (
              <PermitException
                permitModel={permitModel}
                hasPermitExceptionRuleError={hasPermitExceptionRuleError()}
                onUpdatePermitModel={(permit: PermitModel) => updatePermitModel(permit)}
              />
            )}
          </>
        )}
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('permitSettingsStore', 'permitStore', 'sidebarStore')(observer(PermitExceptionUpsert));
