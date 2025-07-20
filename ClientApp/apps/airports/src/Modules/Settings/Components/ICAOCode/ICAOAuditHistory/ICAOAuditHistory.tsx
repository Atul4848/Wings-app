import React, { ReactNode } from 'react';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CustomAgGridReact, BaseGrid } from '@wings-shared/custom-ag-grid';
import { AirportModel } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { action } from 'mobx';
import { withStyles } from '@material-ui/core';
import { styles } from './ICAOAuditHistory.styles';
import { AirportSettingsStore } from '../../../../Shared';
import { DATE_FORMAT, Utilities, IClasses } from '@wings-shared/core';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
  icaoCode: string;
  classes: IClasses;
}

@inject('airportSettingsStore')
@observer
class ICAOAuditHistory extends BaseGrid<Props, AirportModel> {
  componentDidMount() {
    this.loadAuditHistory();
  }

  /* istanbul ignore next */
  @action
  private loadAuditHistory(): void {
    const { icaoCode } = this.props;
    this.loader.showLoader();
    this.props.airportSettingsStore
      ?.loadICAOAuditHistory(icaoCode)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loader.hideLoader())
      )
      .subscribe(response => {
        this.data = response;
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Airport Name',
      field: 'name',
      minWidth: 140,
    },
    {
      headerName: 'ICAO Code',
      field: 'icao',
      sortable: false,
      valueFormatter: ({ value }) => value?.label || '',
    },
    {
      headerName: 'UWA Code',
      field: 'uwaCode',
      sortable: false,
    },
    {
      headerName: 'Changed Date',
      field: 'modifiedOn',
      minWidth: 160,
      maxWidth: 160,
      valueFormatter: ({ value }) => Utilities.getformattedDate(value, DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN),
      hide: true, // temporarily hidden
    },
    {
      headerName: 'Changed By',
      field: 'modifiedBy',
      minWidth: 130,
      hide: true, // temporarily hidden
    },
  ];

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    return this._gridOptionsBase({ context: this, columnDefs: this.columnDefs });
  }

  private get dialogContent(): ReactNode {
    return <CustomAgGridReact rowData={this.data} gridOptions={this.gridOptions} />;
  }

  public render(): ReactNode {
    const { classes, icaoCode } = this.props;
    return (
      <Dialog
        title={`History ${icaoCode}`}
        open={true}
        isLoading={() => this.loader.isLoading}
        classes={{ paperSize: classes.paperSize }}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
      />
    );
  }
}
export default withStyles(styles)(ICAOAuditHistory);
