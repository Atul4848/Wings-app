import { DATE_FORMAT, IOptionValue, baseEntitySearchFilters } from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { ModelStatusOptions, useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { useParams } from 'react-router';
import { fields } from './fields';
import { useStyles } from './AssociatedSiteGeneralInformation.style';
import { SiteStore, CustomerStore } from '../../../Stores';
import { AssociatedSitesModel } from '../../../Models';

interface Props {
  siteStore?: SiteStore;
  customerStore?: CustomerStore;
}

const AssociatedSiteGeneralInformation: FC<Props> = ({ siteStore, customerStore }: Props) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<AssociatedSitesModel>(params, fields, baseEntitySearchFilters);
  const classes = useStyles();
  const _siteStore = siteStore as SiteStore;
  const _customerStore = customerStore as CustomerStore;

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params.siteViewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadAssociatedSite();
  }, []);

  /* istanbul ignore next */
  const loadAssociatedSite = (): void => {
    const { selectedCustomer } = _customerStore;
    const siteId = params?.siteId;
    const associatedSite = Boolean(selectedCustomer.associatedSites?.length)
      ? selectedCustomer.associatedSites.find(x => String(x.id) === siteId)
      : new AssociatedSitesModel();
    useUpsert.setFormValues(associatedSite as AssociatedSitesModel);
  };

  /* istanbul ignore next */
  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

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
            fieldKey: 'siteUseId',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'sequence',
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
            fieldKey: 'siteUsage',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'address1',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'address2',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'address3',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'city',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'state',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'country',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'county',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'postalCode',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'gracePeriod',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'lateFeePercent',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'lateFeeStartDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            maxDate: useUpsert.getField('lateFeeStartDate').value,
          },
          {
            fieldKey: 'paymentTerms',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'poNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'poExpirationDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            maxDate: useUpsert.getField('poExpirationDate').value,
          },
          {
            fieldKey: 'poAmount',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'demandClass',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'location',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'salesRep.email',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'multiOrg',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'primary',
            type: EDITOR_TYPES.CHECKBOX,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _siteStore.sourceTypes,
          },
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _siteStore.accessLevels,
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
        title={_customerStore.selectedCustomer?.name}
        backNavTitle="Back"
        disableActions={useUpsert.isActionDisabled}
        useHistoryBackNav={true}
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
        field={useUpsert.getField}
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

export default inject('siteStore', 'customerStore')(observer(AssociatedSiteGeneralInformation));
