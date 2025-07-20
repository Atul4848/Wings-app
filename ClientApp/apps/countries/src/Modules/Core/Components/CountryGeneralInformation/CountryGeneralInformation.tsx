import { ContinentModel, CountryModel, RegionModel, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { ReactNode, useEffect, useState } from 'react';
import { forkJoin } from 'rxjs';
import { GEOGRAPHICAL_REGION_TYPE, GRID_ACTIONS, UIStore, Utilities } from '@wings-shared/core';
import { fields } from '../Fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import {
  CountryStore,
  countrySidebarOptions,
  upsertCountryBackNavLink,
  upsertTabBasePathFinder,
  useCountryModuleSecurity,
} from '../../../Shared';
import { SecondaryButton } from '@uvgo-shared/buttons';
import { useNavigate, useParams } from 'react-router-dom';
import { useStyles } from './CountryGeneralInformation.styles';
import CountryEditorV2 from '../CountryEditor/CountryEditorV2';

interface Props {
  viewMode?: VIEW_MODE;
  countryStore?: CountryStore;
  sidebarStore?: typeof SidebarStore;
}

const CountryGeneralInformation = ({ ...props }: Props) => {
  const params = useParams();
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const useUpsert = useBaseUpsertComponent(props, fields);
  const _countryStore = props.countryStore as CountryStore;
  const [ countryData, setCountryData ] = useState<CountryModel>(new CountryModel());
  const countryModuleSecurity = useCountryModuleSecurity()

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    const paths = countrySidebarOptions(false, !Boolean(params.countryId)).map(x => x.to);
    props.sidebarStore?.setNavLinks(
      countrySidebarOptions(false, !Boolean(params.countryId)),
      upsertTabBasePathFinder(paths)
    );
    loadInitialData();
    loadCountry();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    _countryStore
      .getContinents()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadCountry = (): void => {
    const _countryData = _countryStore.selectedCountry ? _countryStore.selectedCountry : new CountryModel();
    setCountryData(_countryData);
    setFormData(_countryData);
  };

  const setFormData = (countryData: CountryModel): void => {
    // Set default Continent if user coming from Continent screen
    let _countryModel: CountryModel = countryData;
    if (params?.continentId && !Boolean(countryData?.id)) {
      const continent = _countryStore.continents?.find(({ id }) => {
        return Utilities.isEqual(id, Number(params?.continentId));
      }) as ContinentModel;
      _countryModel = new CountryModel({
        ...countryData,
        continent: continent,
      });
    }
    useUpsert.setFormValues(_countryModel);
    setTerritoryRules();
  };

  /* istanbul ignore next */
  const setTerritoryRules = (): void => {
    const isTerritory: boolean = useUpsert.getField('isTerritory').value;
    if (!isTerritory) {
      useUpsert.getField('territoryType').set(null);
      useUpsert.getField('sovereignCountry').set(null);
    }
  };

  /* istanbul ignore next */
  const isAlreadyExist = (): boolean => {
    const { officialName, commonName, isO2Code, isO3Code, isoNumericCode } = useUpsert.form.values();
    const isExists = _countryStore.countries.some(
      (country: CountryModel) =>
        !Utilities.isEqual(country.id, countryData?.id) &&
        (Utilities.isEqual(country.officialName, officialName) ||
          Utilities.isEqual(country.commonName, commonName) ||
          Utilities.isEqual(country.isO2Code, isO2Code) ||
          Utilities.isEqual(country.isO3Code, isO3Code) ||
          Utilities.isEqual(
            Utilities.trimLeadingZeros(country.isoNumericCode?.toString()),
            Utilities.trimLeadingZeros(isoNumericCode?.toString())
          ))
    );
    return isExists;
  };

  /* istanbul ignore next */
  const saveChanges = () => {
    if (isAlreadyExist()) {
      AlertStore.info('Country already exist please check details');
      return;
    }
    const request: CountryModel = new CountryModel({
      ...countryData,
      ...useUpsert.form.values(),
    });

    UIStore.setPageLoader(true);
    _countryStore
      .upsertCountry(request.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (country: CountryModel) => {
          _countryStore.selectedCountry = country;
          setCountryData(country);
          useUpsert.form.reset();
          useUpsert.setFormValues(country);
          if (!request.id) {
            navigate(`/countries/upsert/${country.id}/edit`, useUpsert.noBlocker);
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
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
        if (Utilities.isEqual(params.viewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(countryData);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(upsertCountryBackNavLink(params.continentId || ''));
        break;
    }
  };

  /* istanbul ignore next */
  const dialogHeader = (): ReactNode => {
    const { commonName, cappsusSanction }: CountryModel = useUpsert.form.values();
    return (
      <>
        {commonName || 'New Country'}
        {cappsusSanction && (
          <SecondaryButton size="small" classes={{ root: classes.sanctionBtn, label: classes.btnLabel }}>
            <ReportProblemIcon />
            Sanctioned Country
          </SecondaryButton>
        )}
      </>
    );
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={dialogHeader()}
        backNavLink={params && upsertCountryBackNavLink(params.continentId || '')}
        backNavTitle={params?.countryId ? 'Countries' : 'Continents'}
        disableActions={useUpsert.isActionDisabled}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={countryModuleSecurity.isEditable}
        onAction={onAction}
        showBreadcrumb={Boolean(params?.continentId)}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.changed}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
        isBreadCrumb={Boolean(params?.continentId)}
      >
        <CountryEditorV2 continentId={Number(params?.continentId)} countryModel={countryData} useUpsert={useUpsert} />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('countryStore', 'sidebarStore')(observer(CountryGeneralInformation));
