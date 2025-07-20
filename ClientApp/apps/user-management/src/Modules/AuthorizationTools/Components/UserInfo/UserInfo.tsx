import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Typography } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { fields } from './Fields';
import { styles } from './UserInfo.style';
import { UserModel } from '../../../Shared/Models/User.model';
import { UserStore } from '../../../Shared';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { IClasses, UIStore } from '@wings-shared/core';
import { finalize, takeUntil, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AlertStore } from '@uvgo-shared/alert';
import { Link, useParams } from 'react-router-dom';
import { ExternalLinkIcon } from '@uvgo-shared/icons';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  userStore?: UserStore;
  userId?: string;
  onClose?: () => void;
}

const UserInfo: FC<Props> = ({ ...props }: Props) => {
  const [ user, setUser ] = useState<UserModel>(new UserModel({ id: '' }));
  const [ isGridDataLoaded, setIsGridDataLoaded ] = useState<boolean>(false);
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const _userStore = props.userStore as UserStore;
  const classes: Record<string, string> = styles();
  useEffect(() => {
    loadUserData();
    return () => {
      if (props.onClose) {
        props.onClose();
      }
    };
  }, []);

  const loadUserData = (): void => {
    if (!props.userId) {
      useUpsert.setFormValues(user);
      return;
    }
    UIStore.setPageLoader(true);
    const { userStore } = props;
    _userStore
      .getUser(props.userId)
      .pipe(
        switchMap(user => {
          setUser(new UserModel(user));
          useUpsert.setFormValues(user);
          return user.csdUserId != 0 ? _userStore.loadCsdUsers(null, [ user.csdUserId ], true) : of(null);
        }),
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        error: error => {
          AlertStore.critical(error.message);
          setIsGridDataLoaded(true);
        },
      });
  }

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'user',
      inputControls: [
        {
          fieldKey: 'firstName',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'lastName',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'username',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
      ],
    };
  }

  /* istanbul ignore next */
  const dialogContent = (): ReactNode => {
    return (
      <>
        {isGridDataLoaded && (
          <Typography variant="h6" className={classes.title}>
            No User information for this user
          </Typography>
        )}
        {!isGridDataLoaded && (
          <div className={classes.modalDetail}>
            {groupInputControls().inputControls.map((inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                isExists={inputControl.isExists}
                classes={{
                  flexRow: classes.inputControl,
                }}
                field={useUpsert.getField(inputControl.fieldKey)}
                isEditable={useUpsert.isEditable}
                onValueChange={(option, fieldKey) => useUpsert.onValueChange(option, inputControl.fieldKey)}
              />
            ))}
            <div className={classes.btnContainer}>
              <div className={classes.btnSection}>
                <Link target="_blank" to={`/user-management/users/${user.id}/edit`}>
                  <ExternalLinkIcon />
                </Link>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Dialog
      title="Users Info"
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.userMappedWidth,
        header: classes.headerWrapper,
        content: classes.content,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
};


export default inject('userStore')(observer(UserInfo));
