import { IBaseModuleProps } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { useUnsubscribe } from '@wings-shared/hooks';
import { TeamModel, TeamStore, teamSidebarOptions } from '../../../Shared';
import { UIStore, ViewPermission } from '@wings-shared/core';
import TeamGeneralInformation from '../TeamGeneralInformation/TeamGeneralInformation';
import { takeUntil, finalize } from 'rxjs/operators';
import InternalUserAssignment from '../InternalUserAssignment/InternalUserAssignment';

interface Props extends Partial<IBaseModuleProps> {
  teamStore?: TeamStore;
}

const UpsertTeam: FC<Props> = props => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const teamId = Number(params.teamId);
  const _teamStore = props.teamStore as TeamStore;

  /* istanbul ignore next */
  useEffect(() => {
    loadTeam();
    props.sidebarStore?.setNavLinks(teamSidebarOptions(!Boolean(params?.teamId)), teamBasePath());
    return () => {
      _teamStore.selectedTeam = new TeamModel();
    };
  }, []);

  /* istanbul ignore next */
  const teamBasePath = () => {
    return params?.teamId ? `customer/team/${teamId}/${params.viewMode}` : 'customer/team/new';
  };
  
  /* istanbul ignore next */
  const loadTeam = (): void => {
    if (!teamId) {
      unsubscribe.setHasLoaded(true);
      return;
    }
    UIStore.setPageLoader(true);
    _teamStore
      .getTeamById(teamId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        _teamStore.selectedTeam = response;
        unsubscribe.setHasLoaded(true);
      });
  };

  return (
    <ViewPermission hasPermission={unsubscribe.hasLoaded}>
      <Routes>
        <Route index element={<TeamGeneralInformation key="team-info" />} />
        <Route path="internal-user-assignment" element={<InternalUserAssignment />} />
      </Routes>
    </ViewPermission>
  );
};

export default inject('sidebarStore', 'teamStore')(observer(UpsertTeam));
