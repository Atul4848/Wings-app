import React, { FC } from 'react';
import { ICellRendererParams } from 'ag-grid-community';

import { UserProfileRolesModel } from '../../../Shared';
import { useAccessTypeRendererClasses } from './AccessType.renderer.styles';
import { ROLE_ACCESS_TYPE } from '../../../Shared/Enums';

type RendererParams = ICellRendererParams & {
  data: UserProfileRolesModel;
};

function formatDate(dateString: string): string {
  const [ date, rowTime ] = dateString.split('T');
  const time = rowTime.split(':').slice(0, 2);

  return `${date} ${time.join(':')}`;
}

const AccessTypeRenderer: FC<RendererParams> = ({ data }) => {
  const classes  = useAccessTypeRendererClasses();
  const isAdditionalInfo = data.accessType !== ROLE_ACCESS_TYPE.STANDARD;

  if (!isAdditionalInfo) {
    return (
      <div className={classes.root}>
        {data.accessType}
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div><strong>{data.accessType}</strong></div>
      <div><span className={classes.label}>from:</span> {formatDate(data.validFrom)}</div>
      <div><span className={classes.label}>to:</span> {formatDate(data.validTo)}</div>
    </div>
  );
}

export default AccessTypeRenderer;