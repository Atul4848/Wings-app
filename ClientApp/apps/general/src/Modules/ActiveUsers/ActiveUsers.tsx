import { Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import CachedOutlinedIcon from '@material-ui/icons/CachedOutlined';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { DATE_FORMAT, IClasses, UIStore, Utilities } from '@wings-shared/core';
import { agGridUtilities } from '@wings-shared/custom-ag-grid';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React, { FC, RefObject, useEffect, useRef, useState } from 'react';
import { finalize } from 'rxjs/operators';
import { ActiveUserModel, ActiveUsersStore } from '../Shared';
import { ACTIVE_USER } from '../Shared/Enums';
import { useStyles } from './ActiveUsers.style';
import ActiveUsersGrid from './ActiveUsersGrid';

type Props = {
  classes?: IClasses;
  activeUsersStore?: ActiveUsersStore;
};

const ActiveUsers: FC<Props> = ({ activeUsersStore }) => {
  const [ searchValue, setSearchValue ] = useState<string>('');
  const [ searchType, setSearchType ] = useState<string>(ACTIVE_USER.USERNAME.toString());

  const [ users, setUsers ] = useState<ActiveUserModel[]>([]);
  const [ isInternalData, setInternalData ] = useState(false);
  const [ isInternalOpsData, setInternalOpsData ] = useState(false);
  const classes = useStyles();
  const searchHeaderRef = useRef<ISearchHeaderRef>();

  useEffect(() => {
    loadInitialUsers();
  }, []);

  const loadInitialUsers = (): void => {
    UIStore.setPageLoader(true);
    activeUsersStore
      .getActiveUsers()
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((users: ActiveUserModel[]) => setUsers(users));
  };

  const rowData = (tierType: string) => {
    const user = new ActiveUserModel(users?.find(a => a.tierType === tierType));
    if (isInternalData) {
      user.users = user?.users?.filter(a => a.isInternal);
    }

    if (isInternalOpsData) {
      user.users = user?.users?.filter(a => a.isInternalOps);
    }

    return user?.users || [];
  };

  const tierTime = (tierType: string) => {
    const selectedUsers = users?.find(a => a.tierType === tierType);
    return Utilities.getformattedDate(
      moment
        .utc(selectedUsers?.tierTime)
        .local()
        .format(DATE_FORMAT.API_FORMAT),
      DATE_FORMAT.SDT_DST_FORMAT
    );
  };

  return (
    <>
      <div className={classes.headerContainer}>
        <div className={classes.subSection}>
          <VisibilityIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            Active uvGO Users
          </Typography>
        </div>
        <div>
          <SearchHeaderV2
            placeHolder={`Search by ${searchType}`}
            ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
            selectInputs={[ agGridUtilities.createSelectOption(ACTIVE_USER, ACTIVE_USER.USERNAME) ]}
            onFilterChange={() => {
              setSearchType(searchHeaderRef.current?.selectedOption);
              setSearchValue(searchHeaderRef.current?.searchValue || '');
            }}
          />
        </div>
        <FormControlLabel
          value={isInternalData}
          control={<Checkbox onChange={e => setInternalData(e.target.checked)} />}
          label="Internal Only"
        />
        <FormControlLabel
          value={isInternalOpsData}
          control={<Checkbox onChange={e => setInternalOpsData(e.target.checked)} />}
          label="InternalOps Only"
        />
        <PrimaryButton
          variant="contained"
          color="primary"
          startIcon={<CachedOutlinedIcon />}
          onClick={() => loadInitialUsers()}
        >
          Refresh
        </PrimaryButton>
      </div>
      <div className={classes.mainRoot}>
        <div className={classes.mainContent}>
          {[ 'Live', 'Stale', 'Offline', 'DropOut' ].map((item, idx) => (
            <ActiveUsersGrid
              key={idx + searchValue}
              title={item}
              tierTime={tierTime(item)}
              rowData={rowData(item)}
              searchValue={searchValue}
              searchType={searchType as ACTIVE_USER}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default inject('activeUsersStore')(observer(ActiveUsers));
