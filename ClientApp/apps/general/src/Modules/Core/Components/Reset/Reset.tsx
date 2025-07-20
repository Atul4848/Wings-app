import React, { ChangeEvent, FC, useState } from 'react';
import { TextField, Button } from '@material-ui/core';
import { styles } from './Reset.styles';
import { inject, observer } from 'mobx-react';
import { CacheControlStore } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { UIStore, regex } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  cacheControlStore: CacheControlStore;
}

const Reset: FC<Props> = ({ cacheControlStore }: Props) => {
  const [ customerNumber, setCustomerNumber ] = useState<string>('');
  const _cacheControlStore = cacheControlStore as CacheControlStore;
  const unsubscribe = useUnsubscribe();
  const classes: Record<string, string> = styles();
  
  /* istanbul ignore next */
  const isCustomerNumberValid = (): boolean => {
    return regex.numberOnly.test(customerNumber || '');
  }

  const hasError = (): boolean => {
    return !isCustomerNumberValid() && Boolean(customerNumber);
  }

  /* istanbul ignore next */
  const invalidateCacheDate = () => {
    UIStore.setPageLoader(true);
    _cacheControlStore
      .invalidateCacheData(customerNumber || '')
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(() => (setCustomerNumber('')));
  }

  return (
    <div>
      <div className={classes.content}>
        <TextField
          label="Customer Number"
          placeholder="Enter customer number"
          className={classes.usernameInput}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) => setCustomerNumber(target.value)}
          value={customerNumber}
          error={hasError()}
          helperText={hasError() ? 'Enter number(s) only' : ''}
        />
        <Button
          color="primary"
          variant="contained"
          size="small"
          className={classes.btnSubmit}
          disabled={!isCustomerNumberValid()}
          onClick={() => invalidateCacheDate()}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default inject('cacheControlStore')(observer(Reset));
