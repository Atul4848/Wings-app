import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { Observable } from 'rxjs';
import { SettingTypeBase } from '../SettingsBase/SettingsBase';
import { SettingsType } from '../SettingsType/SettingsType';
import { UIStore, Loader, SettingsTypeModel } from '@wings-shared/core';
import { ColDef } from 'ag-grid-community';

interface Props<T> {
  getSettings?: () => Observable<T[]>;
  upsertSettings?: (object: T) => Observable<T>;
  settingsData: T[];
  type: string;
  loader?: Loader;
  isNameUnique?: boolean;
  isEditable?: boolean;
  hideAddNewButton?: boolean;
  maxLength?: number;
  regExp?: RegExp;
  isHideSearchSelectControl?: boolean;
  ignoreNumber?: boolean;
  headerName?: string;
  hasSuperPermission?: boolean;
  onDelete?: (object: T) => Observable<string>;
  showDeleteButton?: boolean;
  columnDefs?: ColDef[];
  isExactMatch?: boolean;
  sortColumn?: string;
}

@observer
class UpsertSettings<T> extends SettingTypeBase<Props<T>> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.loadInitialData();
  }

  /* istanbul ignore next */
  private loadInitialData(): void {
    UIStore.setPageLoader(true);
    this.props
      .getSettings()
      .pipe(
        takeUntil(this.destroy$),
        tap((response: T[]) => this.settingsTypesRef.current?.setData(response)),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  }

  /* istanbul ignore next */
  private upsertSettings(rowIndex: number, model: T): void {
    UIStore.setPageLoader(true);
    this.props
      .upsertSettings(model)
      .pipe(
        takeUntil(this.destroy$),
        tap((response: T) => this.settingsTypesRef.current?.updateTableItem(rowIndex, response)),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
        },
      });
  }

  public render(): ReactNode {
    const {
      settingsData,
      type,
      isNameUnique,
      isEditable,
      hideAddNewButton,
      maxLength,
      regExp,
      isHideSearchSelectControl,
      ignoreNumber,
      headerName,
      hasSuperPermission,
      onDelete,
      showDeleteButton,
      columnDefs,
      isExactMatch,
      sortColumn,
    } = this.props;
    return (
      <>
        <SettingsType
          ref={this.settingsTypesRef}
          columnDefs={columnDefs}
          rowData={settingsData}
          onGetNewModel={() => new SettingsTypeModel({ id: 0 })}
          onUpsert={(rowIndex: number, data: T) => this.upsertSettings(rowIndex, data)}
          onDelete={onDelete}
          showDeleteButton={showDeleteButton}
          type={type}
          isNameUnique={isNameUnique}
          isEditable={isEditable}
          hasSuperPermission={hasSuperPermission}
          hideAddNewButton={hideAddNewButton}
          maxLength={maxLength}
          regExp={regExp}
          ignoreNumber={ignoreNumber}
          isHideSearchSelectControl={isHideSearchSelectControl}
          headerName={headerName}
          isExactMatch={isExactMatch}
          sortColumn={sortColumn}
        />
      </>
    );
  }
}

export default UpsertSettings;
