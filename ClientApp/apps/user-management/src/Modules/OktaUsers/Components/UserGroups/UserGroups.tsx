import React from 'react';
import { withStyles, Typography } from '@material-ui/core';
import { styles } from './UserGroups.styles';
import PersonIcon from '@material-ui/icons/Person';
import { UserGroupModel } from '../../../Shared';
import { IClasses, withRouter } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  userGroups: UserGroupModel[];
}
const UserGroups = ({ classes, userGroups }: Props) => {
  return (
    <div className={classes.groupSection}>
      {userGroups.map((userGroup, idx) => (
        <div key={idx} className={classes.details}>
          <div className={classes.subSection}>
            <PersonIcon className={classes.pic} />
            <Typography variant="subtitle2" className={classes.groupName}>{userGroup.name}</Typography>
          </div>
        </div>
      ))}
    </div>
  );
};

export default withRouter(withStyles(styles)(UserGroups));
