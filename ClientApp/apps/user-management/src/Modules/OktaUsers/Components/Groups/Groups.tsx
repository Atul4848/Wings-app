import React from 'react';
import { withStyles, Typography, Card, CardContent, Button, Tooltip } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { Scrollable } from '@uvgo-shared/scrollable';
import DeleteIcon from '@material-ui/icons/Delete';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { styles } from '../ManageUserGroups/ManageUserGroups.styles';
import { CSDUserModel, UserGroupModel } from '../../../Shared';
import { IClasses } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  groups: UserGroupModel[] | CSDUserModel[];
  onAction: (id: string | number, name?: string) => void;
  isUserGroups?: boolean;
  isDisabled?: boolean;
}

const Groups = ({ classes, groups, isUserGroups, onAction, isDisabled }: Props) => {
  return (
    <>
      <div className={classes.detaillist}>
        {(groups as Array<UserGroupModel | CSDUserModel>).map((group, idx) => (
          <Card key={idx} variant="outlined" className={classes.cardcontainer}>
            <CardContent className={classes.cardbox}>
              <div className={classes.subSectionContainer}>
                <div className={classes.subSection}>
                  <PersonIcon className={classes.pic} />
                  <Tooltip title={group.name} placement="top">
                    <Typography variant="subtitle1" className={classes.groupText}>{group.name}</Typography>
                  </Tooltip>
                </div>
                <Typography
                  variant="caption"
                  className={classes.fullName}>
                  {(group as CSDUserModel).fullName}
                </Typography>
              </div>
              <div>
                {group.name !== 'Everyone' && (
                  <Button disabled={isDisabled} onClick={() =>
                    onAction(group.id, group?.name)} className={classes.close} size="small">
                    {isUserGroups ? <DeleteIcon /> : <AddBoxIcon className={classes.addIcon} />}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default withStyles(styles)(Groups);
