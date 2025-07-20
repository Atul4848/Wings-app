import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IViewInputControl } from '@wings-shared/form-controls';
import { inject, observer } from 'mobx-react';
import {
  AircraftRegistryModel,
  RegistrySequenceBaseModel,
  AircraftCollapsable,
  AircraftRegistryStore,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
} from '../../../Shared';
import { ArrowBack, Cached } from '@material-ui/icons';
import { useStyles } from './AircraftRegistryEditor.styles';
import { RegistryCheckbox } from '../index';
import { finalize, takeUntil } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { IOptionValue, UIStore, GRID_ACTIONS } from '@wings-shared/core';
import { CustomLinkButton, EditSaveButtons, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import useAircraftRegistryEditorBase, { BaseProps } from './AircraftRegistryEditorBase';
import { useNavigate } from 'react-router';

interface Props extends BaseProps {
  aircraftRegistryStore?: AircraftRegistryStore;
  sidebarStore?: typeof SidebarStore;
}

const AircraftRegistryEditor: FC<Props> = ({ ...props }) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const _aircraftRegistryStore = props.aircraftRegistryStore as AircraftRegistryStore;
  const { useUpsert, params, groupInputControls, _airframeStore, _settingsStore } = useAircraftRegistryEditorBase(
    props
  );
  const [ aircraftRegistry, setAircraftRegistry ] = useState<AircraftRegistryModel>(new AircraftRegistryModel());
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    props.sidebarStore?.setNavLinks(updateAircraftSidebarOptions('Aircraft Registry'), 'aircraft');
    useUpsert.setViewMode((params.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(false);
    forkJoin([ getAircraftRegistryById(), _settingsStore.getRadios() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ registry ]) => {
        setAircraftRegistry(registry);
        useUpsert.setFormValues(registry);
      });
  };

  /* istanbul ignore next */
  const getAircraftRegistryById = (): Observable<AircraftRegistryModel> => {
    if (!Number(params?.id)) {
      return of(aircraftRegistry);
    }
    return _aircraftRegistryStore.getAircraftRegistryById(Number(params?.id));
  };

  const onAction = (action: GRID_ACTIONS) => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        break;
      case GRID_ACTIONS.CANCEL:
        navigate('/aircraft/aircraft-registry');
        break;
    }
  };

  /* istanbul ignore next */
  const refreshAirframe = (): void => {
    const { airframe } = useUpsert.form.values();
    UIStore.setPageLoader(false);
    _airframeStore
      .getAirframes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(airframes => {
        if (airframe?.id) {
          const selectedAirframe = airframes.find(x => x.id === airframe.id);
          useUpsert.getField('airframe').set(selectedAirframe);
        }
      });
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  /* istanbul ignore next */
  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'acas':
        useUpsert.observeSearch(_settingsStore.getAcases());
        break;
      case 'airframe':
        useUpsert.observeSearch(_airframeStore.getAirframes());
        break;
      case 'transponderType':
        useUpsert.observeSearch(_settingsStore.getTransponders());
        break;
      case 'wakeTurbulenceGroup':
        useUpsert.observeSearch(_settingsStore.getWakeTurbulenceGroups());
        break;
    }
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        {!useUpsert.isEditable && (
          <CustomLinkButton to="/aircraft/aircraft-registry" title="Aircraft Registry" startIcon={<ArrowBack />} />
        )}
        <EditSaveButtons
          disabled={useUpsert.form.hasError || UIStore.pageLoading || !useUpsert.form.changed}
          hasEditPermission={aircraftModuleSecurity.isEditable}
          isEditMode={useUpsert.isEditable}
          onAction={onAction}
        />
      </>
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
      <div className={classes.flexRow}>
        {groupInputControls().map((groupInputControl, index) => (
          <AircraftCollapsable
            isWithButton={groupInputControl.title === 'General'}
            classes={classes}
            key={groupInputControl.title}
            title={groupInputControl.title}
            onButtonClick={refreshAirframe}
            customIconButton={<Cached color="primary" />}
          >
            <div className={classes.flexWrap}>
              {groupInputControl.inputControls
                .filter(inputControl => !inputControl.isHidden)
                .map((inputControl: IViewInputControl, index: number) => {
                  if (inputControl.type === EDITOR_TYPES.CUSTOM_COMPONENT) {
                    return (
                      <RegistryCheckbox
                        options={inputControl.options?.map(a => new RegistrySequenceBaseModel(a)) || []}
                        onValueChange={option => onValueChange(option, inputControl.fieldKey || '')}
                        values={useUpsert.getField(inputControl.fieldKey || '').values()}
                        isEditable={useUpsert.isEditable}
                      />
                    );
                  }
                  return (
                    <ViewInputControl
                      {...inputControl}
                      key={index}
                      customErrorMessage={inputControl.customErrorMessage}
                      field={useUpsert.getField(inputControl.fieldKey || '')}
                      isEditable={useUpsert.isEditable}
                      isExists={inputControl.isExists}
                      classes={{
                        flexRow: classes.inputControl,
                      }}
                      onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
                      onFocus={onFocus}
                    />
                  );
                })}
            </div>
          </AircraftCollapsable>
        ))}
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject(
  'aircraftRegistryStore',
  'settingsStore',
  'airframeStore',
  'sidebarStore'
)(observer(AircraftRegistryEditor));
