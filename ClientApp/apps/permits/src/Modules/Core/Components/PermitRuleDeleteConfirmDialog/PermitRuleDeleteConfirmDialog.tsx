import React, { FC, useState } from 'react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { PermitExceptionRuleModel, RuleFilterModel } from '../../../Shared';
import { IOptionValue, baseEntitySearchFilters } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IViewInputControl } from '@wings-shared/form-controls';
import { ConfirmDialog } from '@wings-shared/layout';
import { useParams } from 'react-router';
import { useStyles } from './PermitRuleDeleteConfirmDialog.styles';

interface Props {
  onUpdateExceptionRules: (exceptionRules: PermitExceptionRuleModel[]) => void;
  exceptionRules: PermitExceptionRuleModel[];
  exceptionRuleTempId: number;
  viewMode?: VIEW_MODE;
}

const PermitRuleDeleteConfirmDialog: FC<Props> = ({
  viewMode,
  onUpdateExceptionRules,
  exceptionRules,
  exceptionRuleTempId,
}) => {
  const field = {
    isDeleteRuleConfirmed: {
      label: 'I understand that once deleted, this rule cannot be recovered.',
      rules: 'required',
    },
  };
  const classes = useStyles();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<RuleFilterModel>(params, field, baseEntitySearchFilters);
  const [ isDisabled, setIsDisabled ] = useState(false);

  const checkboxControl = (): IViewInputControl => {
    return {
      fieldKey: 'isDeleteRuleConfirmed',
      type: EDITOR_TYPES.CHECKBOX,
    };
  };

  /* istanbul ignore next */
  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    setIsDisabled(Boolean(value));
    useUpsert.getField(fieldKey).set(value);
  };

  /* istanbul ignore next */
  const onYesClick = (): void => {
    const exceptionRulesModelCopy: PermitExceptionRuleModel[] = [ ...exceptionRules ];
    const exceptionIndex: number = exceptionRules.findIndex(rule => rule.tempId === exceptionRuleTempId);

    if (exceptionIndex !== -1) {
      exceptionRulesModelCopy.splice(exceptionIndex, 1);
    }
    onUpdateExceptionRules([ ...exceptionRulesModelCopy ]);
    ModalStore.close();
  };

  return (
    <ConfirmDialog
      title="Confirm Delete"
      message="Caution: Deleting this rule will permanently remove its
    associated cases and dependencies. This action cannot be undone. "
      dialogContent={
        <>
          <ViewInputControl
            {...checkboxControl()}
            isEditable={true}
            field={useUpsert.getField(checkboxControl().fieldKey || '')}
            onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
          />
        </>
      }
      yesButton="Delete"
      isDisabledYesButton={!isDisabled}
      isDeleteButton={true}
      onNoClick={() => ModalStore.close()}
      onYesClick={() => onYesClick()}
    />
  );
};

export default PermitRuleDeleteConfirmDialog;
