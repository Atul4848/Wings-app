import React, { FC } from 'react';
import { ViewPermission } from '@wings-shared/core';
import { FormLabel } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { useStyles } from './VaccineExemption.styles';

interface Props {
  entity: string;
  value: boolean;
}

const VaccineExemption: FC<Props> = ({ value, entity }) => {
  const style = useStyles();

  return (
    <div className={style.root}>
      <ViewPermission hasPermission={value}>
        <>
          <InfoOutlinedIcon className={style.icon} />
          <FormLabel className={style.labelRoot}> Exemptions for fully Vaccinated {entity}</FormLabel>
        </>
      </ViewPermission>
      <ViewPermission hasPermission={!value}>
        <FormLabel className={style.labelRoot}></FormLabel>
      </ViewPermission>
    </div>
  );
};

export default VaccineExemption;
