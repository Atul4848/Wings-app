import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Typography } from '@material-ui/core';
import { ServicesStore, ServicesModel, RolesModel, ApplicationsModel, ApplicationsStore } from '../../../Shared';
import { fields } from './Fields';
import { useStyles } from './UpsertServices.styles';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IClasses, UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import {
  EDITOR_TYPES,
  ViewInputControl,
  IGroupInputControls,
  IViewInputControl,
  AutoCompleteControl,
} from '@wings-shared/form-controls';
import classNames from 'classnames';
import { forkJoin } from 'rxjs';
import { useUnsubscribe } from '@wings-shared/hooks';
import RoleFieldGrid from '../RoleFieldGrid/RoleFieldGrid';
import RoleField from '../RoleField/RoleField';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  params?: { mode: VIEW_MODE; id: string };
  serviceStore?: ServicesStore;
  applicationStore?: ApplicationsStore;
  navigate?: NavigateFunction;
};

const UpsertServices: FC<Props> = ({ ...props }: Props) => {
  const [ service, setService ] = useState(new ServicesModel({ id: '' }));
  const [ selectedApplication, setSelectedApplication ] = useState<ApplicationsModel | null>(new ApplicationsModel());

  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const applicationStore = props.applicationStore as ApplicationsStore;
  const serviceStore = props.serviceStore as ServicesStore;
  const navigate = useNavigate();

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
    loadInitialData();
    return (() => {
      props.serviceStore?.setRolesField([]);
    })
  }, []);

  const loadInitialData = (): void => {
    if (!serviceId()) {
      getApplications();
      return;
    }
    UIStore.setPageLoader(true);
    forkJoin([ serviceStore.getService(serviceId()), applicationStore.getApplications() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ service ]) => {
        setService(new ServicesModel(service));
        props.serviceStore?.setRolesField(service.roles);
        setSelectedApplication(new ApplicationsModel({ id: service.applicationId, name: service.applicationName }));
        useUpsert.setFormValues(service);
        return;
      });
  };

  const getApplications = () => {
    UIStore.setPageLoader(true);
    applicationStore
      .getApplications()
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(() => useUpsert.setFormValues(service));
  };

  const upsertService = (): void => {
    UIStore.setPageLoader(true);
    serviceStore
      .upsertService(serviceId(), getUpsertService(), useUpsert.viewMode == VIEW_MODE.NEW)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => navigateToServices(),
        error: error => AlertStore.critical(error.message),
      });
  };

  const getUpsertService = (): ServicesModel => {
    const formValues: ServicesModel = useUpsert.form.values();
    const serviceSetting = new ServicesModel({
      ...service,
      ...formValues,
      applicationName: selectedApplication?.name,
      applicationId: selectedApplication?.id,
      roles: props.serviceStore?.rolesField,
    });

    return serviceSetting;
  };

  const setApplicationValue = (_selectedApplication: ApplicationsModel): void => {
    if (!_selectedApplication) {
      applicationStore.applications = [];
      setSelectedApplication(null);
      return;
    }
    setSelectedApplication(_selectedApplication);
  };

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'Services',
      inputControls: [
        {
          fieldKey: 'name',
          type: EDITOR_TYPES.TEXT_FIELD,
          isExists: isServiceExists(),
        },
        {
          fieldKey: 'description',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'displayName',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'applicationName',
          type: EDITOR_TYPES.DROPDOWN,
          options: applicationStore?.applications,
        },
        {
          fieldKey: 'enabled',
          type: EDITOR_TYPES.SWITCH,
        },
      ],
    };
  };

  const serviceId = (): string => {
    const { id } = params;
    return id ?? '';
  };

  const isServiceExists = (): boolean => {
    const name = useUpsert.getField('name').value;
    return serviceStore.services.some(t => Utilities.isEqual(t.name, name) && !Utilities.isEqual(t.name, service.name));
  };

  const onAction = (action: GRID_ACTIONS): void => {
    if (action === GRID_ACTIONS.CANCEL) {
      navigateToServices();
      return;
    }
    upsertService();
  };

  const upsertRoleField = (roleField: RolesModel) => {
    if (roleField.id) {
      props.serviceStore?.setRolesField(
        props.serviceStore?.rolesField.map(x => (x.id === roleField.id ? roleField : x))
      );
      ModalStore.close();
      return;
    }

    roleField.id = Utilities.getTempId(true);
    props.serviceStore?.setRolesField([ ...props.serviceStore?.rolesField, roleField ]);
    ModalStore.close();
  };

  const deleteRoleField = (id: number) => {
    props.serviceStore?.setRolesField(props.serviceStore?.rolesField.filter(field => !Utilities.isEqual(field.id, id)));
    ModalStore.close();
  };

  const navigateToServices = (): void => {
    navigate('/user-management/app-services');
  };

  const hasError = (): boolean => {
    return useUpsert.form.hasError || UIStore.pageLoading;
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        <div className={classes.flexRowSection}>
          <EditSaveButtons
            disabled={useUpsert.form.hasError || UIStore.pageLoading || hasError() || isServiceExists()}
            hasEditPermission={true}
            isEditMode={true}
            onAction={action => onAction(action)}
          />
        </div>
      </>
    );
  };

  const openRoleFieldDialog = (roleField: RolesModel, viewMode: VIEW_MODE): void => {
    ModalStore.open(
      <RoleField
        title={viewMode === VIEW_MODE.NEW ? 'Add New Role' : 'Edit Role'}
        roleField={roleField}
        viewMode={viewMode}
        upsertRoleField={roleField => upsertRoleField(roleField)}
        rolesField={props.serviceStore?.rolesField}
        serviceStore={props.serviceStore}
      />
    );
  };

  const roleChildGrid = (): ReactNode => {
    return (
      <>
        <h2 className={classes.titleHeading}>Roles</h2>
        <RoleFieldGrid
          rolesField={props.serviceStore?.rolesField || []}
          openRoleFieldDialog={(roleField, viewMode) => openRoleFieldDialog(roleField, viewMode)}
          upsertRoleField={roleField => upsertRoleField(roleField)}
          deleteRoleField={(id: number) => deleteRoleField(id)}
        />
      </>
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
      <h2 className={classes.title}>
        {useUpsert.viewMode === VIEW_MODE.NEW ? 'Create New App Service' : 'App Service Information'}
      </h2>
      <div className={classes.flexRow}>
        <div className={classes.flexWrap}>
          {groupInputControls()
            .inputControls.filter(inputControl => !inputControl.isHidden)
            .map((inputControl: IViewInputControl, index: number) => {
              if (Utilities.isEqual(inputControl.fieldKey, 'applicationName') && useUpsert.isEditable) {
                return (
                  <>
                    <div className={classes.searchContainer}>
                      <Typography className={classes.titleHeading}>Application Name</Typography>
                      <AutoCompleteControl
                        placeHolder="Search Application Name"
                        options={applicationStore?.applications}
                        value={selectedApplication || { label: '', value: '' }}
                        onDropDownChange={option => {
                          setSelectedApplication(option as ApplicationsModel);
                        }}
                      />
                    </div>
                  </>
                );
              }
              return (
                <>
                  <ViewInputControl
                    {...inputControl}
                    key={index}
                    isExists={inputControl.isExists}
                    classes={{
                      flexRow: classNames({
                        [classes.inputControl]: true,
                        [classes.fullFlex]: inputControl.fieldKey === 'description',
                        [classes.enabled]: inputControl.fieldKey === 'enabled',
                      }),
                    }}
                    field={useUpsert.getField(inputControl.fieldKey || '')}
                    isEditable={useUpsert.isEditable}
                    onValueChange={option => useUpsert.onValueChange(option, inputControl.fieldKey || '')}
                  />
                </>
              );
            })}
          <div className={classes.label}>Disabled</div>
        </div>
        {useUpsert.viewMode === VIEW_MODE.EDIT && <div>{roleChildGrid()}</div>}
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject('serviceStore', 'applicationStore')(observer(UpsertServices));
