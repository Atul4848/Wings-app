import { IOptionValue, baseEntitySearchFilters } from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { ModelStatusOptions, useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { useParams } from 'react-router';
import { fields } from './fields';
import { useStyles } from './OperatorGeneralInformation.style';
import { OperatorStore, OperatorModel } from '../../../Shared';

interface Props {
  operatorStore?: OperatorStore;
  title?: string;
}

const OperatorGeneralInformation: FC<Props> = ({ operatorStore, title }: Props) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<OperatorModel>(params, fields, baseEntitySearchFilters);
  const classes = useStyles();
  const _operatorStore = operatorStore as OperatorStore;

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params.viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadOperator();
  }, []);

  /* istanbul ignore next */
  const loadOperator = (): void => {
    const { selectedOperator } = _operatorStore;
    const operator = selectedOperator ? selectedOperator : new OperatorModel();
    useUpsert.setFormValues(operator);
  };

  /* istanbul ignore next */
  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'name',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _operatorStore.sourceTypes,
          },
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _operatorStore.accessLevels,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
          },
        ],
      },
    ];
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={title}
        backNavTitle="Operator"
        disableActions={useUpsert.isActionDisabled}
        backNavLink="/customer/operator"
        isEditMode={useUpsert.isEditable}
      />
    );
  };

  return (
    <DetailsEditorWrapper
      headerActions={headerActions()}
      isEditMode={useUpsert.isEditable}
      classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
    >
      <ViewInputControlsGroup
        groupInputControls={groupInputControls()}
        field={fieldKey => useUpsert.getField(fieldKey)}
        isEditing={useUpsert.isEditable}
        isLoading={useUpsert.loader.isLoading}
        onValueChange={onValueChange}
      />
      <AuditFields
        isNew={useUpsert.isAddNew}
        isEditable={useUpsert.isEditable}
        fieldControls={useUpsert.auditFields}
        onGetField={useUpsert.getField}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('operatorStore')(observer(OperatorGeneralInformation));
