import { DATE_FORMAT, IOptionValue, baseEntitySearchFilters } from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { ModelStatusOptions, useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { useParams } from 'react-router';
import { fields } from './fields';
import { useStyles } from './CustomerGeneralInformation.style';
import { CustomerModel, CustomerStore } from '../../../Shared';

interface Props {
  customerStore?: CustomerStore;
  title?: string;
}

const CustomerGeneralInformation: FC<Props> = ({ customerStore, title }: Props) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<CustomerModel>(params, fields, baseEntitySearchFilters);
  const classes = useStyles();
  const _customerStore = customerStore as CustomerStore;

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadCustomer();
  }, []);

  /* istanbul ignore next */
  const loadCustomer = (): void => {
    const { selectedCustomer } = _customerStore;
    const customer = selectedCustomer ? selectedCustomer : new CustomerModel();
    useUpsert.setFormValues(customer);
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
            fieldKey: 'number',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'partyNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'partyAltName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'partyType',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'corporateSegment',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'classification',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'startDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            maxDate: useUpsert.getField('startDate').value,
          },
          {
            fieldKey: 'endDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            maxDate: useUpsert.getField('endDate').value,
          },
          {
            fieldKey: 'region',
            type: EDITOR_TYPES.TEXT_FIELD,
          },

          {
            fieldKey: 'collectorName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'creditRating',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'paymentTerms',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'creditAnalyst',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'dmClient',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'riskCode',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'accountStatus',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _customerStore.sourceTypes,
          },
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _customerStore.accessLevels,
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
        backNavTitle="Customer"
        disableActions={useUpsert.isActionDisabled}
        backNavLink="/customer"
        isEditMode={false}
        showBreadcrumb={true}
      />
    );
  };

  return (
    <DetailsEditorWrapper
      headerActions={headerActions()}
      isEditMode={false}
      isBreadCrumb={true}
      classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
    >
      <ViewInputControlsGroup
        groupInputControls={groupInputControls()}
        field={fieldKey => useUpsert.getField(fieldKey)}
        isEditing={false}
        isLoading={useUpsert.loader.isLoading}
        onValueChange={onValueChange}
      />
      <AuditFields
        isNew={useUpsert.isAddNew}
        isEditable={false}
        fieldControls={useUpsert.auditFields}
        onGetField={useUpsert.getField}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('customerStore')(observer(CustomerGeneralInformation));
