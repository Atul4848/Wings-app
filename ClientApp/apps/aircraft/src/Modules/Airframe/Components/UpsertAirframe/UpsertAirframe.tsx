import { ConfirmNavigate, SidebarStore } from '@wings-shared/layout';
import { inject, observer } from 'mobx-react';
import { FC, default as React, useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router';
import { airframeOptions } from '../../../Shared';
import AirframeEditor from '../AirframeEditor/AirframeEditor';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  sidebarStore?: typeof SidebarStore;
}

const UpsertAirframe: FC<Props> = ({ ...props }) => {
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const aircraftId = Number(params.id);

  /* istanbul ignore next */
  const airframeBasePath = () => {
    return params?.id ? `aircraft/airframe/${aircraftId}/${params.mode}` : 'aircraft/airframe/new';
  };
  
  useEffect(() => {
    props.sidebarStore?.setNavLinks(airframeOptions(!Boolean(params?.id)), airframeBasePath());
  }, []);

  return (
    <ConfirmNavigate isBlocker={unsubscribe.hasLoaded}>
      <Routes>
        <Route index element={<AirframeEditor key={'airframe-edit'} />} />
      </Routes>
    </ConfirmNavigate>
  );
};

export default inject('sidebarStore')(observer(UpsertAirframe)) as FC<Props>;
