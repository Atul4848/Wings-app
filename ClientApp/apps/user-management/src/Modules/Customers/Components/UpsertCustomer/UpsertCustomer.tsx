import React, { FC, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { CustomersStore, CustomerModel, SiteModel } from '../../../Shared';
import { useStyles } from './UpsertCustomer.style';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ArrowBack } from '@material-ui/icons';
import { IClasses, UIStore, Utilities, DATE_FORMAT } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls } from '@wings-shared/form-controls';
import { CustomLinkButton, DetailsEditorWrapper } from '@wings-shared/layout';
import classNames from 'classnames';
import moment from 'moment';
import { AxiosError } from 'axios';
import CustomerData from '../CustomerData/CustomerData';
import { useUnsubscribe } from '@wings-shared/hooks';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  params?: { mode: VIEW_MODE; id: string };
  customerStore?: CustomersStore;
  navigate?: NavigateFunction;
};

const UpsertCustomer: FC<Props> = ({ ...props }: Props) => {
  const [ customer, setCustomer ] = useState(new CustomerModel({ id: '' }));

  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, null);
  const customerStore = props.customerStore as CustomersStore;
  const navigate = useNavigate();

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
    loadInitialData();
  }, []);

  const loadInitialData = (): void => {
    if (!customerId()) {
      return;
    }
    UIStore.setPageLoader(true);
    customerStore
      .getCustomer(customerId())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(customer => {
        setCustomer(new CustomerModel(customer));
        customer.status = 'INACTIVE';
        props.customerStore?.setSitesField(customer.sites);
        props.customerStore?.setSiteNumber(customer.sites[0].number);
        useUpsert.setFormValues(customer);
        return;
      });
  }

  const upsertCustomer = (): void => {
    UIStore.setPageLoader(true);
    customerStore
      .upsertCustomer(customerId(), getUpsertCustomerSetting(), useUpsert.viewMode == VIEW_MODE.NEW)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        () => {
          AlertStore.info('Customer updated successfully!');
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  const getUpsertCustomerSetting = (): CustomerModel => {
    const formValues: CustomerModel = useUpsert.form.values();
    const customerSetting = new CustomerModel({
      ...customer,
      ...formValues,
      sites: props.customerStore?.sites,
    });
    return customerSetting;
  }

  const groupInputControls = (): IGroupInputControls =>{
    return {
      title: 'Customers',
      inputControls: [
        {
          fieldKey: 'name',
          label: 'Name',
        },
        {
          fieldKey: 'number',
          label: 'Customer Number',
        },
        {
          fieldKey: 'status',
          label: 'Status',
        },
        {
          fieldKey: 'endDate',
          label: 'End Date',
          type: EDITOR_TYPES.DATE_TIME,
          dateTimeFormat: DATE_FORMAT.AIRPORT_HOURS_DATE_TIME,
          minDate: moment().format(DATE_FORMAT.AIRPORT_HOURS_DATE_TIME),
        },
      ],
    };
  }

  const customerId = (): string => {
    const { id } = params;
    return id ?? '';
  }

  const upsertSiteField = (siteField: SiteModel) => {
    if (siteField.id) {
      props.customerStore?.setSitesField(props.customerStore?.sites.map(x => (x.id === siteField.id ? siteField : x)));
      ModalStore.close();
      return;
    }

    siteField.id = Utilities.getTempId(true);
    props.customerStore?.setSitesField([ ...props.customerStore?.sites, siteField ])
    ModalStore.close();
    upsertCustomer();
  }

  const deleteSiteField = (siteField) =>{
    props.customerStore?.setSitesField(props.customerStore?.sites.filter(
      field =>
        !(
          Utilities.isEqual(field.number, siteField?.number) &&
          Utilities.isEqual(field.services?.[0], siteField.services?.[0])
        )
    ));
    ModalStore.close();
    UIStore.setPageLoader(true);
    customerStore
      .upsertCustomer(getUpsertCustomerSetting(), useUpsert.viewMode == VIEW_MODE.NEW)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        () => {
          AlertStore.info('Site deleted successfully');
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  const navigateToUvgoSettings = (): void => {
    navigate(`/user-management/customers/${customerId()}/edit`);
  }

  return(
    <DetailsEditorWrapper headerActions={null} isEditMode={useUpsert.isEditable}>
      <div className={classes.flexSection}>
        <CustomLinkButton to="/user-management/customers" title="Back to customers" startIcon={<ArrowBack />} />
      </div>
      <div className={classes.flexRow}>
        <div className={classes.flexWrap}>
          {groupInputControls().inputControls.map((field, index) => (
            <ViewInputControl
              key={index}
              type={EDITOR_TYPES.TEXT_FIELD}
              classes={{
                flexRow: classNames({
                  [classes.inputControl]: true,
                  [classes.inActive]: field.label === 'Status' && customer.status === 'INACTIVE',
                  [classes.active]: field.label === 'Status' && customer.status === 'ACTIVE',
                }),
              }}
              field={{ value: customer[field.fieldKey], label: field.label }}
              isEditable={false}
            />
          ))}
        </div>
        <CustomerData
          sitesField={props.customerStore?.sites || []}
          deleteSiteField={siteField => deleteSiteField(siteField)}
          upsertSiteField={siteField => upsertSiteField(siteField)}
        />
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject('customerStore')(observer(UpsertCustomer));
