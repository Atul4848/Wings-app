import React from 'react';
import { withStyles, Typography, Card, CardContent, Tooltip } from '@material-ui/core';
import { styles } from '../ManageGroups/ManageGroups.styles';
import { CSDUserModel, UserGroupModel } from '../../../Shared';
import classNames from 'classnames';
import { IClasses } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  groups: UserGroupModel[] | CSDUserModel[];
  onAction: (id: string | number, name?: string) => void;
  isUserGroups?: boolean;
  isDisabled?: boolean;
  selectedGroupId?: string;
}

const GroupDetails = ({ classes, groups, isUserGroups, onAction, isDisabled, selectedGroupId = '' }: Props) => {
  return (
    <>
      {(groups as Array<UserGroupModel | CSDUserModel>).map((group, idx) => (
        <Card key={idx} variant="outlined"  classes={{ root:  classNames({
          cardContainer: group.id.toString() === selectedGroupId,
        }) }}>
          <CardContent  className={classes.cardbox}>
            <div onClick={()=> onAction(group.id, group?.name)} className={classes.subSectionContainer}>
              <div className={classes.subSection}>
                <Typography variant="subtitle1" className={classes.groupText}>{group.name}</Typography>
              </div>
              <Typography 
                variant="caption"
                className={classes.fullName}
              >
                {(group as CSDUserModel).fullName}
              </Typography>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default withStyles(styles)(GroupDetails);
