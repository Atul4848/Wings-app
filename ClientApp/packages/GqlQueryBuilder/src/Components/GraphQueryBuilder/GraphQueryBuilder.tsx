import { Box, Button, TextField } from '@material-ui/core';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import { Autocomplete } from '@material-ui/lab';
import {
  Builder,
  ImmutableTree,
  JsonTree,
  MaterialConfig,
  Utils as QbUtils,
  Query,
} from '@react-awesome-query-builder/material';
import '@react-awesome-query-builder/material/css/styles.css';
import { AlertStore } from '@uvgo-shared/alert';
import { Utilities } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuthStore } from '@wings-shared/security';
import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';
import { IGqlStore, INoSqlAPIRequest } from '../../Interfaces';
import {
  GraphQLStore,
  MongoHelper,
  camelCasingToLevel,
  generateColumns,
  getSelectedFields,
  mapToQglQuery,
  reduceFields,
} from '../../Tools';
import { useStyles } from './GraphQueryBuilder.styles';
import { overrideOperators, overrideTypes, overrideWidgets } from './Operators';
import QueryTemplates from './QueryTemplates/QueryTemplates';

type Props = {
  store: IGqlStore;
  onFieldsChange: (fields) => void;
  onCollectionChange: () => void;
  onSearch: (params: INoSqlAPIRequest) => void;
  disabledSearch: boolean;
};

type ISelectedCollection = {
  collectionName: string;
  label: string;
  value: any;
};

const InitialConfig = MaterialConfig;

const GraphQueryBuilder = ({ store, ...props }: Props) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const queryEditorRef = useRef<{
    syncQueryLists: Function;
    setDefaultOption: Function;
    removeQuery: Function;
  }>();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Fields We get from the graphql API
  const [rawFields, setRawFields] = useState();

  const [options, setOptions] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState<
    ISelectedCollection
  >();
  const [queryData, setQueryData] = useState<{
    treeData: JsonTree;
    selectedFields: string[];
  }>();
  const [query, setQuery] = useState<ImmutableTree>();

  const [config, setConfig] = useState({
    ...InitialConfig,
    fields: {},
    rawFieldsData: {}, // Store Fields Temporally
    operators: overrideOperators(InitialConfig.operators),
    types: overrideTypes(InitialConfig.types),
    widgets: overrideWidgets(InitialConfig.widgets),
    settings: {
      ...InitialConfig.settings,
      showNot: false,
      // maxNesting: 1,
    },
  });

  useEffect(() => {
    setupQueryFilters(queryData?.treeData);
  }, [config]);

  useEffect(() => {
    store.showLoader();
    GraphQLStore.loadQueryList()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => store.hideLoader())
      )
      .subscribe(response => {
        try {
          const optionsData = response.data.data.__schema.queryType.fields
            .map(x => {
              const value = x.args.find(y => y.name === 'where')?.type?.name;
              return {
                label: camelCasingToLevel(x.name),
                collectionName: value.replace('FilterInput', ''), // Remove FilterInput to Get The Collection Name,
                value,
              };
            })
            .sort((a, b) => a.collectionName.localeCompare(b.collectionName));

          setSelectedCollection(optionsData[0]);
          setOptions(optionsData);
        } catch (error) {
          console.log(error);
        }
      });
  }, []);

  useEffect(() => {
    loadCollectionFields();
  }, [selectedCollection]);

  const loadCollectionFields = () => {
    if (!selectedCollection) {
      return;
    }

    store.showLoader();
    GraphQLStore.loadArgsByPropertyName(selectedCollection.value as string)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => store.hideLoader())
      )
      .subscribe(response => {
        try {
          const { collectionName } = selectedCollection;
          const rawFields = response.data.data.__type.inputFields;
          setRawFields(rawFields);
          // In Query Builder we need fields with array operators for GQL
          setConfig({
            ...config,
            fields: reduceFields(
              rawFields,
              collectionName,
              false,
              '',
              fieldKey => {
                if (Array.isArray(queryData?.selectedFields)) {
                  return queryData?.selectedFields.includes(fieldKey);
                }
                return false;
              }
            ),
          });
          // Add Unique Keys for nodes and emit array type fields
          const _fields = reduceFields(
            rawFields,
            collectionName,
            true,
            '',
            fieldKey => {
              return Array.isArray(queryData?.selectedFields)
                ? queryData?.selectedFields.includes(fieldKey)
                : false;
            }
          );
          props.onFieldsChange(_fields);
          props.onCollectionChange();
          setIsDataLoaded(true);
        } catch (error) {
          console.log(error);
        }
      });
  };

  // Auto Apply filters based on the saved Data tree data in Query
  const setupQueryFilters = treeData => {
    if (!treeData) {
      return;
    }

    const parsedQuery = QbUtils.checkTree(
      QbUtils.loadTree(treeData as JsonTree),
      config
    );
    setQuery(parsedQuery);
  };

  // Save Changes to the API
  const saveQueryTemplateData = queryData => {
    const fields = generateColumns(store.fields, '');
    const data = {
      userId: AuthStore.user?.userGUID,
      id: queryData.isNew ? null : queryData.id,
      name: queryData.name,
      collectionName: selectedCollection?.collectionName,
      treeData: JSON.stringify(QbUtils.getTree(query)),
      selectedFields: getSelectedFields(fields, []),
    };
    store.showLoader();
    GraphQLStore.saveUserQueryData(data)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => store.hideLoader())
      )
      .subscribe(
        ({ data }) => {
          queryEditorRef.current?.syncQueryLists(data, queryData.id);
        },
        ({ response }) => {
          if (Array.isArray(response.data.messages)) {
            AlertStore.critical(response.data.messages[0]);
          }
        }
      );
  };

  // Save Changes to the API
  const deleteQueryTemplateData = queryData => {
    const queryId = queryData.isNew ? null : queryData.id;
    store.showLoader();
    GraphQLStore.deleteUserQueryData(queryId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => store.hideLoader())
      )
      .subscribe({
        next: () => {
          onQueryChange({
            collectionName: options[0]?.collectionName,
            selectedFields: [],
            treeData: { ...queryData?.treeData, children1: [] },
          });
          queryEditorRef.current.removeQuery(queryData.id);
        },
      });
  };

  // Called when user make changes for Query
  const onQueryChange = queryData => {
    store.setHasChanges(false);
    // If Tree data is Not Available then return
    if (!queryData || Utilities.isEqual(queryData?.name, 'New')) {
      return;
    }
    setQueryData(queryData);
    const { collectionName } = queryData;
    // If Collection already selected then no need to setup again and apply filters directly
    if (selectedCollection?.collectionName == collectionName) {
      setupQueryFilters(queryData?.treeData);
      if (rawFields) {
        const _fields = reduceFields(
          rawFields,
          collectionName,
          true,
          '',
          fieldKey => {
            return Array.isArray(queryData?.selectedFields)
              ? queryData?.selectedFields.includes(fieldKey)
              : false;
          }
        );
        props.onFieldsChange(_fields);
      }
      return;
    }
    const collectionData = options.find(({ collectionName }) =>
      Utilities.isEqual(collectionName, queryData.collectionName)
    );
    setSelectedCollection(collectionData);
  };

  // Perform Search operation
  const onSearchButtonClick = () => {
    const _query = QbUtils.mongodbFormat(query, config);
    props.onSearch({
      collectionName: selectedCollection.collectionName,
      queryFilter: JSON.stringify(MongoHelper.mapToMongoDbQuery(_query)),
      gqlQuery: _query ? JSON.stringify(mapToQglQuery(_query)) : '',
    });
  };

  // IF Collections Are in Loading State then Show Loader
  if (!isDataLoaded) {
    return <div />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.inputs}>
        <Box flexBasis="50%" flexShrink={0} display="flex" gridGap={10}>
          <Autocomplete
            options={options}
            value={selectedCollection}
            key={selectedCollection?.value}
            getOptionLabel={x => x.label}
            size="small"
            disableClearable={true}
            className={classes.autoComplete}
            getOptionSelected={(o, v) => o?.value === v?.value}
            renderInput={params => (
              <TextField {...(params as any)} variant="outlined" />
            )}
            onChange={(_, value) => {
              // If Selected Collection is different then current active collection
              if (value.collectionName !== selectedCollection?.collectionName) {
                setSelectedCollection({ ...value });
                setConfig({ ...config, fields: {} });
                setQueryData(null);
                queryEditorRef.current?.setDefaultOption();
                store.setHasChanges(false);
              }
            }}
          />
          <div className={classes.searchButton}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              disabled={props.disabledSearch}
              onClick={onSearchButtonClick}
              startIcon={<SearchOutlined />}
            >
              Search
            </Button>
          </div>
        </Box>
        <QueryTemplates
          hasChanges={store.hasChanges}
          ref={queryEditorRef}
          disableActions={false}
          onSaveTemplate={saveQueryTemplateData}
          onQueryChange={onQueryChange}
          onDeleteTemplate={deleteQueryTemplateData}
        />
      </div>
      <Query
        {...config}
        value={query}
        onChange={_query => {
          store.setHasChanges(true);
          setQuery(_query);
        }}
        renderBuilder={props => <Builder {...props} />}
      />
    </div>
  );
};

export default observer(GraphQueryBuilder);
