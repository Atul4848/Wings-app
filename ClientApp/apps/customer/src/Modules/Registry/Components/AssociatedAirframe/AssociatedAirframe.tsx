import { IAPIGridRequest, UIStore, baseEntitySearchFilters } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { AirframeModel, BaseAircraftStore, useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStyles } from './AssociatedAirframe.style';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { fields } from './fields';

interface Props {
  title?: string;
  baseAircraftStore?: BaseAircraftStore;
}

const AssociatedAirframe: FC<Props> = ({ title, baseAircraftStore }: Props) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<AirframeModel>(params, fields, baseEntitySearchFilters);
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const _baseAircraftStore = baseAircraftStore as BaseAircraftStore;

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    const request: IAPIGridRequest = {
      pageSize: 0,
      filterCollection: JSON.stringify([
        {
          propertyName: 'AirframeRegistry.Registry.Name',
          propertyValue: title,
        },
      ]),
    };
    _baseAircraftStore
      .getAirframeNoSQL(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(airframe => useUpsert.setFormValues(airframe));
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'serialNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'cappsId',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'maxTakeOffWeight',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
    ];
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={title}
        backNavTitle="Registry"
        disableActions={useUpsert.isActionDisabled}
        backNavLink="/customer/registry"
        isEditMode={false}
      />
    );
  };

  return (
    <DetailsEditorWrapper
      headerActions={headerActions()}
      isEditMode={false}
      classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
    >
      <ViewInputControlsGroup
        groupInputControls={groupInputControls()}
        field={useUpsert.getField}
        isEditing={useUpsert.isEditable}
        isLoading={useUpsert.loader.isLoading}
        onValueChange={() => {}}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('baseAircraftStore')(observer(AssociatedAirframe));
