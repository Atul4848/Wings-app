import { baseEntitySearchFilters, GRID_ACTIONS, Utilities } from '@wings-shared/core';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { observer } from 'mobx-react';
import React, { FC } from 'react';
import { useNavigate, useParams } from 'react-router';
import ExternalCustomerMappings from '../../../ExternalCustomerMappings/ExternalCustomerMappings';
import { ExternalCustomerMappingModel, useCustomerModuleSecurity } from '../../../Shared';

interface Props {
  title: string;
  backNavTitle: string;
  backNavLink: string;
  customerPartyId: number;
}

const ExternalMappings: FC<Props> = ({ title, backNavTitle, backNavLink, customerPartyId }: Props) => {
  const params = useParams();
  const navigate = useNavigate();
  const customerModuleSecurity = useCustomerModuleSecurity();
  const useUpsert = useBaseUpsertComponent<ExternalCustomerMappingModel>(params, {}, baseEntitySearchFilters);
  
  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(backNavLink);
        break;
    }
  };

  return (
    <DetailsEditorWrapper
      isEditMode={!useUpsert.isDetailView}
      headerActions={
        <DetailsEditorHeaderSection
          title={title}
          backNavTitle={backNavTitle}
          backNavLink={backNavLink}
          disableActions={useUpsert.isActionDisabled}
          hasEditPermission={customerModuleSecurity.isEditable}
          isActive={params.viewMode === VIEW_MODE.DETAILS.toLowerCase()}
          isEditMode={useUpsert.isEditable}
          isSaveVisible={false}
          showBreadcrumb={true}
          onAction={onAction}
        />
      }
    >
      <ExternalCustomerMappings customerPartyId={customerPartyId} isDisabled={!useUpsert.isEditable}/>
    </DetailsEditorWrapper>
  );
};

export default observer(ExternalMappings);
