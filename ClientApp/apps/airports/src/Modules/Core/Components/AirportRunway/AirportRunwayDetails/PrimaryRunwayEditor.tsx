import { inject, observer } from 'mobx-react';
import React, { FC, useEffect, useMemo } from 'react';
import { AirportModel, AirportRunwayModel, AirportStore } from '../../../../Shared';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { primaryRunwayField } from './Fields';
import { Field } from 'mobx-react-form';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AlertStore, ALERT_TYPES } from '@uvgo-shared/alert';
import { finalize, takeUntil } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IOptionValue, UIStore, Utilities, getFormValidation, GRID_ACTIONS } from '@wings-shared/core';
import { EditSaveButtons } from '@wings-shared/layout';
interface Props {
  airportStore: AirportStore;
}

const PrimaryRunwayEditor: FC<Props> = ({ airportStore }: Props) => {
  const primaryRunwayForm = useMemo(() => getFormValidation(primaryRunwayField), []);
  const { primaryRunway } = airportStore.selectedAirport as AirportModel;

  useEffect(() => {
    primaryRunwayForm.set({ primaryRunway: new AirportRunwayModel({ ...primaryRunway }) });
  }, []);

  const unsubscribe = useUnsubscribe();

  const getPrimaryRunwayField = (key: string): Field => {
    return primaryRunwayForm.$(key);
  };

  const onRunwayValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    getPrimaryRunwayField(fieldKey).set(value);
  };

  const hasError = (): boolean => {
    const value = getPrimaryRunwayField('primaryRunway').value;
    return primaryRunwayForm.hasError || !value || !primaryRunwayForm.changed;
  };

  /* istanbul ignore next */
  const onAction = (action: GRID_ACTIONS): void => {
    if (action !== GRID_ACTIONS.SAVE) {
      ModalStore.close();
      return;
    }

    UIStore.setPageLoader(true);
    const newPrimaryRunway = getPrimaryRunwayField('primaryRunway').value;
    const selectedAirport = airportStore?.selectedAirport as AirportModel;

    if (Utilities.isEqual(newPrimaryRunway.id, selectedAirport.primaryRunway.id)) {
      UIStore.setPageLoader(false);
      AlertStore.info('Runway is already being used as Primary Runway');
      return;
    }

    const airport = new AirportModel({
      ...selectedAirport,
      primaryRunway: newPrimaryRunway,
    });

    airportStore
      .upsertAirport(airport.serialize(), true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: updatedAirport => {
          if (updatedAirport.errors?.length) {
            AlertStore.showAlert({
              type: ALERT_TYPES.CRITICAL,
              message: updatedAirport.errors[0].errorMessage,
              id: 'upsertAirportBase',
            });
            return;
          }
          airportStore.setSelectedAirport({
            ...updatedAirport,
            runways: selectedAirport.runways,
            timezoneInformation: selectedAirport.timezoneInformation,
          });
          ModalStore.close();
        },
        error: error => {
          AlertStore.showAlert({
            type: ALERT_TYPES.CRITICAL,
            message: error.message,
            id: 'upsertAirportBase',
          });
        },
      });
  };

  const dialogContent = () => {
    const { runways } = airportStore.selectedAirport as AirportModel;
    return (
      <ViewInputControl
        type={EDITOR_TYPES.DROPDOWN}
        options={runways.filter(x => x.isActive)}
        isEditable={true}
        field={getPrimaryRunwayField('primaryRunway')}
        onValueChange={(option, fieldKey) => onRunwayValueChange(option, fieldKey)}
      />
    );
  };

  return (
    <Dialog
      title={`Would you like to update Primary Runway for ${airportStore.selectedAirport?.title}?`}
      open={true}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
      dialogActions={() => (
        <EditSaveButtons
          disabled={hasError()}
          hasEditPermission={true}
          isEditMode={true}
          onAction={action => onAction(action)}
        />
      )}
    />
  );
};

export default inject('airportStore')(observer(PrimaryRunwayEditor));
