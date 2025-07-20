import React, { FC, ReactNode, useEffect, useState } from 'react';
import { AirportMappingStore, AirportMappingsModel } from '../../Shared';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router-dom';
import { fields } from './Fields';
import { IOptionValue, UIStore, Utilities, baseEntitySearchFilters } from '@wings-shared/core';
import { takeUntil } from 'rxjs/operators';
import { EDITOR_TYPES, IGroupInputControls, IViewInputControl, ViewInputControl } from '@wings-shared/form-controls';
import { observer } from 'mobx-react';
import { useStyles } from './UpsertAirportMapping.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';

type Props = {
  viewMode?: VIEW_MODE;
  airportMappingsModel?: AirportMappingsModel;
  upsertMapping: (request: AirportMappingsModel) => void;
  airportMappingsStore?: AirportMappingStore;
};

const UpsertAirportMapping: FC<Props> = ({ viewMode, airportMappingsModel, airportMappingsStore, ...props }: Props) => {
  const classes = useStyles();
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<AirportMappingsModel>(params, fields, baseEntitySearchFilters);
  const _airportMappingsStore = airportMappingsStore as AirportMappingStore;
  const [ isICAOExist, setIsICAOExist ] = useState(true);

  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.EDIT);
    useUpsert.setFormValues(airportMappingsModel as AirportMappingsModel);
  }, []);

  /* istanbul ignore next */
  const validateIcaoCode = (value: string) => {
    _airportMappingsStore
      ?.ValidateIcaoCode(value)
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe((response: any) => {
        setIsICAOExist(response);
      });
  };

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'Airport Mapping',
      inputControls: [
        {
          fieldKey: 'icao',
          type: EDITOR_TYPES.TEXT_FIELD,
          customErrorMessage: isICAOExist ? '' : 'ICAO code is invalid',
        },
        {
          fieldKey: 'navblueCode',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'apgCode',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
      ],
    };
  };

  const upsertMapping = (): void => {
    const mapping = new AirportMappingsModel({ ...airportMappingsModel, ...useUpsert.form.values() });
    props.upsertMapping(mapping);
  };

  /* istanbul ignore next */
  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    if (Utilities.isEqual(fieldKey, 'icao')) {
      if (value.toString().length == 4) {
        validateIcaoCode(value.toString());
      } else {
        setIsICAOExist(false);
      }
    }
    useUpsert.getField(fieldKey).set(value);
  };

  const dialogContent = (): ReactNode => {
    return (
      <>
        <div className={classes.modalDetail}>
          {groupInputControls().inputControls.map((inputControl: IViewInputControl, index: number) => (
            <ViewInputControl
              {...inputControl}
              key={index}
              classes={{
                flexRow: classes.fullFlex,
              }}
              field={useUpsert.getField(inputControl.fieldKey || '')}
              isEditable={useUpsert.isEditable}
              onValueChange={option => onValueChange(option, inputControl.fieldKey || '')}
              customErrorMessage={inputControl.customErrorMessage}
              isLoading={useUpsert.isLoading}
            />
          ))}
          <div className={classes.btnContainer}>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() => upsertMapping()}
              disabled={useUpsert.form.hasError || UIStore.pageLoading || !isICAOExist}
            >
              Save
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  };

  return (
    <Dialog
      title={`${viewMode === VIEW_MODE.NEW ? 'Add' : 'Edit'} Airport Mapping`}
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={dialogContent}
    />
  );
};

export default observer(UpsertAirportMapping);
