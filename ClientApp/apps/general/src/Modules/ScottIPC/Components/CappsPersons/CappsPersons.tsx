import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ScottIPCModel } from '../../../Shared/Models/ScottIPC.model';
import { CappsPersonModel } from '../../../Shared/Models/CappsPerson.model';
import { ScottIPCStore } from '../../../Shared/Stores/ScottIPC.store';
import { useStyles } from './CappsPersons.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IAPIUpsertScottIPCRequest } from '../../../Shared';
import { Scrollable } from '@uvgo-shared/scrollable';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { IClasses, UIStore } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useGridState } from '@wings-shared/custom-ag-grid';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  scottIPCStore?: ScottIPCStore;
  upsertScottIpc: (request: IAPIUpsertScottIPCRequest) => void;
  sipc?: ScottIPCModel;
};

const CappsPersons: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const [ cappsPersonModel, setCappsPersonModel ] = useState<CappsPersonModel[]>([]);
  useEffect(() => {
    const sipc = props.sipc as ScottIPCModel;
    loadCappsPerson(sipc.uwaAccountNumber, sipc.sipcName);
  }, []);

  const loadCappsPerson = (customerNumber: string, sipcName: string): void => {
    UIStore.setPageLoader(true);
    props.scottIPCStore
      ?.getCappsPerson(sipcName, customerNumber)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(response => {
        setCappsPersonModel(response);
      });
  }

  const updatePersonId = (id: string, personId: number): void => {
    const { scottIPCStore } = props;
    UIStore.setPageLoader(true);
    scottIPCStore
      ?.updatePersonId(id, personId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe(response => gridState.setGridData(response));
  }

  const dialogContent = (): ReactNode => {
    const { classes, sipc } = props as Required<Props>;

    if (!cappsPersonModel?.length) {
      return <div>No matching CAPPS persons found for {sipc.sipcName}.</div>;
    }

    return (
      <>
        <span>
          Matching {sipc.sipcName}, person ID {sipc.crewPaxId}
        </span>
        {
          <Scrollable className={classes.scroll}>
            <Table>
              <TableHead className={classes.tableHeader}>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>CAPPS Person ID</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody className={classes.tableBody}>
                {cappsPersonModel.map((item, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.firstName}</TableCell>
                    <TableCell>{item.lastName}</TableCell>
                    <TableCell>{item.personId}</TableCell>
                    <TableCell>
                      <PrimaryButton
                        variant="contained"
                        className={classes.button}
                        onClick={() => updatePersonId(sipc.id, item.personId)}
                      >
                        Save this Person ID
                      </PrimaryButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollable>
        }
      </>
    );
  }

  return (
    <Dialog
      title="CAPPS Persons"
      open={true}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
      isLoading={() => UIStore.pageLoading}
    />
  );
}

export default inject('scottIPCStore')(observer(CappsPersons));
