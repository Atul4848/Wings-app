import { Box, IconButton, LinearProgress, withStyles } from '@material-ui/core';
import { AspectRatio } from '@material-ui/icons';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IClasses, UIStore, UnsubscribableComponent, Utilities } from '@wings-shared/core';
import { observer } from 'mobx-react';
import React, { ReactNode } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  AirportHoursModel,
  AirportHoursStore,
  AirportHoursTypeModel,
  AirportSettingsStore,
} from '../../../../Shared';
import AirportHoursGrid from '../AirportHoursGrid/AirportHoursGrid';
import { styles } from './OtOrHoursDetails.styles';

interface Props {
  classes?: IClasses;
  airportHoursModel: AirportHoursModel;
  airportHoursStore: AirportHoursStore;
  airportSettingsStore: AirportSettingsStore;
  updateGridItem?: (updatedModel: AirportHoursModel[]) => void;
}

interface IGridRef {
  hasErrorInGrid: boolean;
  isRowEditing: boolean;
  gridRows: any[];
  autoSizeColumns: Function
}

@observer
class OtOrHoursDetails extends UnsubscribableComponent<Props, AirportHoursModel> {
  private gridRef = React.createRef<IGridRef>();

  componentDidMount() {
    this.createOTORRecords();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.airportHoursStore.otorAirportHours = [];
  }

  private get airportHoursStore(): AirportHoursStore {
    return this.props.airportHoursStore;
  }

  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore;
  }

  private get hasError(): boolean {
    return Boolean(this.gridRef.current?.hasErrorInGrid || this.gridRef.current?.isRowEditing);
  }

  // Needs to call using REF from Parent
  /* istanbul ignore next */
  private createOTORRecords(): void {
    const airportHoursSubType = this.airportSettingsStore.airportHourSubTypes.find(({ name }) =>
      Utilities.isEqual(name, 'OT/OR Hours')
    );
    const defaultModel = new AirportHoursModel({
      ...this.props.airportHoursModel,
      id: 0,
      conditions: [],
      airportHoursSubType,
      cappsComment: 'OT/OR',
    });

    // create unique cappsSequenceId for new OT/OR Hours
    const cappsSequenceIds: number[] = [
      defaultModel.cappsSequenceId,
      ...this.airportHoursStore.airportHours.map(({ cappsSequenceId }) => cappsSequenceId),
    ];
    const cappsSequenceId: number = Math.max(...cappsSequenceIds);
    this.airportHoursStore.createOTORHours(defaultModel, cappsSequenceId);
  }

  /* istanbul ignore next */
  private upsertAirportHours(): void {
    const gridRows = this.gridRef.current?.gridRows || [];
    UIStore.setPageLoader(true);
    this.props.airportHoursStore
      .upsertAirportHours(gridRows.map(x => x.serialize()))
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: AirportHoursModel[]) => {
          ModalStore.close();
          this.props.updateGridItem && this.props.updateGridItem(response);
        },
        error: error => AlertStore.critical(error.message),
      });
  }

  private get dialogActions(): ReactNode {
    return (
      <Box width="100%">
        {UIStore.pageLoading ? <LinearProgress /> : <></>}
        <Box display="flex" justifyContent="end" mt="5px">
          <PrimaryButton variant="contained" onClick={() => ModalStore.close()} disabled={UIStore.pageLoading}>
            Cancel
          </PrimaryButton>
          <SecondaryButton
            variant="contained"
            onClick={() => this.upsertAirportHours()}
            disabled={this.hasError || UIStore.pageLoading}
          >
            Save
          </SecondaryButton>
        </Box>
      </Box>
    );
  }

  private get title(): ReactNode {
    return (
      <div>
        {`Airport Hours - ${this.props.airportHoursModel.airport?.operationalCode}`}
        <IconButton onClick={() => this.gridRef.current?.autoSizeColumns()}>
          <AspectRatio />
        </IconButton>
      </div>
    );
  }

  public render() {
    const { classes, airportHoursModel } = this.props as Required<Props>;
    return (
      <Dialog
        open={true}
        title={this.title}
        classes={{
          paperSize: classes.modalWidth,
          header: classes.headerWrapper,
          dialogWrapper: classes.headerWrapper,
        }}
        onClose={() => ModalStore.close()}
        dialogContent={() => (
          <AirportHoursGrid
            ref={this.gridRef as any}
            isOtOrRecord={true}
            isEditable={true}
            rowData={this.airportHoursStore.otorAirportHours}
            airportHoursStore={this.airportHoursStore}
            airportSettingsStore={this.airportSettingsStore}
            airportHoursType={airportHoursModel.airportHoursType as AirportHoursTypeModel}
          />
        )}
        dialogActions={() => this.dialogActions}
      />
    );
  }
}
export default withStyles(styles)(OtOrHoursDetails);
