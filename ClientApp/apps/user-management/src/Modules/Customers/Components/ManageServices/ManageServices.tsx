import { Typography, Button } from '@material-ui/core';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { AutoCompleteControl } from '@wings-shared/form-controls';
import { useStyles } from './ManageServices.style';
import {
  CustomerModel,
  ServicesModel,
  SiteModel,
  RolesModel,
  CustomersStore,
  ServicesStore,
} from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil, debounceTime } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { TrashIcon } from '@uvgo-shared/icons';
import { IClasses, IAPIGridRequest, UIStore } from '@wings-shared/core';
import classNames from 'classnames';
import { useUnsubscribe } from '@wings-shared/hooks';

type Props = {
  classes?: IClasses;
  upsertSiteField: (siteField) => void;
  sitesField: SiteModel[];
  deleteSiteField: (siteField) => void;
  customerStore?: CustomersStore;
  serviceStore?: ServicesStore;
};


const ManageServices: FC<Props> = ({ ...props }) => {
  const [ isRequired, setIsRequired ] = useState(true);
  const [ isExist, setIsExist ] = useState(false);
  const [ isNewService, setIsNewService ] = useState(false);
  const [ existIndex, setExistIndex ] = useState<number>(0);
  const [ customerUsers, setCustomerUsers ] = useState<CustomerModel[]>([]);
  const [ servicesUsers, setServicesUsers ] = useState<ServicesModel[]>([]);
  const [ siteOptions, setSiteOptions ] = useState<SiteModel[]>([]);
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = (): void => {
    props.serviceStore?.setInputList(props.sitesField);
    setSiteOptions(props.serviceStore?.inputList.map(x=> x.site))
  }

  const setInputListContainer = (input: any): void => {
    props.serviceStore?.setInputList(input);
  }
  const hasValue = (input: boolean): void => {
    setIsRequired(input);
  }
  const checkExistence = (input: boolean, index: number = 0): void => {
    setIsExist(input);
    setExistIndex(index);
  }

  const checkObjects = (x, y, index) => {
    for (const i in x) {
      if (isNewService && index.toString() === i) continue;

      if (
        x[i].site.number === y.site.number &&
        x[i].service.name === y.service.name
      ) {
        return checkExistence(true, index);
      }
    }
    return checkExistence(false, index);
  }

  const handleRemoveClick = (x, index) => {
    if (index === props.serviceStore?.inputList.length - 1) {
      setIsNewService(false);
    }
    const list = [ ...props.serviceStore?.inputList ];
    list.splice(index, 1);
    const isDuplicate = list
      .map(function(value) {
        return value.site.number + value.service.name;
      })
      .some(function(value, index, array) {
        return array.indexOf(value) !== array.lastIndexOf(value);
      });
    checkExistence(isDuplicate);
    setInputListContainer(list);
    const siteModel = new SiteModel({
      number: x.site.number,
      services: [ x.service.name ],
      siteUseId: x.site.siteUseId,
      endDate: null,
    })
    props.deleteSiteField(siteModel);
  };

  const handleAddClick = (): void => {
    const hasValueRequired = props.serviceStore?.inputList.some(
      x => x.site.number === '' || x.service.name === ''
    );
    if (hasValueRequired) {
      return hasValue(false);
    }
    const isDuplicate = props.serviceStore?.inputList
      .map(function(value) {
        return value.site.number + value.service.name;
      })
      .some(function(value, index, array) {
        return array.indexOf(value) !== array.lastIndexOf(value);
      });
    checkExistence(isDuplicate);
    setIsNewService(true);
    hasValue(true);
    setInputListContainer([
      ...props.serviceStore?.inputList,
      {
        site: new SiteModel(),
        service: new ServicesModel(),
      },
    ]);
  }

  const saveCustomerRecord = (x, index) => {
    const hasValueRequired = props.serviceStore?.inputList.some(
      x =>
        x.site === null ||
        x.site.number === '' ||
        x.service === null ||
        x.service.name === ''
    );
    if (hasValueRequired) {
      return hasValue(false);
    }
    checkObjects(props.serviceStore?.inputList, x, index);
    if (isExist) return;
    setIsNewService(false);
    const siteModel = new SiteModel({
      number: x.site.number,
      services: [ x.service.name ],
      siteUseId: x.site.siteUseId,
      endDate: null,
    })
    props.upsertSiteField(siteModel);
  }

  const searchCustomerUsers = (value: string, pageRequest?: IAPIGridRequest): void => {
    if (value.length <= 2) {
      return;
    }
    
    const request: IAPIGridRequest = {
      ...pageRequest,
      searchCollection: value,
    };
    UIStore.setPageLoader(true);
    props.customerStore?.getCustomers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(users => {
        setCustomerUsers(users.results);
      });
  }

  const setCustomerValue = (selectedInput, index: number): void => {
    if (!selectedInput) {
      setCustomerUsers([]);
      return;
    }
    props.serviceStore.inputList[index] = selectedInput;
  }

  const searchServices = (value: string, pageRequest?: IAPIGridRequest): void => {
    if (value.length <= 2) {
      return;
    }
    const request: IAPIGridRequest = {
      ...pageRequest,
      searchCollection: value,
    };
    UIStore.setPageLoader(true);
    props.serviceStore?.getServices(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(users => {
        setServicesUsers(users.results);
      });
  }

  const setServiceValue = (selectedInput, index: number): void => {
    if (!selectedInput) {
      setServicesUsers([]);
      return;
    }
    props.serviceStore.inputList[index] = selectedInput;
  }

  const dialogContent = (): ReactNode => {
    return (
      <div className={classes.modaldetail}>
        {isExist && <div className={classes.filledError}>Manage Roles combination already exists</div>}
        {!isRequired && <div className={classes.filledError}>All fields are required</div>}
        {props.serviceStore?.inputList &&
          props.serviceStore?.inputList.map((x, i) => {
            const autoCompleteSection = classNames({
              [classes.autoCompleteContainer]: true,
              [classes.autoCompleteError]: isExist && i === existIndex,
            });
            return (
              <div className={classes.boxContainer}>
                <div className={autoCompleteSection}>
                  <Typography variant="h6" component="h2" className={classes.modalheading}>
                    Services
                  </Typography>
                  <AutoCompleteControl
                    placeHolder="Search Services"
                    options={servicesUsers}
                    value={x.service}
                    onDropDownChange={selectedOption => setServiceValue({ ...x, service: selectedOption }, i)}
                    onSearch={(searchValue: string) => searchServices(searchValue)}
                  />
                </div>
                <div className={autoCompleteSection}>
                  <Typography variant="h6" component="h2" className={classes.modalheading}>
                    Site
                  </Typography>
                  <AutoCompleteControl
                    placeHolder="Search Site"
                    options={siteOptions || []}
                    value={x.site}
                    onDropDownChange={selectedOption => setCustomerValue({ ...x, site: selectedOption }, i)}
                  />
                </div>
                <div className={classes.btnSave}>
                  <Button
                    color="primary"
                    variant="contained"
                    disabled={
                      isExist ||
                      props.serviceStore?.inputList.length === 10 ||
                      props.serviceStore?.inputList.length === 1
                    }
                    onClick={() => saveCustomerRecord(x, i)}
                  >
                    Save
                  </Button>
                </div>
                <Button className={classes.deleteBtn} onClick={() => handleRemoveClick(x, i)}>
                  <TrashIcon size="x-large" />
                </Button>
              </div>
            );
          })}
        <div className={classes.addBtn}>
          <Button
            color="primary"
            variant="contained"
            disabled={props.serviceStore?.inputList.length === 10}
            onClick={() => handleAddClick()}
          >
            Add Service
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog
      title="Manage Services"
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.userGroupWidth,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}
export default inject('customerStore', 'serviceStore')(observer(ManageServices));
