import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { Box, LinearProgress } from '@material-ui/core';
import { observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  AirportHoursModel,
  AirportHoursStore,
  AirportSettingsStore,
} from '../../../../Shared';
import { useStyles } from './OtOrHoursDetails.styles';
import AirportHoursGrid from '../AirportHoursGrid/AirportHoursGridV2';
import { takeUntil, finalize } from 'rxjs/operators';
import { UIStore, Utilities } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ExpandCollapseButton } from '@wings-shared/form-controls';

interface Props {
  airportHoursModel: AirportHoursModel;
  airportHoursStore: AirportHoursStore;
  airportSettingsStore: AirportSettingsStore;
  updateGridItem?: (updatedModel: AirportHoursModel[]) => void;
}

interface IGridRef {
  autoSizeColumns: Function
}

const OtOrHoursDetails: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const hoursGridRef = useRef<IGridRef>();
  const [ isRowEditing, setIsRowEditing ] = useState<boolean>(false);


  /* istanbul ignore next */
  // Load Data on Mount
  useEffect(() => {
    createOTORRecords();
    return () => {
      props.airportHoursStore.otorAirportHours = [];
    }
  }, []);


  // Needs to call using REF from Parent
  /* istanbul ignore next */
  const createOTORRecords = (): void => {
    const airportHoursSubType = props.airportSettingsStore.airportHourSubTypes.find(({ name }) =>
      Utilities.isEqual(name, 'OT/OR Hours')
    );
    const defaultModel = new AirportHoursModel({
      ...props.airportHoursModel,
      id: 0,
      conditions: [],
      airportHoursSubType,
      cappsComment: 'OT/OR',
    });

    // create unique cappsSequenceId for new OT/OR Hours
    const cappsSequenceIds: number[] = [
      defaultModel.cappsSequenceId,
      ...props.airportHoursStore.airportHours.map(({ cappsSequenceId }) => cappsSequenceId),
    ];
    const cappsSequenceId: number = Math.max(...cappsSequenceIds);
    props.airportHoursStore.createOTORHours(defaultModel, cappsSequenceId);
  };

  const upsertAirportHours = (): void => {
    const gridRows = props.airportHoursStore.otorAirportHours || [];
    UIStore.setPageLoader(true);
    props.airportHoursStore
      .upsertAirportHours(gridRows.map(x => x.serialize()))
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(unsubscribe.destroy$)
      )
      .subscribe({
        next: (response: AirportHoursModel[]) => {
          ModalStore.close();
          props.updateGridItem && props.updateGridItem(response);
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const dialogActions = (): ReactNode => {
    return (
      <Box width="100%">
        {UIStore.pageLoading ? <LinearProgress /> : <></>}
        <Box display="flex" justifyContent="end" mt="5px">
          <PrimaryButton variant="contained" onClick={() => ModalStore.close()} disabled={UIStore.pageLoading}>
            Cancel
          </PrimaryButton>
          <SecondaryButton
            variant="contained"
            onClick={upsertAirportHours}
            disabled={isRowEditing || UIStore.pageLoading}
          >
            Save
          </SecondaryButton>
        </Box>
      </Box>
    );
  };

  const title = (): ReactNode => {
    return (
      <div>
        {`Airport Hours - ${props.airportHoursModel.airport?.operationalCode}`}
        <ExpandCollapseButton onExpandCollapse={() => hoursGridRef.current?.autoSizeColumns()} />
      </div>
    );
  };

  return (
    <Dialog
      open={true}
      title={title()}
      isLoading={() => UIStore.pageLoading}
      classes={{
        paperSize: classes.modalWidth,
        header: classes.headerWrapper,
        dialogWrapper: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => (
        <AirportHoursGrid
          ref={hoursGridRef}
          isOtOrRecord={true}
          isEditable={true}
          rowData={props.airportHoursStore.otorAirportHours}
          airportHoursStore={props.airportHoursStore}
          airportSettingsStore={props.airportSettingsStore}
          airportHoursType={props.airportHoursModel.airportHoursType}
          onRowEditingStarted={isEditing => setIsRowEditing(isEditing)}
        />
      )}
      dialogActions={dialogActions}
    />
  );
};

export default observer(OtOrHoursDetails);
