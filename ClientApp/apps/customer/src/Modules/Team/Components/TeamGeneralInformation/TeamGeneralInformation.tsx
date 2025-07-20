import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { SettingsStore, TeamEmailCommsModel, TeamModel, TeamStore, useCustomerModuleSecurity } from '../../../Shared';
import { baseEntitySearchFilters, IOptionValue, GRID_ACTIONS, Utilities, UIStore } from '@wings-shared/core';
import { IGroupInputControls, EDITOR_TYPES, ViewInputControlsGroup, AuditFields } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { DetailsEditorHeaderSection, ConfirmNavigate, DetailsEditorWrapper } from '@wings-shared/layout';
import { useBaseUpsertComponent, VIEW_MODE, BaseUserStore, ModelStatusOptions } from '@wings/shared';
import { useParams, useNavigate } from 'react-router';
import { useStyles } from './TeamGeneralInformation.style';
import { fields } from './fields';
import TeamEmailCommsGrid from './TeamEmailCommsGrid';
import { takeUntil, finalize } from 'rxjs/operators';

interface Props {
  teamStore?: TeamStore;
  settingsStore?: SettingsStore;
  title?: string;
}

const TeamGeneralInformation: FC<Props> = ({ teamStore, settingsStore, title }: Props) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<TeamModel>(params, fields, baseEntitySearchFilters);
  const classes = useStyles();
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  const _settingsStore = settingsStore as SettingsStore;
  const _teamStore = teamStore as TeamStore;
  const _baseUserStore = useMemo(() => new BaseUserStore(), []);
  const [ isDataUpdated, setIsDataUpdated ] = useState(false);
  const [ editingGrid, setEditingGrid ] = useState(false);
  const customerModuleSecurity = useCustomerModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadTeam();
  }, []);

  /* istanbul ignore next */
  const loadTeam = (): void => {
    if (!params.teamId) {
      return;
    }
    useUpsert.setFormValues(_teamStore.selectedTeam);
  };

  /* istanbul ignore next */
  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  const updateTeamEmailComms = (emailComms: TeamEmailCommsModel[]): void => {
    const formData = useUpsert.form.values();
    useUpsert.setFormValues({ ...formData, teamEmailComms: emailComms });
    setIsDataUpdated(true);
  };

  /* istanbul ignore next */
  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
      case 'associatedTeamTypes':
        useUpsert.observeSearch(_settingsStore.getTeamType());
        break;
    }
  };

  const onSearch = (searchValue: string, fieldKey: string) => {
    switch (fieldKey) {
      case 'managerNameModel':
        const request = {
          q: searchValue,
        };
        _baseUserStore
          .getUsers(request)
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => UIStore.setPageLoader(false))
          )
          .subscribe(response => {
            const _users = response.results.filter(x => x.guid && x.email);
            _baseUserStore.users = _users.filter(x => {
              return [ x.firstName, x.lastName, x.csdUsername, x.email ]
                .filter(p => Boolean(p))
                .join(' ')
                .toLowerCase()
                .includes(searchValue?.toLowerCase());
            });
          });
        break;
    }
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'name',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'code',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'isInternal',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'managerNameModel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _baseUserStore.users,
            isLoading: useUpsert.isLoading || UIStore.pageLoading,
          },
          {
            fieldKey: 'managerEmail',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'managerPhone',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'managerPhoneExtension',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'groupEmail',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'tollFreePhone',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'usPhone',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'faxNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'displayOrder',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'rmpEmail',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'associatedTeamTypes',
            type: EDITOR_TYPES.AUTO_COMPLETE,
            options: _settingsStore.teamType,
            multiple: true,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.AUTO_COMPLETE,
            options: ModelStatusOptions,
          },
        ],
      },
    ];
  };

  /* istanbul ignore next */
  const upsertTeam = (): void => {
    const request = new TeamModel({
      ..._teamStore.selectedTeam,
      ...useUpsert.form.values(),
    });
    UIStore.setPageLoader(true);
    _teamStore
      .upsertTeam(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: TeamModel) => {
          useUpsert.form.reset();
          _teamStore.selectedTeam = response;
          useUpsert.setFormValues(response);
          setIsDataUpdated(false);
          if (Utilities.isEqual(params.viewMode || '', VIEW_MODE.DETAILS)) {
            useUpsert.setViewMode(VIEW_MODE.DETAILS);
          }
          if (!request?.id) {
            navigate(`/customer/team/${response.id}/edit`, useUpsert.noBlocker);
          }
        },
        error: error => {
          useUpsert.showAlert(error.message, 'upsertTeam');
        },
        complete: () => UIStore.setPageLoader(false),
      });
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertTeam();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(_teamStore.selectedTeam);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate('/customer/team');
        break;
    }
  };

  const disableAction = () => {
    if (isDataUpdated) {
      return useUpsert.form.hasError || UIStore.pageLoading;
    }
    return useUpsert.isActionDisabled;
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={title}
        backNavTitle="Team"
        disableActions={disableAction() || editingGrid}
        backNavLink="/customer/team"
        isEditMode={useUpsert.isEditable}
        onAction={action => onAction(action)}
        hasEditPermission={customerModuleSecurity.isEditable}
      />
    );
  };

  const { teamEmailComms } = useUpsert.form.values();
  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched || useUpsert.form.changed}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          field={useUpsert.getField}
          isEditing={useUpsert.isEditable}
          isLoading={useUpsert.loader.isLoading}
          onValueChange={onValueChange}
          onFocus={onFocus}
          onSearch={onSearch}
        />
        <TeamEmailCommsGrid
          isEditable={useUpsert.isEditable || !useUpsert.isDetailView}
          teamEmailComms={teamEmailComms}
          onDataSave={updateTeamEmailComms}
          onRowEditing={isEditing => setEditingGrid(isEditing)}
        />
        <AuditFields
          isNew={useUpsert.isAddNew}
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={useUpsert.getField}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('teamStore', 'settingsStore')(observer(TeamGeneralInformation));
