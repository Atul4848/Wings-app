import React, { FC, ReactElement, useEffect, useState } from 'react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { useBaseUpsertComponent } from '@wings/shared';
import { ViewInputControl, IViewInputControl } from '@wings-shared/form-controls';
import { observer } from 'mobx-react';
import { Field } from 'mobx-react-form';
import { finalize, takeUntil } from 'rxjs/operators';
import { AIRPORT_CODE_FIELDS, AirportModel, AirportSettingsStore, AirportStore } from '../../../../Shared';
import { fields } from '../Fields';
import { useStyles } from './IcaoUwaCodeEditor.styles';
import { EditSaveButtons } from '@wings-shared/layout';
import {
  IOptionValue,
  ISelectOption,
  UIStore,
  Utilities,
  Loader,
  GRID_ACTIONS,
  MODEL_STATUS,
  tapWithAction,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router-dom';

interface Props {
  field: Field; // hold old value
  airportId: number;
  inputControl: IViewInputControl;
  airportStore: AirportStore;
  airportSettingsStore: AirportSettingsStore;
  onSaveSuccess: (updatedAirport: AirportModel) => void;
}

const IcaoUwaCodeEditor: FC<Props> = ({
  airportStore,
  airportSettingsStore,
  inputControl,
  field,
  airportId,
  onSaveSuccess,
}) => {
  const params = useParams();
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent(params, { [field.key]: fields[field.key] }, baseEntitySearchFilters);
  const _airportStore = airportStore as AirportStore;
  const _airportSettingStore = airportSettingsStore as AirportSettingsStore;
  // validate fields
  const [ codeError, setCodeError ] = useState('');
  // need to display overlay progress
  const progressLoader: Loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE, size: 50 });

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.getField(field.key).set(field.value);
    return () => {
      _airportSettingStore.ICAOCodes = [];
    };
  }, []);

  // title without required mark
  const title = (): string => {
    const code = field.value?.label || field.value || '';
    return `Update ${useUpsert.getFieldLabel(field.key)} ${code && `(${code})`}`;
  };

  /* istanbul ignore next */
  const disableSaveButton = (): boolean => {
    // if new value & old values are same
    const hasSameValue = Utilities.isEqual(field.value?.id, useUpsert.getField(field.key).value?.id);

    // disable save button if
    return (
      hasSameValue ||
      !Boolean(useUpsert.getField(field.key).value?.id) ||
      !useUpsert.form.changed ||
      useUpsert.form.hasError ||
      useUpsert.loader.isLoading ||
      UIStore.pageLoading ||
      codeError
    );
  };

  // Validate Airport icaoCode uwaCode and iataCode
  const validateAirportCodes = (fieldKey: string, value: string): void => {
    if (value?.length !== 4) {
      setCodeError('');
      return;
    }
    useUpsert.isAlreadyExistMap.set(fieldKey, false);
    const { icaoCode, regionalAirportCode, uwaAirportCode } = useUpsert.form.values();
    const {
      airportOfEntry,
      appliedAirportUsageType,
      airportDataSource,
      sourceLocationId,
    } = _airportStore.selectedAirport as AirportModel;
    const _values = {
      icaoCode,
      regionalAirportCode,
      uwaAirportCode,
      airportOfEntry,
      appliedAirportUsageType,
      airportDataSource,
      sourceLocationId,
    };
    progressLoader.setLoadingState(true);
    _airportStore
      .validateAirportCodes(_values, airportId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => progressLoader.setLoadingState(false))
      )
      .subscribe(({ errors }) => {
        const message = errors.find(x => Utilities.isEqual(x.propertyName, fieldKey))?.errorMessage;
        setCodeError(message || '');
      });
  };

  // Search Entity based on field value
  const onSearch = (searchValue: string, _fieldKey: string): void => {
    const request = {
      filterCollection: JSON.stringify([{ statusId: MODEL_STATUS.ACTIVE }]),
    };
    switch (_fieldKey) {
      case AIRPORT_CODE_FIELDS.ICAO_CODE:
        useUpsert.observeSearch(_airportSettingStore.searchIcaoCode(searchValue));
        break;
      case AIRPORT_CODE_FIELDS.UWA_CODE:
        if (!Boolean(searchValue)) {
          _airportSettingStore.uwaCodes = [];
          return;
        }
        useUpsert.observeSearch(
          _airportSettingStore.loadUwaCodes(request).pipe(
            tapWithAction(response => {
              const _codes = response.results.filter(x => !Boolean(x.airport?.airportId));
              _airportSettingStore.uwaCodes = _codes.filter(y =>
                y.code.toLowerCase().includes(searchValue.toLowerCase())
              );
            })
          )
        );
        break;
      case AIRPORT_CODE_FIELDS.REGIONAL_CODE:
        if (!Boolean(searchValue)) {
          _airportSettingStore.regionalCodes = [];
          return;
        }
        useUpsert.observeSearch(
          _airportSettingStore.loadRegionalCodes(request).pipe(
            tapWithAction(response => {
              const codes = response.results.filter(x => !Boolean(x.airport?.airportId));
              _airportSettingStore.regionalCodes = codes.filter(y =>
                y.code.toLowerCase().includes(searchValue.toLowerCase())
              );
            })
          )
        );
        break;
    }
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);

    if (Utilities.isEqual(fieldKey, AIRPORT_CODE_FIELDS.ICAO_CODE)) {
      // clear dropdown
      if (!value) {
        _airportSettingStore.ICAOCodes = [];
      }
      // need label contain icao code
      validateAirportCodes(fieldKey, (value as ISelectOption)?.label);
      return;
    }
    validateAirportCodes(fieldKey, (value as ISelectOption)?.label);
  };

  const onAction = (action: GRID_ACTIONS): void => {
    if (action !== GRID_ACTIONS.SAVE) {
      ModalStore.close();
      return;
    }

    const fieldValue = useUpsert.getField(field.key).value;
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
    progressLoader.setLoadingState(true);
    airportStore
      .updateAirportICAOOrUWAOrRegionalCode(field.key, request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => progressLoader.setLoadingState(false))
      )
      .subscribe({
        next: updatedAirport => {
          onSaveSuccess(updatedAirport);
          ModalStore.close();
        },
        error: error => useUpsert.showAlert(error.message, 'updateAirportICAOOrUWACode'),
      });
  };

  /* istanbul ignore next */
  const codeOptions = (fieldKey: AIRPORT_CODE_FIELDS) => {
    switch (fieldKey) {
      case AIRPORT_CODE_FIELDS.ICAO_CODE:
        return _airportSettingStore.ICAOCodes;
      case AIRPORT_CODE_FIELDS.UWA_CODE:
        return _airportSettingStore.uwaCodes;
      case AIRPORT_CODE_FIELDS.REGIONAL_CODE:
        return _airportSettingStore.regionalCodes;
    }
  };

  const dialogContent = (): ReactElement => {
    return (
      <>
        {progressLoader.spinner}
        <ViewInputControl
          {...inputControl}
          classes={classes}
          field={useUpsert.getField(field.key)}
          isDisabled={false}
          isEditable={true}
          customLabel={() => useUpsert.getFieldLabel(field.key)}
          options={codeOptions(field.key)}
          isLoading={useUpsert.loader.isLoading}
          isExists={useUpsert.hasDuplicateValue}
          customErrorMessage={codeError}
          onValueChange={onValueChange}
          onSearch={onSearch}
        />
      </>
    );
  };

  return (
    <Dialog
      title={title()}
      open={true}
      onClose={() => ModalStore.close()}
      dialogContent={dialogContent}
      dialogActions={() => (
        <EditSaveButtons
          disabled={disableSaveButton()}
          hasEditPermission={true}
          isEditMode={true}
          onAction={onAction}
        />
      )}
    />
  );
};

export default observer(IcaoUwaCodeEditor);
