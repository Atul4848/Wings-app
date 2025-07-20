import React, { FC, useRef, useState } from 'react';
import {
  GraphQueryBuilder,
  CustomTreeView,
  AgGridView,
  AgGridViewRef,
} from './Components';
import { useStyles } from './GqlContainer.styles';
import { useLocalStore, observer } from 'mobx-react';
import { Progress, PROGRESS_TYPES } from '@uvgo-shared/progress';
import { Theme, ThemeProvider, StylesProvider, Box } from '@material-ui/core';
import { createGenerateClassName, generateProjection } from './Tools';
import Resizable from './Components/Resizable/Resizable';
import { ViewPermission } from '@wings-shared/core';

const ProgressLoader = Progress as any;

interface Props {
  theme: Theme;
}

const GqlContainer: FC<Props> = ({ theme }) => {
  const gridContainerRef = useRef<AgGridViewRef>();
  const classes = useStyles();

  const store = useLocalStore(() => ({
    isLoading: false,
    showLoader: () => (store.isLoading = true),
    hideLoader: () => (store.isLoading = false),
    projections: {},
    fields: {},
    hasChanges: false,
    setHasChanges: hasChange => (store.hasChanges = hasChange),
  }));

  const onFieldsChange = fields => {
    store.fields = fields;
    store.projections = generateProjection(fields);
    gridContainerRef.current?.setColumnDefs(fields);
  };

  const onSearch = params => gridContainerRef.current?.loadData(params);

  const generateClassName = createGenerateClassName();

  const disableSearch = !Boolean(
    Object.keys(store.fields).filter(item => store.fields[item].selected).length
  );

  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={theme}>
        <Box maxHeight="5px" width="100%">
          <ViewPermission hasPermission={store.isLoading}>
            <ProgressLoader type={PROGRESS_TYPES.LINEAR} />
          </ViewPermission>
        </Box>

        <div className={classes.root}>
          <div className={classes.leftPanel}>
            <CustomTreeView
              fields={store.fields || {}}
              onChange={params => {
                store.setHasChanges(true);
                onFieldsChange(params);
              }}
            />
          </div>
          <div className={classes.mainContent}>
            <Resizable
              className={classes.queryContainer}
              minHeight={35}
              maxHeight={450}
            >
              <GraphQueryBuilder
                store={store}
                onFieldsChange={onFieldsChange}
                onSearch={onSearch}
                disabledSearch={disableSearch}
                onCollectionChange={() => {
                  gridContainerRef.current?.resetGridData();
                  store.setHasChanges(false);
                }}
              />
            </Resizable>
            <div className={classes.gridContainer}>
              <AgGridView
                store={store}
                ref={gridContainerRef}
                disableExport={disableSearch}
              />
            </div>
          </div>
        </div>
      </ThemeProvider>
    </StylesProvider>
  );
};

export default observer(GqlContainer);
