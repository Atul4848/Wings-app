import React, { FC, useEffect } from 'react';
import { countrySidebarOptions, upsertCountryBackNavLink, upsertTabBasePathFinder } from '../../../Shared';
import FIRsOwn from '../../../FIR/FIRsOwn';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { useParams } from 'react-router';
import { inject } from 'mobx-react';

interface Props {
  countryId?: number | string;
  title: string;
  sidebarStore?: typeof SidebarStore;
}

const AssociatedFIRs: FC<Props> = ({ title, countryId, sidebarStore }) => {
  useEffect(() => {
    const paths = countrySidebarOptions(false, !Boolean(countryId)).map(x => x.to);
    sidebarStore?.setNavLinks(countrySidebarOptions(false, !Boolean(countryId)), upsertTabBasePathFinder(paths));
  }, []);

  const params = useParams();
  const headerActions = () => {
    return (
      <DetailsEditorHeaderSection
        title={title}
        backNavLink={params && upsertCountryBackNavLink(Number(params.continentId))}
        backNavTitle={params?.countryId ? 'Countries' : 'Continents'}
        isEditMode={false}
        showBreadcrumb={Boolean(params?.continentId)}
      />
    );
  };

  return (
    <DetailsEditorWrapper
      headerActions={headerActions()}
      isEditMode={false}
      isBreadCrumb={Boolean(params?.continentId)}
    >
      <FIRsOwn showSearchHeader={false} countryId={Number(countryId)} />
    </DetailsEditorWrapper>
  );
};

export default inject('sidebarStore')(AssociatedFIRs);
