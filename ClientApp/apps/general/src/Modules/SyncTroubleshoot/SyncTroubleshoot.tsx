import React, { ChangeEvent, FC, useState } from 'react';
import { TextField, Button, Typography } from '@material-ui/core';
import { styles } from './SyncTroubleshoot.styles';
import { inject, observer } from 'mobx-react';
import { SyncTroubleshootStore } from '../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import { finalize, takeUntil } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { UIStore, regex } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  syncTroubleshootStore?: SyncTroubleshootStore;
}

const SyncTroubleshoot: FC<Props> = ({ ...props }: Props) => {

  const [ customerNumber, setCustomerNumber ] = useState<string>('');
  const [ clearCacheTripsCustomerNumber, setClearCacheTripsCustomerNumber ] = useState<string>('');
  const [ tripNumber, setTripNumber ] = useState<number | null>();
  const [ syncInformationTripNumber, setSyncInformationTripNumber ] = useState<number | null>();
  const [ syncTripNumber, setSyncTripNumber ] = useState<number | null>();
  const [ reactvateTripNumber, setReactivateTripNumber ] = useState<number | null>();
  const [ tripId, setTripId ] = useState<number | null>();
  const [ username, setUsername ] = useState<string>('');
  const [ syncTripUsername, setSyncTripUsername ] = useState<string>('');

  const classes: Record<string, string> = styles();
  const _syncTroubleshootStore = props.syncTroubleshootStore as SyncTroubleshootStore;
  const unsubscribe = useUnsubscribe();

  /* istanbul ignore next */
  const triggerCacheCustomerNumber = (customerNumber: string): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.triggerCachedCustomerNumber(customerNumber)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result: any) => {
          setCustomerNumber('');
          AlertStore.info(`Cache Reload Triggered Successfully. Job Id: ${result}`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const triggerCachedTripNumber = (tripNumber: number): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.triggerCachedTripNumber(tripNumber)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result: any) => {
          setTripNumber(null);
          AlertStore.info(`Cache Reload Triggered Successfully. Job Id: ${result}`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const reactivateArchiveTrip = (tripNumber: number): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.reactivateArchiveTrip(tripNumber)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result: any) => {
          setReactivateTripNumber(null);
          AlertStore.info('Trip reactivated successfully');
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const triggerCachedTripId = (tripId: number): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.triggerCachedTripId(tripId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result: any) => {
          setTripId(null);
          AlertStore.info(`Cache Reload Triggered Successfully. Job Id: ${result}`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const triggerCacheReload = (): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.triggerCacheReload()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result: any) => {
          AlertStore.info(`Cache Reload Triggered Successfully. Job Id: ${result}`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const triggerSyncInformation = (tripNumber: number): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.triggerSyncInformation(tripNumber)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result: any) => {
          setSyncInformationTripNumber(null);
          if (result) {
            showSuccessDialog(result);
          }
          else{
            AlertStore.info(`No information available for trip number: ${tripNumber}`);
          }
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const getLabel = (value: any): string => {
    return value ? 'True' : 'False';
  }

  /* istanbul ignore next */
  const showSuccessDialog = (data: any): void => {
    ModalStore.open(
      <Dialog
        key="Dialog"
        title={'Trip Sync Information'}
        open={true}
        onClose={() => ModalStore.close()}
        dialogContent={() => {
          return (
            <div className={classes.formSection}>
              <div className={classes.formDetail}>
                <div>Trip Id</div>
                <div>{data.TripId}</div>
              </div>
              <div className={classes.formDetail}>
                <div>TripNumber</div>
                <div>{data.TripNumber}</div>
              </div>
              <div className={classes.formDetail}>
                <div>Is Has Expired</div>
                <div>{getLabel(data.IsHashExpired)}</div>
              </div>
              <div className={classes.formDetail}>
                <div>Is Trip OnHold</div>
                <div>{getLabel(data.IsTripOnHold)}</div>
              </div>
              <div className={classes.formDetail}>
                <div>Is Trip Lock</div>
                <div>{getLabel(data.IsTripLock)}</div>
              </div>
              <div className={classes.formDetail}>
                <div>Is Trip Dirty</div>
                <div>{getLabel(data.IsTripDirty)}</div>
              </div>
              <div className={classes.formDetail}>
                <div>Is Trip OnDbo</div>
                <div>{data.IsTripOnDbo ? 'True' : 'False'}</div>
              </div>
              <div className={classes.formDetail}>
                <div>Is Trip OnCache</div>
                <div>{getLabel(data.IsTripOnCache)}</div>
              </div>
              <div className={classes.formDetail}>
                <div>Last Update</div>
                <div>{data.LastUpdate}</div>
              </div>
              <div className={classes.formDetail}>
                <div>Last Update Source</div>
                <div>{data.LastUpdateSource}</div>
              </div>
            </div>
          );
        }}
      />
    );
  }

  /* istanbul ignore next */
  const triggerLoadHistoryJob = (): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.triggerLoadHistoryJob()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result: any) => {
          AlertStore.info(`Load Data Sync History Successfully. Job Id: ${result}`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const clearCacheTrips = (customerNumber: string): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.clearCacheTrips(customerNumber)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result) => {
          setClearCacheTripsCustomerNumber('');
          AlertStore.info(`Cache Reload Triggered Successfully. Job Id: ${result}`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const triggerArchiveLoadTripsJob = (): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.triggerArchiveLoadTripsJob()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result) => {
          AlertStore.info(`Archive Load Trips Job Triggered Successfully. Job Id: ${result}`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const clearAirportsCache = (): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.clearAirportsCache()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result) => {
          if (result) {
            AlertStore.info('Airports cache cleared successfully.');
          } else {
            AlertStore.info('Failed to clear airport cache from redis.');
          }
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const triggerCompletedTripsReload = (): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.triggerCompletedTripsReload()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result) => {
          AlertStore.info(`Completed Trips Reload Triggered Successfully. Job Id: ${result}`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const triggerAPGRegistriesJob = (): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.triggerAPGRegistriesJob()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result: any) => {
          AlertStore.info(`Enqueued Job Id: ${result}`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const triggerSyncTrip = (tripNumber: number, username: string): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.triggerSyncTrip(tripNumber, username)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result) => {
          setSyncTripNumber(null);
          setSyncTripUsername('');
          AlertStore.info(`Sync Trip Number Successfully. Job Id: ${result}`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const refreshUserTripsByUsername = (username: string): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      ?.refreshUserTripsByUsername(username)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result) => {
          setUsername('');
          AlertStore.info(`Refreshed '${result}' user trips for user: ${username}`);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const isCustomerNumberValid = (): boolean => {
    return regex.numberOnly.test(customerNumber);
  }

  /* istanbul ignore next */
  const isClearCacheTripsCustomerNumberValid = (): boolean => {
    return regex.numberOnly.test(clearCacheTripsCustomerNumber);
  }

  /* istanbul ignore next */
  const isTripNumberValid = (): boolean => {
    return regex.numberOnly.test(tripNumber?.toString() || '');
  }

  /* istanbul ignore next */
  const isSyncInformationTripNumberValid = (): boolean => {
    return regex.numberOnly.test(syncInformationTripNumber?.toString());
  }

  /* istanbul ignore next */
  const isSyncTripNumberValid = (): boolean => {
    return regex.numberOnly.test(syncTripNumber?.toString());
  }

  const isReactivateTripNumberValid = (): boolean => {
    return regex.numberOnly.test(reactvateTripNumber?.toString());
  }

  /* istanbul ignore next */
  const istripIdValid = (): boolean => {
    return regex.numberOnly.test(tripId?.toString() || '');
  }

  /* istanbul ignore next */
  const isUsernameValid = (): boolean => {
    return Boolean(username && regex.alphaNumericWithUnderscore.test(username));
  }

  /* istanbul ignore next */
  const isSyncTripUsernameValid = (): boolean => {
    return Boolean(syncTripUsername && regex.alphaNumericWithUnderscore.test(syncTripUsername));
  }

  /* istanbul ignore next */
  const onChange = (value, type): void => {
    switch (type) {
      case 'customerNumber':
        setCustomerNumber(value || null);
        break;
      case 'clearCacheTripsCustomerNumber':
        setClearCacheTripsCustomerNumber(value || null);
        break;
      case 'tripNumber':
        setTripNumber(value || null);
        break;
      case 'syncInformationTripNumber':
        setSyncInformationTripNumber(value || null);
        break;
      case 'syncTripNumber':
        setSyncTripNumber(value || null);
        break;
      case 'reactvateTripNumber':
        setReactivateTripNumber(value || null);
        break;
      case 'tripId':
        setTripId(value || null);
        break;
      case 'syncTripUsername':
        setSyncTripUsername(value);
        break;
      case 'username':
        setUsername(value);
        break;
    }
  }
  return (
    <div>
      <div className={classes.headerContainer}>
        <div className={classes.subSection}>
          <SyncProblemIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            Sync Troubleshoot
          </Typography>
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.inputBox}>
          <TextField
            label="Refresh Cache by Customer Number"
            placeholder="Enter customer number"
            className={classes.usernameInput}
            value={customerNumber}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) => onChange(target.value, 'customerNumber')}
            error={!isCustomerNumberValid() && Boolean(customerNumber)}
            helperText={!isCustomerNumberValid() && Boolean(customerNumber) ? 'Enter number(s) only' : ''}
          />
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            disabled={!isCustomerNumberValid() || UIStore.pageLoading}
            onClick={() => triggerCacheCustomerNumber(customerNumber)}
          >
            Submit
          </Button>
        </div>
        <div>
          <TextField
            label="Refresh Cache by Trip Number"
            placeholder="Enter trip number"
            className={classes.usernameInput}
            value={tripNumber || ''}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) => onChange(target.value, 'tripNumber')}
            error={!isTripNumberValid() && Boolean(tripNumber)}
            helperText={!isTripNumberValid() && Boolean(tripNumber) ? 'Enter number(s) only' : ''}
          />
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            disabled={!isTripNumberValid() || UIStore.pageLoading}
            onClick={() => triggerCachedTripNumber(tripNumber as number)}
          >
            Submit
          </Button>
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.inputBox}>
          <TextField
            label="Refresh Cache by Trip Id"
            placeholder="Enter trip id"
            className={classes.usernameInput}
            value={tripId || ''}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) => onChange(target.value, 'tripId')}
            error={!istripIdValid() && Boolean(tripId)}
            helperText={!istripIdValid() && Boolean(tripId) ? 'Enter number(s) only' : ''}
          />
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            disabled={!istripIdValid() || UIStore.pageLoading}
            onClick={() => triggerCachedTripId(tripId as number)}
          >
            Submit
          </Button>
        </div>
        <div>
          <TextField
            label="Trip Sync Information"
            placeholder="Trip number"
            className={classes.usernameInput}
            value={syncInformationTripNumber || ''}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              onChange(target.value, 'syncInformationTripNumber')
            }
            error={!isSyncInformationTripNumberValid() && Boolean(syncInformationTripNumber)}
            helperText={
              !isSyncInformationTripNumberValid() && Boolean(syncInformationTripNumber)
                ? 'Enter number(s) only'
                : ''
            }
          />
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            disabled={!isSyncInformationTripNumberValid() || UIStore.pageLoading}
            onClick={() => triggerSyncInformation(syncInformationTripNumber)}
          >
            Submit
          </Button>
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.inputBox}>
          <TextField
            label="Clear DIY Trips by Customer Number"
            placeholder="Customer number"
            className={classes.usernameInput}
            value={clearCacheTripsCustomerNumber || ''}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              onChange(target.value, 'clearCacheTripsCustomerNumber')
            }
            error={!isClearCacheTripsCustomerNumberValid() && Boolean(clearCacheTripsCustomerNumber)}
            helperText={
              !isClearCacheTripsCustomerNumberValid() && Boolean(clearCacheTripsCustomerNumber)
                ? 'Enter number(s) only'
                : ''
            }
          />
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            disabled={!isClearCacheTripsCustomerNumberValid() || UIStore.pageLoading}
            onClick={() => clearCacheTrips(clearCacheTripsCustomerNumber)}
          >
            Submit
          </Button>
        </div>
        <div>
          <TextField
            label="Refresh User Trips (Username)"
            placeholder="Username"
            className={classes.usernameInput}
            value={username}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) => onChange(target.value, 'username')}
            error={!isUsernameValid() && Boolean(username)}
            helperText={!isUsernameValid() && Boolean(username) ? 'Enter Valid Username' : ''}
          />
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            disabled={!isUsernameValid() || UIStore.pageLoading}
            onClick={() => refreshUserTripsByUsername(username)}
          >
            Submit
          </Button>
        </div>
      </div>
      <div className={classes.content}>
        <div>
          <TextField
            label="Reactivate Trip by Trip Number"
            placeholder="Enter trip number"
            className={classes.usernameInput}
            value={reactvateTripNumber || ''}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) => onChange(target.value, 'reactvateTripNumber')}
            error={!isReactivateTripNumberValid() && Boolean(reactvateTripNumber)}
            helperText={!isReactivateTripNumberValid() && Boolean(reactvateTripNumber) ? 'Enter number(s) only' : ''}
          />
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            disabled={!isReactivateTripNumberValid() || UIStore.pageLoading}
            onClick={() => reactivateArchiveTrip(reactvateTripNumber as number)}
          >
            Submit
          </Button>
        </div>
      </div>
      <div className={classes.doubleContent}>
        <Typography variant="body2" component="h6">
          Sync Trip Number
        </Typography>
        <TextField
          placeholder="Trip number"
          className={classes.usernameInput}
          value={syncTripNumber || ''}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) => onChange(target.value, 'syncTripNumber')}
          error={!isSyncTripNumberValid() && Boolean(syncTripNumber)}
          helperText={!isSyncTripNumberValid() && Boolean(syncTripNumber) ? 'Enter number(s) only' : ''}
        />
        <TextField
          placeholder="Username"
          className={classes.usernameInput}
          value={syncTripUsername}
          onChange={({ target }: ChangeEvent<HTMLInputElement>) => onChange(target.value, 'syncTripUsername')}
          error={!isSyncTripUsernameValid() && Boolean(syncTripUsername)}
          helperText={!isSyncTripUsernameValid() && Boolean(syncTripUsername) ? 'Enter Valid Username' : ''}
        />
        <Button
          color="primary"
          variant="contained"
          size="small"
          className={classes.btnSubmit}
          disabled={!(isSyncTripNumberValid() && isSyncTripUsernameValid())}
          onClick={() => triggerSyncTrip(syncTripNumber, syncTripUsername)}
        >
          Submit
        </Button>
      </div>
      <div className={classes.singleContent}>
        <div className={classes.inputBox}>
          <Typography variant="body2" component="h6">
            Run Cache Reload
          </Typography>
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            onClick={() => triggerCacheReload()}
          >
            First Time Loader
          </Button>
        </div>
        <div>
          <Typography variant="body2" component="h6">
            Run Load History
          </Typography>
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            onClick={() => triggerLoadHistoryJob()}
          >
            Load History
          </Button>
        </div>
      </div>
      <div className={classes.singleContent}>
        <div className={classes.inputBox}>
          <Typography variant="body2" component="h6">
            Clear Airports Cache (Redis)
          </Typography>
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            onClick={() => clearAirportsCache()}
          >
            Clear Cache
          </Button>
        </div>
        <div>
          <Typography variant="body2" component="h6">
            Run Archived Trips Load
          </Typography>
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            onClick={() => triggerArchiveLoadTripsJob()}
          >
            Archived Trips Loader
          </Button>
        </div>
      </div>
      <div className={classes.singleContent}>
        <div className={classes.inputBox}>
          <Typography variant="body2" component="h6">
            Trigger Completed Trips Reload
          </Typography>
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            onClick={() => triggerCompletedTripsReload()}
          >
            Trigger Completed Trips Reload
          </Button>
        </div>
        <div>
          <Typography variant="body2" component="h6">
            Trigger APG Registries
          </Typography>
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnSubmit}
            onClick={() => triggerAPGRegistriesJob()}
          >
            Trigger APG Registries
          </Button>
        </div>
      </div>
    </div>
  );
};

export default inject('syncTroubleshootStore')(observer(SyncTroubleshoot));
