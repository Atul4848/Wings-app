import React, { FC, ReactNode, useState, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Chip, Theme, Tooltip } from '@material-ui/core';
import { ApplicationsStore, ApplicationsModel, ApplicationOktaClientModel } from '../../../Shared';
import { fields } from './Fields';
import { styles } from './UpsertApplications.styles';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { IClasses, UIStore, GRID_ACTIONS, Utilities, ISelectOption, IOptionValue } from '@wings-shared/core';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import {
  EDITOR_TYPES,
  ViewInputControl,
  IGroupInputControls,
  IViewInputControl
} from '@wings-shared/form-controls';
import classNames from 'classnames';
import { forkJoin } from 'rxjs';
import { AutocompleteGetTagProps } from '@material-ui/lab';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useUnsubscribe } from '@wings-shared/hooks';

type Props = {
  params?: { mode: VIEW_MODE; id: string };
  applicationStore?: ApplicationsStore;
};

const UpsertApplications: FC<Props> = ({ ...props }: Props) => {
  const [ application, setApplication ] = useState(new ApplicationsModel({ id: '' }));
  const [ applicationOktaClients, setApplicationOktaClients ] = useState<ApplicationOktaClientModel[]>([]);
  const [ selectedApplicationOktaClient, setSelectedApplicationOktaClient ]
    = useState<ApplicationOktaClientModel[]>([]);
  const _applicationStore = props.applicationStore as ApplicationsStore;
  const classes: Record<string, string> = styles();
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const navigate = useNavigate();

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
    loadInitialData();
  }, []);

  const loadInitialData = (): void => {
    if (!applicationId()) {
      
      useUpsert.setFormValues(application);
      return;
    }
    UIStore.setPageLoader(true);

    forkJoin([ _applicationStore
      .getApplication(applicationId()), _applicationStore
      .searchOktaClient('') ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ application, apps ]: [ApplicationsModel, ApplicationOktaClientModel[]]) => {
        setApplication(new ApplicationsModel(application));
        useUpsert.setFormValues(application);
        const selectedApp = apps
          .filter(x => application.oktaClientId.includes(x.oktaClientId));
        setSelectedApplicationOktaClient(selectedApp);
        setApplicationOktaClients(apps);
        useUpsert.getField('oktaClientId').set(selectedApp);
        return;
      });
  }

  const upsertService = () => {
    UIStore.setPageLoader(true);
    _applicationStore
      .upsertApplication(applicationId(), getUpsertApplicationSetting(), useUpsert.viewMode == VIEW_MODE.NEW)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => navigateToServices(),
        error: error => AlertStore.critical(error.message),
      });
  };

  const getUpsertApplicationSetting = (): ApplicationsModel => {
    const formValues: ApplicationsModel = useUpsert.form.values();
    const applicationSetting = new ApplicationsModel({
      ...application,
      ...formValues,
    });
    applicationSetting.oktaClientId = selectedApplicationOktaClient.map(x => x.oktaClientId);
    return applicationSetting;
  };

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'Application',
      inputControls: [
        {
          fieldKey: 'name',
          type: EDITOR_TYPES.TEXT_FIELD,
          isExists: isApplicationExists(),

        },
        {
          fieldKey: 'oktaClientId',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          onSearch: (searchValue: string) => searchOktaClient(searchValue),
          options: applicationOktaClients,
          renderTags: (values: ISelectOption[], getTagProps: AutocompleteGetTagProps) =>
            viewRenderer(values, getTagProps)
        }
      ],
    };
  };

  const viewRenderer = (
    countryChips: ISelectOption[],
    getTagProps?: AutocompleteGetTagProps,
    isReadMode?: boolean
  ): ReactNode => {
    const numTags = countryChips.length;
    const limitTags = 4;
    const chipsList = isReadMode ? countryChips : [ ...countryChips ].slice(0, limitTags);
    return (
      <div>
        {Utilities.customArraySort(chipsList, 'isO2Code').map((country: ISelectOption, index) => (
          <Tooltip title={country.value || ''} key={index}>
            <Chip
              classes={{ root: (classes as IClasses).root }}
              key={country.value}
              label={country.label}
              {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
            />
          </Tooltip>
        ))}
        {numTags > limitTags && !isReadMode && ` +${numTags - limitTags} more`}
      </div>
    );
  };

  const applicationId = (): string => {
    const { id } = params;
    return id ?? '';
  };

  const isApplicationExists = (): boolean | undefined => {
    const name = useUpsert.getField('name').value;
    return _applicationStore?.applications.some(
      t => Utilities.isEqual(t.name, name) && !Utilities.isEqual(t.name, application.name)
    );
  };

  const onAction = (action: GRID_ACTIONS): void => {
    if (action === GRID_ACTIONS.CANCEL) {
      navigateToServices();
      return;
    }
    upsertService();
  };

  const navigateToServices = (): void => {
    navigate('/user-management/applications');
  };

  const hasError = (): boolean => {
    return useUpsert.form.hasError
      || UIStore.pageLoading;
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        <div className={classes.flexRowSection}>
          <EditSaveButtons
            disabled={
              useUpsert.form.hasError || UIStore.pageLoading || hasError() || isApplicationExists()
            }
            hasEditPermission={true}
            isEditMode={true}
            onAction={action => onAction(action)}
          />
        </div>
      </>
    );
  };

  const setOktaClientValue = (selectedValue: ApplicationOktaClientModel[]): void => {
    if (!selectedValue) {
      setApplicationOktaClients([]);
      setSelectedApplicationOktaClient([]);
      return;
    }
    setSelectedApplicationOktaClient(selectedValue);
  };

  const searchOktaClient = (value: string): void => {
    if (value.length <= 2) {
      return;
    }
    _applicationStore
      .searchOktaClient(value)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500)
      )
      .subscribe(result => (setApplicationOktaClients(result)));
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    if (Utilities.isEqual(fieldKey, 'oktaClientId')) {
      setOktaClientValue(value);
    }
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={true}>
      <h2 className={classes.title}>
        {useUpsert.viewMode === VIEW_MODE.NEW ? 'Create New Application' : 'Edit Application'}
      </h2>
      <div className={classes.flexRow}>
        <div className={classes.flexWrap}>
          {
            groupInputControls().inputControls
              .filter(inputControl => !inputControl.isHidden)
              .map((inputControl: IViewInputControl, index: number) =>
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  isExists={inputControl.isExists}
                  classes={{
                    flexRow: classNames({
                      [classes.inputControl]: true,
                      [classes.fullFlex]: inputControl.fieldKey === 'oktaClientId',
                    }),
                  }}
                  field={useUpsert.getField(inputControl.fieldKey || '')}
                  isEditable={true}
                  onValueChange={option => onValueChange(option, inputControl.fieldKey || '')}
                />)
          }
        </div>
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject('applicationStore')(observer(UpsertApplications));
