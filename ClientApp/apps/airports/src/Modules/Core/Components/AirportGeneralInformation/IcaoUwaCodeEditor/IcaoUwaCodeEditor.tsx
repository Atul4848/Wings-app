import { withStyles } from '@material-ui/core';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { BaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { ViewInputControl, IViewInputControl } from '@wings-shared/form-controls';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Field } from 'mobx-react-form';
import React, { ReactElement, ReactNode } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AIRPORT_CODE_FIELDS, AirportModel, AirportSettingsStore, AirportStore } from '../../../../Shared';
import { fields } from '../Fields';
import { styles } from './IcaoUwaCodeEditor.styles';
import { EditSaveButtons } from '@wings-shared/layout';
import {
  IClasses,
  IOptionValue,
  ISelectOption,
  UIStore,
  Utilities,
  Loader,
  GRID_ACTIONS,
  MODEL_STATUS,
  tapWithAction,
} from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  field: Field; // hold old value
  airportId: number;
  viewMode?: VIEW_MODE;
  inputControl: IViewInputControl;
  airportStore: AirportStore;
  airportSettingsStore: AirportSettingsStore;
  onSaveSuccess: (updatedAirport: AirportModel) => void;
}

@observer
class IcaoUwaCodeEditor extends BaseUpsertComponent<Props, AirportModel> {
  // validate fields
  @observable codeError: string;

  // need to display overlay progress
  protected progressLoader: Loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE, size: 50 });

  constructor(p: Props) {
    // create from using parent form key
    super(p, { [p.field.key]: fields[p.field.key] });
  }

  componentDidMount() {
    const { field } = this.props;
    this.getField(field.key).set(field.value);
  }

  componentWillUnmount() {
    this.airportSettingsStore.ICAOCodes = [];
  }

  /* istanbul ignore next */
  // title without required mark
  private get title(): string {
    const { field } = this.props;
    const code = field.value?.label || field.value || '';
    return `Update ${this.props.field.label?.replace('*', '')} ${code && `(${code})`}`;
  }

  /* istanbul ignore next */
  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore;
  }

  /* istanbul ignore next */
  private get disableSaveButton(): boolean {
    const { field } = this.props;

    // if new value & old values are same
    const hasSameValue = Utilities.isEqual(field.value?.id, this.getField(field.key).value?.id);

    // disable save button if
    return (
      hasSameValue ||
      !Boolean(this.getField(field.key).value?.id) ||
      !this.form.changed ||
      this.form.hasError ||
      this.loader.isLoading ||
      UIStore.pageLoading ||
      this.codeError
    );
  }

  /* istanbul ignore next */
  // Validate Airport icaoCode uwaCode and iataCode
  private validateAirportCodes(fieldKey: string, value: string): void {
    if (value?.length !== 4) {
      this.codeError = '';
      return;
    }
    this.isAlreadyExistMap.set(fieldKey, false);
    const { icaoCode, regionalAirportCode, uwaAirportCode } = this.form.values();
    const { airportOfEntry, appliedAirportUsageType, airportDataSource, sourceLocationId } = this.props.airportStore
      .selectedAirport as AirportModel;
    const request = {
      id: this.props.airportId || 0,
      icaoCodeId: icaoCode?.id,
      regionalAirportCodeId: regionalAirportCode?.id,
      uwaAirportCodeId: uwaAirportCode?.id,
      airportOfEntryId: airportOfEntry?.id,
      sourceLocationId,
      airportDataSourceId: airportDataSource?.id,
      appliedAirportUsageType: appliedAirportUsageType.map(x => {
        return {
          id: x.id,
          airportUsageTypeId: x.entityId,
        };
      }),
    };
    this.progressLoader.setLoadingState(true);
    this.props.airportStore
      .validateAirportCodes(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.progressLoader.setLoadingState(false))
      )
      .subscribe(({ errors }) => {
        const message = errors.find(x => Utilities.isEqual(x.propertyName, fieldKey))?.errorMessage;
        this.codeError = message || '';
      });
  }

  // Search Entity based on field value
  @action
  private onSearch(searchValue: string, _fieldKey: string): void {
    const request = {
      filterCollection: JSON.stringify([{ statusId: MODEL_STATUS.ACTIVE }]),
    };
    switch (_fieldKey) {
      case AIRPORT_CODE_FIELDS.ICAO_CODE:
        this.observeSearch(this.airportSettingsStore.searchIcaoCode(searchValue));
        break;
      case AIRPORT_CODE_FIELDS.UWA_CODE:
        if (!Boolean(searchValue)) {
          this.airportSettingsStore.uwaCodes = [];
          return;
        }
        this.observeSearch(
          this.airportSettingsStore.loadUwaCodes(request).pipe(
            tapWithAction(response => {
              const _codes = response.results.filter(x => !Boolean(x.airport?.airportId));
              this.airportSettingsStore.uwaCodes = _codes.filter(y => y.code.toLowerCase().includes(searchValue));
            })
          )
        );
        break;
      case AIRPORT_CODE_FIELDS.REGIONAL_CODE:
        if (!Boolean(searchValue)) {
          this.airportSettingsStore.regionalCodes = [];
          return;
        }
        this.observeSearch(
          this.airportSettingsStore.loadRegionalCodes(request).pipe(
            tapWithAction(response => {
              const codes = response.results.filter(x => !Boolean(x.airport?.airportId));
              this.airportSettingsStore.regionalCodes = codes.filter(y => y.code.toLowerCase().includes(searchValue));
            })
          )
        );
        break;
    }
  }

  @action
  protected onValueChange(value: IOptionValue, fieldKey: string): void {
    this.getField(fieldKey).set(value);

    if (Utilities.isEqual(fieldKey, AIRPORT_CODE_FIELDS.ICAO_CODE)) {
      // clear dropdown
      if (!value) {
        this.airportSettingsStore.ICAOCodes = [];
      }
      // need label contain icao code
      this.validateAirportCodes(fieldKey, (value as ISelectOption)?.label);
      return;
    }
    this.validateAirportCodes(fieldKey, (value as ISelectOption)?.label);
  }

  /* istanbul ignore next */
  private onAction(action: GRID_ACTIONS): void {
    if (action !== GRID_ACTIONS.SAVE) {
      ModalStore.close();
      return;
    }

    const { field, airportId, airportStore } = this.props;
    const fieldValue = this.getField(field.key).value;
    const request = {
      airportId,
      [`${field.key}Id`]: fieldValue?.id,
      appliedAirportUsageType: airportStore.selectedAirport?.appliedAirportUsageType?.map(entity => {
        return {
          id: entity.id,
          airportUsageTypeId: entity.entityId,
        };
      }),
    };
    this.progressLoader.setLoadingState(true);
    airportStore
      .updateAirportICAOOrUWAOrRegionalCode(field.key, request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.progressLoader.setLoadingState(false))
      )
      .subscribe({
        next: updatedAirport => {
          this.props.onSaveSuccess(updatedAirport);
          ModalStore.close();
        },
        error: error => this.showAlert(error.message, 'updateAirportICAOOrUWACode'),
      });
  }

  /* istanbul ignore next */
  private codeOptions(fieldKey: AIRPORT_CODE_FIELDS) {
    switch (fieldKey) {
      case AIRPORT_CODE_FIELDS.ICAO_CODE:
        return this.airportSettingsStore.ICAOCodes;
      case AIRPORT_CODE_FIELDS.UWA_CODE:
        return this.airportSettingsStore.uwaCodes;
      case AIRPORT_CODE_FIELDS.REGIONAL_CODE:
        return this.airportSettingsStore.regionalCodes;
    }
  }

  /* istanbul ignore next */
  private get dialogContent(): ReactElement {
    const { inputControl, field, classes } = this.props;
    return (
      <>
        {this.progressLoader.spinner}
        <ViewInputControl
          {...inputControl}
          classes={classes}
          field={this.getField(field.key)}
          isDisabled={false}
          isEditable={true}
          customLabel={() => field.label}
          options={this.codeOptions(field.key)}
          isLoading={this.loader.isLoading}
          isExists={this.isAlreadyExistMap.get(field.key)}
          customErrorMessage={this.codeError}
          onValueChange={(option: IOptionValue, fieldKey: string) => this.onValueChange(option, fieldKey)}
          onSearch={(searchValue: string, fieldKey: string) => this.onSearch(searchValue, fieldKey)}
        />
      </>
    );
  }

  public render(): ReactNode {
    return (
      <Dialog
        title={this.title}
        open={true}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
        dialogActions={() => (
          <EditSaveButtons
            disabled={this.disableSaveButton}
            hasEditPermission={true}
            isEditMode={true}
            onAction={action => this.onAction(action)}
          />
        )}
      />
    );
  }
}

export default withStyles(styles)(IcaoUwaCodeEditor);
export { IcaoUwaCodeEditor as PureIcaoUwaCodeEditor };
