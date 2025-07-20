import React, { FC, ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Menu, Typography } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { styles } from './FilterCustomers.style';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { CustomersStore } from '../../../Shared';
import { SelectInputControl } from '@wings-shared/form-controls';
import { SelectOption } from '@wings-shared/core';

interface Props {
  viewMode?: VIEW_MODE;
  customerStore?: CustomersStore;
  onSetClick: ({ status }) => void;
  anchorEl: HTMLElement;
}

const FilterCustomers: FC<Props> = ({ ...props }: Props) => {
  const _customerStore = props.customerStore as CustomersStore;
  const classes: Record<string, string> = styles();
  
  const categoryList: SelectOption[] = [
    new SelectOption({ name: 'ACTIVE', value: 'ACTIVE' }),
    new SelectOption({ name: 'INACTIVE', value: 'INACTIVE' }),
  ];

  const handleReset = () => {
    _customerStore?.setCustomerFilter('ACTIVE');
    props.onSetClick({
      status: 'ACTIVE',
    });
  }

  /* istanbul ignore next */
  const content = (): ReactNode => {
    return (
      <>
        <div className={classes.modalDetail}>
          <div className={classes.flexRow}>
            <Typography variant="h6" className={classes.subTitle}>
              Status
            </Typography>
            <SelectInputControl
              containerClass={classes.dropDown}
              value={_customerStore?.customerFilter}
              selectOptions={categoryList}
              onOptionChange={item => _customerStore?.setCustomerFilter(item)}
            />
          </div>
          <div className={classes.btnContainer}>
            <div className={classes.btnSection}>
              <PrimaryButton variant="contained" color="primary" onClick={handleReset}>
                Reset
              </PrimaryButton>
            </div>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() =>
                props.onSetClick({
                  status: _customerStore?.customerFilter,
                })
              }
            >
              Set
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <Menu
      id="basic-menu"
      anchorEl={props.anchorEl}
      open={true}
      onClose={() => ModalStore.close()}
      className={classes.modalRoot}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      {content()}
    </Menu>

  );
}

export default inject('customerStore',)(observer(FilterCustomers));
