import React, { FC, ReactNode, useMemo } from 'react';
import { DropdownItem } from '@wings-shared/form-controls';
import { styles } from './Facts.styles';
import { withStyles, Theme, Typography } from '@material-ui/core';
import { SyncTroubleshootStore, UserFactDetails } from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dropdown, DROPDOWN_TRIGGER } from '@uvgo-shared/dropdown';
import ArrowDropDownOutlinedIcon from '@material-ui/icons/ArrowDropDownOutlined';
import { IClasses, UIStore, UnsubscribableComponent } from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuthStore, useRoles } from '@wings-shared/security';
import { InfoIcon } from '@uvgo-shared/icons';

interface Props {
  syncTroubleshootStore?: SyncTroubleshootStore;
}

const Facts: FC<Props> = ({ ...props }: Props) => {

  const _syncTroubleshootStore = props.syncTroubleshootStore as SyncTroubleshootStore;
  const unsubscribe = useUnsubscribe();
  const classes: Record<string, string> = styles();

  /* istanbul ignore next */
  const checkFactsCleanupFIQ = (): void => {
    UIStore.setPageLoader(true);
    const payload: any = {
      Facts: [
        {
          Predicate: 'has_role',
          Args: [
            new UserFactDetails({
              Type: 'User',
              Id: null,
            }),
            new UserFactDetails({
              Type: 'String',
              Id: 'fiq_subscriber',
            }),
            new UserFactDetails({
              Type: 'FIQReport',
              Id: null,
            }),
          ],
        },
      ],
    };
    _syncTroubleshootStore
      .factsCleanup(payload)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (response: any) => {
          AlertStore.info(response.Message);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const checkFactsCleanupTrip = (): void => {
    UIStore.setPageLoader(true);
    const payload: any = {
      Facts: [
        {
          Predicate: 'has_relation',
          Args: [
            new UserFactDetails({
              Type: 'Trip',
              Id: null,
            }),
            new UserFactDetails({
              Type: 'String',
              Id: 'site',
            }),
            new UserFactDetails({
              Type: 'CustomerSite',
              Id: null,
            }),
          ],
        },
      ],
    };
    _syncTroubleshootStore
      .factsCleanup(payload)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (response: any) => {
          AlertStore.info(response.Message);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  const triggerFactsLoader = (loaderType: string): void => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      .triggerFactsLoader(loaderType)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (response: any) => {
          AlertStore.info(response.Message);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  };

  const dropdownOptionsList = () => {
    return [
      {
        title: 'FIQ Reports',
        onClick: () => {
          ModalStore.open(
            <ConfirmDialog
              title="Confirm FIQ Report Fact Loading"
              message="Are you sure you want to upload all FIQ Facts to OSO Cloud?"
              yesButton="Yes"
              onNoClick={() => ModalStore.close()}
              onYesClick={() => triggerFactsLoader('FIQReports')}
            />
          );
        },
        isHidden: false,
      },
      {
        title: 'Trips Facts',
        onClick: () => {
          ModalStore.open(
            <ConfirmDialog
              title="Confirm Trips Facts Loading"
              message="Are you sure you want to upload all Trips Facts to OSO Cloud?"
              yesButton="Yes"
              onNoClick={() => ModalStore.close()}
              onYesClick={() => triggerFactsLoader('Trips')}
            />
          );
        },
        isHidden: false,
      },
    ];
  }

  const dropdownOptionsClearFactsList = () => {
    return [
      {
        title: 'FIQ Report Subscriber Role',
        onClick: () => {
          ModalStore.open(
            <ConfirmDialog 
              title="Delete FIQ Report Subscriber Role Facts"
              message="This will remove all of the OSO cloud facts and cannot be undone."
              yesButton="Yes"
              onNoClick={() => ModalStore.close()}
              onYesClick={() => checkFactsCleanupFIQ()}
            />
          );
        },
        isHidden: false,
      },
      {
        title: 'Trip Customer Site Relation',
        onClick: () => {
          ModalStore.open(
            <ConfirmDialog
              title="Delete Trip Customer Site Relation Facts"
              message="This will remove all of the OSO cloud facts and cannot be undone."
              yesButton="Yes"
              onNoClick={() => ModalStore.close()}
              onYesClick={() => checkFactsCleanupTrip()}
            />
          );
        },
        isHidden: false,
      },
    ];
  }

  const dropdownOptions = (): ReactNode => {
    return (
      <React.Fragment>
        {dropdownOptionsList()
          .filter(a => !a.isHidden)
          .map(({ title, onClick }) => (
            <DropdownItem key={title} onClick={onClick}>
              {title}
            </DropdownItem>
          ))}
      </React.Fragment>
    );
  }

  const dropdownOptionsClearFacts = (): ReactNode => {
    return (
      <React.Fragment>
        {dropdownOptionsClearFactsList()
          .filter(a => !a.isHidden)
          .map(({ title, onClick }) => (
            <DropdownItem key={title} onClick={onClick}>
              {title}
            </DropdownItem>
          ))}
      </React.Fragment>
    );
  }

  return (
    <>
      <div className={classes.scrollable}>
        <div className={classes.singleContent}>
          <div className={classes.inputBox}>
            <Typography variant="body2" component="h6">
              Fact Uploading
            </Typography>
            <Dropdown popperContent={dropdownOptions()} trigger={DROPDOWN_TRIGGER.CLICK} autoclose={false}>
              <PrimaryButton variant="contained">
                Fact Uploading
                <ArrowDropDownOutlinedIcon className={classes.dropdown} />
              </PrimaryButton>
            </Dropdown>
          </div>
          <div className={classes.inputBox}>
            <Typography variant="body2" component="h6">
              Clear Facts
            </Typography>
            <Dropdown popperContent={dropdownOptionsClearFacts()} trigger={DROPDOWN_TRIGGER.CLICK} autoclose={false}>
              <PrimaryButton variant="contained">
                Clear Facts
                <ArrowDropDownOutlinedIcon className={classes.dropdown} />
              </PrimaryButton>
            </Dropdown>
          </div>
        </div>
        <div className={classes.infoIcon}>
          <InfoIcon></InfoIcon>This background job upserts a single User in UM Users collection with the latest values
          from Okta and an optional CSD profile.
        </div>
      </div>
    </>
  );
};

export default inject('syncTroubleshootStore')(observer(Facts));
