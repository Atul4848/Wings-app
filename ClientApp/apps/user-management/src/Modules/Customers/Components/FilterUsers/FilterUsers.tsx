import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { inject, observer } from 'mobx-react';
import { useStyles } from './FilterUsers.style';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { CustomersStore, RolesModel, ServicesModel, ServicesStore, SiteModel } from '../../../Shared';
import { AutoCompleteControl } from '@wings-shared/form-controls';
import { IClasses, ISelectOption } from '@wings-shared/core';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  serviceStore?: ServicesStore;
  customerStore?: CustomersStore;
  onSetClick: ({ sites, roleIds }) => null;
  customerId: string;
};

const FilterUsers: FC<Props> = ({ ...props }) => {
  const [ serviceUsers, setServiceUsers ] = useState<ServicesModel[]>([]);
  const [ selectedServices, setSelectedServices ] = useState<ServicesModel | null>(
    props.customerStore?.filterValues.service
  );
  const [ selectedRole, setSelectedRole ] = useState<RolesModel[] | null>(props.customerStore?.filterValues.roles);
  const [ siteOptions, setSiteOptions ] = useState<SiteModel[]>([]);
  const [ selectedSite, setSelectedSite ] = useState<SiteModel | null>(props.customerStore?.filterValues.sites);
  const classes = useStyles();

  useEffect(() => {
    props.customerStore?.getCustomer(props?.customerId).subscribe(() => {}),
    props.serviceStore?.getServices().subscribe(() => {})

  }, []);

  const handleReset = () => {
    props.customerStore?.setFilterValues({ service: new ServicesModel(), roles: [], sites: new SiteModel() });
    props.customerStore?.setSiteNumber(props.customerStore?.sites[0].number);
    props.onSetClick({ sites: new SiteModel(), roleIds: [] });
  }

  const loadAppServices = (): ISelectOption[] => {
    return props.serviceStore?.services;
  }

  const loadSites = (): ISelectOption[] => {
    return props.customerStore?.sites
  }

  const setServiceValue = (_selectedService: ServicesModel): void => {
    if (!_selectedService) {
      setServiceUsers([]);
      setSelectedServices(null);
      return;
    }
    props.customerStore?.setFilterValues({
      service: _selectedService,
      sites: new SiteModel(),
      roles: []
    });
    setSelectedServices(_selectedService);
  }

  const setRolesValue = (_selectedRole: RolesModel[]): void => {
    if (!_selectedRole || !_selectedRole.length) {
      setSelectedRole([]);
      return;
    }
    setSelectedRole(_selectedRole);
  }

  const setSiteValue = (_selectedSite: SiteModel): void => {
    if (!_selectedSite) {
      setSiteOptions([]);
      setSelectedSite(null);
      return;
    }
    setSelectedSite(_selectedSite);
    props.customerStore?.setSiteNumber(_selectedSite.number);
  }

  const dialogContent = (): ReactNode => {
    return (
      <>
        <div className={classes.modalDetail}>
          <div className={classes.flexRow}>
            <div className={classes.autoContainer}>
              <AutoCompleteControl
                placeHolder="Search App Services"
                options={loadAppServices()}
                value={selectedServices || { label: '', value: '' }}
                onDropDownChange={selectedOption => setServiceValue(selectedOption as ServicesModel)}
              />
            </div>
            <div className={classes.autoContainer}>
              <AutoCompleteControl
                multiple={true}
                placeHolder="Search Roles"
                options={props.serviceStore?.services.find(x => x.name === selectedServices?.name)?.roles || []}
                value={selectedRole}
                useControlledValue={true}
                onDropDownChange={selectedOption => setRolesValue(selectedOption as RolesModel[])}
              />
            </div>
            <div className={classes.autoContainer}>
              <AutoCompleteControl
                placeHolder="Search Site"
                options={loadSites() || []}
                value={selectedSite}
                onDropDownChange={selectedOption => setSiteValue(selectedOption as SiteModel)}
              />
            </div>
          </div>
          <div className={classes.btnContainer}>
            <div className={classes.btnSection}>
              <PrimaryButton variant="contained" color="primary" onClick={() => handleReset()}>
                Reset
              </PrimaryButton>
            </div>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() => {
                props.customerStore?.setFilterValues({
                  service: selectedServices,
                  roles: selectedRole,
                  sites: selectedSite,
                });
                props.onSetClick({
                  sites: selectedSite?.number,
                  roleIds: selectedRole?.map(x => x.roleId),
                });
              }}
            >
              Set
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <Dialog
      title="Filter Logs"
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}

export default inject('serviceStore', 'customerStore')(observer(FilterUsers));