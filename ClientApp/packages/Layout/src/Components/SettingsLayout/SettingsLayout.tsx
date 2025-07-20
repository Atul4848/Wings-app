import React, { FC, ReactNode } from 'react';
import { useStyles } from './SettingsLayout.styles';
import { Typography, withStyles } from '@material-ui/core';
import { SettingCategoryControl } from '@wings-shared/form-controls';
import { IClasses, SelectOption } from '@wings-shared/core';
import { observer } from 'mobx-react';

interface Props {
  title: string;
  categoryValue: number;
  subCategoryValue: number;
  children: ReactNode;
  categoryList: SelectOption[];
  subCategoryList: SelectOption[];
  onCategoryChange: (id) => void;
  onSubCategoryChange: (id) => void;
}

const SettingsLayout: FC<Props> = ({
  title,
  categoryValue,
  subCategoryValue,
  children,
  categoryList,
  subCategoryList,
  onCategoryChange,
  onSubCategoryChange,
}) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.heading}>
        <Typography variant="h6" className={classes.title}>
          {title} Settings
        </Typography>
      </div>
      <div className={classes.root}>
        <div className={classes.selectSettingContainer}>
          <SettingCategoryControl
            title="Category"
            value={categoryValue}
            selectOptions={categoryList}
            onOptionChange={id => onCategoryChange(id)}
          />
          <SettingCategoryControl
            title="Sub category"
            value={subCategoryValue}
            selectOptions={subCategoryList}
            onOptionChange={id => onSubCategoryChange(id)}
          />
        </div>
        <div className={classes.settingWrapper}>{children}</div>
      </div>
    </>
  );
};

export default observer(SettingsLayout);
