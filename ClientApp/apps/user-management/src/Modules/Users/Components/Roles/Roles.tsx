import React, { FC, ReactNode, useEffect, useState } from 'react';
import { BaseUpsertComponent, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import {
  UserStore,
  UserModel,
  UserLevelRoles,
  UserLevelRoleModel,
} from '../../../Shared';
import { fields } from './Fields';
import { action, observable } from 'mobx';
import { useStyles } from './Roles.styles';
import { NavigateFunction, useParams } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import classNames from 'classnames';
import { withRouter, UIStore, IClasses, ISelectOption, IOptionValue, Utilities, Loader } from '@wings-shared/core';
import { USER_LEVEL_ROLES, USER_ROLES } from '../../../Shared/Enums';
import { EnvironmentVarsStore } from '@wings-shared/env-store';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';

const env = new EnvironmentVarsStore();
type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  params?: { mode: VIEW_MODE; id: string };
  userStore?: UserStore;
  navigate?: NavigateFunction;
};

const Roles: FC<Props> = ({ ...props }: Props) => {
  const [ user, setUser ] = useState(new UserModel({ id: '' }));
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const progressLoader: Loader = new Loader(false);

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
    loadUserData();
  }, []);

  
  const loadUserData = (): void => {
    UIStore.setPageLoader(true);
    const { userStore } = props;
    userStore?.getUser(userId())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(user =>{
        setUser(new UserModel(user));
        userStore.setUserId(user.userId);
        userStore?.setJobRoles(user.jobRole);
        useUpsert.setFormValues(user);
      });
  }

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'Users',
      inputControls: [
        {
          fieldKey: 'jobRole',
          type: EDITOR_TYPES.DROPDOWN,
          options: getUserRoles(),
        }
      ],
    };
  }

  const getUserRoles = (): ISelectOption[] => {
    return Object.keys(USER_ROLES).map(key => ({ label: key, value: USER_ROLES[key] }));
  }

  const userId = (): string => {
    const { id } = params;
    return id ?? '';
  }

  const onValueChangeOption = (value: IOptionValue, fieldKey: string): void => {
    if (Utilities.isEqual(fieldKey, 'jobRole') ) {
      props.userStore?.setJobRoles(value as ISelectOption);
      useUpsert.getField(fieldKey).set(value);
    }
  }

  return (
    <>
      <div className={classes.mainContainer}>
        <div className={classes.flexRow}>
          {groupInputControls().inputControls
            .filter(inputControl => !inputControl.isHidden)
            .map((inputControl: IViewInputControl, index: number) => {
              return (
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  isExists={inputControl.isExists}
                  classes={{
                    flexRow: classNames({
                      [classes.inputControl]: true,
                    }),
                  }}
                  field={useUpsert.getField(inputControl.fieldKey || '')}
                  isEditable={useUpsert.isEditable}
                  onValueChange={(option, fieldKey) => onValueChangeOption(option, inputControl.fieldKey || '')}
                />
              );
            })}
        </div>
      </div>
    </>
  );
}

export default inject('userStore')(observer(Roles));
