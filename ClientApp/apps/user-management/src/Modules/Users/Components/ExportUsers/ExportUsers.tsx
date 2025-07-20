import { Typography, Card, CardContent, Button, Tooltip } from '@material-ui/core';
import { Dialog } from '@uvgo-shared/dialog';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import React, { FC, ReactNode, useState } from 'react';
import { UserStore } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { useStyles } from './ExportUsers.style';
import { AxiosError } from 'axios';
import { UIStore, IClasses, IAPIGridRequest } from '@wings-shared/core';
import { CloseIcon } from '@uvgo-shared/icons';
import { useUnsubscribe } from '@wings-shared/hooks';
import AddBoxIcon from '@material-ui/icons/AddBox';

type Props = {
  userStore: UserStore;
  request?: IAPIGridRequest;
  classes?: IClasses;
};

const ExportUsers: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const [ notIncluded, setNotIncluded ] = useState(props.userStore?.schema.filter(field => field !== 'Id'));
  const [ included, setIncluded ] = useState<any>([ 'Id' ]);

  const addField = (field): void => {
    setIncluded([ ...included, field ]);
    setNotIncluded(notIncluded.filter(item => item !== field));
  }

  const removeField = (field) => {
    setNotIncluded([ ...notIncluded, field ]);
    setIncluded(included.filter(item => item !== field));
  };

  const exportUsers = (): void => {
    UIStore.setPageLoader(true);
    props.userStore
      .exportUsers(included, props.request.status, props.request.q, props.request.provider)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (response: any) => AlertStore.info(response),
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  const renderField = (field, isIncluded) => (
    <Card key={field} variant="outlined" className={classes.cardContainer}>
      <CardContent className={classes.cardBox}>
        <div className={classes.subSectionContainer}>
          <div className={classes.subSection}>
            <Tooltip title={field} placement="top-start">
              <Typography variant="subtitle1" className={classes.groupText}>{field}</Typography>
            </Tooltip>
          </div>
        </div>
        {!(isIncluded && field === 'Id') && (
          <Button 
            onClick={() => isIncluded ? removeField(field) : addField(field)}
            className={classes.close} size="small">
            {isIncluded ? <CloseIcon /> : <AddBoxIcon className={classes.addIcon} />}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const dialogContent = (): ReactNode => {
    return (
      <div>
        <div className={classes.modelContainer}>
          <div className={classes.titleContainerFirst}>INCLUDED</div>
          <div className={classes.titleContainer}>NOT INCLUDED</div>
        </div>
        <div className={classes.detailContainer}>
          <div className={classes.detailList}>
            {included.map(field => renderField(field, true))}
          </div>
          <div className={classes.detailList}>
            {notIncluded.map(field => renderField(field, false))}
          </div>
        </div>
        <div className={classes.infoContainer}>
          <div className={classes.searchContainer}>
            <div className={classes.heading}>Search Filter</div>
            <div>{props.request.q}</div>
          </div>
          <div className={classes.searchContainer}>
            <div className={classes.heading}>Profile</div>
            <div>{props.request.provider}</div>
          </div>
        </div>
        <div>
          <div className={classes.heading}>Status</div>
          <div>{props.request.status}</div>
        </div>
        <div className={classes.btnContainer}>
          <div className={classes.btnContainerCancel}>
            <Button color="primary" variant="contained" size="small" onClick={() => ModalStore.close()}>
              Cancel
            </Button>
          </div>
          <div className={classes.btnContainerSave}>
            <Button color="primary" variant="contained" size="small" onClick={() => exportUsers()}>
              Send to Email
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog
      title='Export Users'
      open={true}
      classes={{
        paperSize: classes.userMappedWidth,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  )
}

export default inject('userStore')(observer(ExportUsers));