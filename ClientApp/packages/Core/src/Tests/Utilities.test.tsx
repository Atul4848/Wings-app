import { Utilities } from '../Tools/Utilities';
import { expect } from 'chai';
import { AuditHistoryModel, TimeZoneBaseModel } from '../Models';
import { GridApi, ICellEditorComp, RowNode } from 'ag-grid-community';
import { GetCellEditorInstancesParams } from 'ag-grid-community/dist/lib/gridApi';
import { GridApiMock, CountryModel } from '@wings/shared';
import moment from 'moment';
import { DATE_FORMAT } from '../Enums';
import { ISelectOption } from '../Interfaces';

describe('Utilities', () => {
  const testData: CountryModel[] = [
    new CountryModel({ id: 0, name: 'TEST-A' }),
    new CountryModel({ id: 5, name: 'TEST-D' }),
    new CountryModel({ id: 2, name: 'TEST-B' }),
    new CountryModel({ id: 4, name: 'TEST-C' }),
  ];

  const getDateTime = (hours: number, mins: number) => moment().hour(hours).minutes(mins).seconds(0).format();

  it('should render param string correctly', () => {
    const params = {
      first: 'one',
      second: 'two',
      third: 'three',
    };
    expect(Utilities.buildParamString(params)).to.eq('first=one&second=two&third=three');
  });

  it('should work correctly with numbers', () => {
    const params = {
      first: 1,
      second: 2,
      third: 3,
    };
    expect(Utilities.buildParamString(params)).to.eq('first=1&second=2&third=3');
  });

  it('should work correctly with space-contained values', () => {
    const params = {
      first: 'number one',
      second: 'number two',
      third: 'number three',
    };
    const formattedString = 'first=number%20one&second=number%20two&third=number%20three';
    expect(Utilities.buildParamString(params)).to.eq(formattedString);
  });

  it('should replace non-existent values with empty strings', () => {
    const params = {
      first: 'one',
      second: null,
      third: false,
      fourth: undefined,
    };
    const formattedString = 'first=one&second=&third=&fourth=';
    expect(Utilities.buildParamString(params)).to.eq(formattedString);
  });

  it('should work correctly with zero', () => {
    const params = {
      first: 0,
      second: '0',
    };
    const formattedString = 'first=0&second=0';
    expect(Utilities.buildParamString(params)).to.eq(formattedString);
  });

  it('should work correctly with specifiedFields', () => {
    const params = {
      specifiedFields: ['Name', 'Email'],
    };
    const formattedString = 'specifiedFields=Name&specifiedFields=Email';
    expect(Utilities.buildParamString(params)).to.eq(formattedString);
  });

  it('should return array of row nodes of the grid', () => {
    const gridApi = new GridApi();
    const rowNodes: RowNode[] = [new RowNode()];
    gridApi.forEachNode = (callback: (rowNode: RowNode, index: number) => void) => rowNodes.forEach(callback);
    gridApi.getDisplayedRowAtIndex = (index: number) => rowNodes[index];
    expect(Utilities.getRowNodes(gridApi)).to.lengthOf(1);
  });

  it('should hasInvalidRowData grid', () => {
    const gridApi = new GridApi();
    const component: ICellEditorComp = {
      getValue: () => '',
      getGui: () => null,
      getFrameworkComponentInstance: () => {
        return { hasError: true };
      },
    };
    gridApi.getCellEditorInstances = (params?: GetCellEditorInstancesParams) => [component, component];
    expect(Utilities.hasInvalidRowData(null)).false;
    expect(Utilities.hasInvalidRowData(gridApi)).true;
  });

  it('getErrorMessages should return proper message', () => {
    const errorMessage: string = 'Test Error Message';
    const gridApi = new GridApiMock({ hasError: true, errorMessage });
    expect(Utilities.getErrorMessages(gridApi).toString()).to.be.eqls(errorMessage);

    // return empty if no error
    gridApi.hasError = false;
    expect(Utilities.getErrorMessages(gridApi).toString()).to.be.eqls('');
  });

  it('should return true if enter key is pressed', () => {
    const event: KeyboardEvent = new KeyboardEvent('Enter', { code: 'Enter' });
    expect(Utilities.hasPressedEnter(event)).to.be.true;
  });
  it('should return string in proper format', () => {
    const listItems: string[] = ['test1', 'test2', 'test 3'];
    expect(Utilities.displayFormat([])).to.eq('');
    expect(Utilities.displayFormat(listItems)).to.eq('test1,test2 and (1) more');
  });

  it('should return proper formatted value', () => {
    expect(Utilities.getformattedDate('')).to.be.null;
    expect(Utilities.getformattedDate('2020-10-19T00:00:00', 'MM/DD/YYYY')).to.be.equal('10/19/2020');
  });

  it('should work correctly with country name search', () => {
    expect(Utilities.customArraySearch([], '', '')).to.be.false;
    expect(Utilities.customArraySearch<CountryModel>(testData, 'name', 'TEST-B')).equal(true);
  });

  it('should return sorted array', () => {
    // empty case
    expect(Utilities.customArraySort<CountryModel>([], 'id')).lengthOf(0);

    // single key
    const sortedIds: string = Utilities.customArraySort<CountryModel>(testData, 'id')
      .map(({ id }: CountryModel) => id as number)
      .toString();
    expect(sortedIds).to.eq('0,2,4,5');

    // multi keys
    const sortedArrayNames: string = Utilities.customArraySort<CountryModel>(testData, 'name', 'id')
      .map(({ name }: CountryModel) => name as string)
      .toString();
    expect(sortedArrayNames).to.equal('TEST-A,TEST-B,TEST-C,TEST-D');
  });

  it('should return a random number', () => {
    expect(isNaN(Utilities.getTempId(true))).to.be.false;
  });

  it('should return closest timeZone', () => {
    const timeZones: TimeZoneBaseModel[] = [
      new TimeZoneBaseModel({ newLocalTime: '2019-04-07T03:00:00', year: 2019 }),
      new TimeZoneBaseModel({ newLocalTime: '2019-10-27T01:00:00', year: 2020 }),
      new TimeZoneBaseModel({ newLocalTime: '2019-10-27T01:00:00', year: 2016 }),
    ];
    const expectedLocalTime: string = '2019-10-27T01:00:00';
    expect(Utilities.getCurrentTimeZone(timeZones).newLocalTime).equal(expectedLocalTime);
  });

  it('should called getNumberOrNullValue method', () => {
    expect(Utilities.getNumberOrNullValue(1)).to.be.equal(1);
    expect(Utilities.getNumberOrNullValue('10')).equal(10);
    expect(Utilities.getNumberOrNullValue('')).equal(null);
  });

  it('customComparator method should work correctly', () => {
    const valueA: ISelectOption = { label: 'Active', value: 'Active' };
    const valueB: ISelectOption = { label: 'InActive', value: 'InActive' };

    const valueC: ISelectOption = { label: 'active', value: 'active' };
    // second is greather than first
    expect(Utilities.customComparator(valueA, valueB, 'value')).to.eq(-1);

    // first is greater than second
    expect(Utilities.customComparator(valueB, valueA, 'value')).to.eq(1);

    // Both values are equal
    expect(Utilities.customComparator(valueA, valueA, 'value')).to.eq(0);

    // Both values are equal and lowercase
    expect(Utilities.customComparator(valueC, valueC)).to.eq(0);
  });

  it('customDateComparator method should work correctly', () => {
    const valueA: string = '2021-06-08T09:13:57Z';
    const valueB: string = '2021-07-10T08:13:57Z';
    const valueC: string = '';
    const valueD: string = null;
    // second is greater than first
    expect(Utilities.customDateComparator(valueA, valueB)).to.eq(-1);

    // first is greater than second
    expect(Utilities.customDateComparator(valueB, valueA)).to.eq(1);

    // Both values are equal
    expect(Utilities.customDateComparator(valueA, valueA)).to.eq(0);

    // Should work for invalid dates
    expect(Utilities.customDateComparator(valueC, valueD)).to.eq(-1);
    expect(Utilities.customDateComparator(valueB, valueD)).to.eq(1);
  });

  it('updateArray add new element by default', () => {
    const simpleArray: number[] = [1, 2, 3, 4];
    //add new element by default
    expect(Utilities.updateArray<number>(simpleArray, 111)).eqls([...simpleArray, 111]);
  });

  it('updateArray replace element by predicate', () => {
    const simpleArray: number[] = [1, 2, 3, 4];
    //add new element by default
    const newArray = Utilities.updateArray<number>(simpleArray, 111, { replace: true, predicate: v => v === 2 });
    expect(newArray).eqls([1, 111, 3, 4]);
  });

  it('updateArray add element if item is not found by predicate', () => {
    const simpleArray: number[] = [1, 2, 3, 4];
    //add new element by default
    const newArray = Utilities.updateArray<number>(simpleArray, 111, { replace: true, predicate: v => v === 444 });
    expect(newArray).eqls([...simpleArray, 111]);
  });

  it('isEqual method should work correctly', () => {
    // should match string
    expect(Utilities.isEqual('Test', 'test')).to.eq(true);

    // should not match string
    expect(Utilities.isEqual('Test', 'testing')).to.eq(false);

    // should match number
    expect(Utilities.isEqual(110, 110)).to.eq(true);

    // should not match number
    expect(Utilities.isEqual(150, 110)).to.eq(false);

    // doesn't match
    expect(Utilities.isEqual('', 'test')).to.eq(false);

    // should match boolean
    expect(Utilities.isEqual(true, true)).to.eq(true);

    // different type
    expect(Utilities.isEqual('TestA', 1)).to.eq(false);

    expect(Utilities.isEqual('', '')).to.eq(false);

    expect(Utilities.isEqual(null, null)).to.eq(false);

    expect(Utilities.isEqual(null, undefined)).to.eq(false);
  });

  it('trim method should work correctly', () => {
    // should trim string
    expect(Utilities.trim('Test ')).to.eq('Test');

    // should return empty string
    expect(Utilities.trim(null)).to.eq('');
  });

  it('trimLeadingZeros method should work correctly', () => {
    // should trim leading zeros
    expect(Utilities.trimLeadingZeros('000112')).to.eq('112');

    expect(Utilities.trimLeadingZeros('0525')).to.eq('525');

    expect(Utilities.trimLeadingZeros('')).to.eq('');

    expect(Utilities.trimLeadingZeros('100')).to.eq('100');

    expect(Utilities.trimLeadingZeros('0505')).to.eq('505');
  });

  it('should remove empty values with trimEmptyValues', () => {
    const testObject = {
      testOne: ' ',
      testTwo: 'test  ',
      testThree: '  test',
      testFour: ' test ',
      testFive: 'test test',
    };
    const trimmedObject = Utilities.trimEmptyValues(testObject);
    expect(trimmedObject.testOne).to.eq('');
    expect(trimmedObject.testTwo).to.eq('test');
    expect(trimmedObject.testThree).to.eq('test');
    expect(trimmedObject.testFour).to.eq('test');
    expect(trimmedObject.testFive).to.eq('test test');
  });

  it('compareDateTime should return proper validation for time', () => {
    expect(Utilities.compareDateTime('', '')).to.be.true;
    expect(Utilities.compareDateTime(getDateTime(6, 0), getDateTime(10, 0))).to.be.true;
    expect(Utilities.compareDateTime(getDateTime(10, 0), getDateTime(6, 0))).to.be.false;
  });

  it('compareDateTime should work with time only', () => {
    expect(Utilities.compareDateTime('08:00:AM', '05:00:PM', DATE_FORMAT.APPOINTMENT_TIME)).to.be.true;
    expect(Utilities.compareDateTime('05:00:PM', '08:00:AM', DATE_FORMAT.APPOINTMENT_TIME)).to.be.false;
  });

  it('should compareDateTime with ignoreTime', () => {
    expect(Utilities.compareDateTime('2021-06-09T18:29:00', '2021-06-10T18:29:00', DATE_FORMAT.APPOINTMENT_TIME, true))
      .to.be.true;
    expect(Utilities.compareDateTime('2021-06-09T18:30:00', '2021-06-10T18:33:00', DATE_FORMAT.APPOINTMENT_TIME, true))
      .to.be.true;
  });

  it('should compareDateTime with ignoreDate', () => {
    expect(
      Utilities.compareDateTime('2021-06-09T18:29:00', '2021-06-10T18:29:00', DATE_FORMAT.APPOINTMENT_TIME, false, true)
    ).to.be.true;
    expect(
      Utilities.compareDateTime('2021-06-09T18:33:00', '2021-06-10T18:29:00', DATE_FORMAT.APPOINTMENT_TIME, false, true)
    ).to.be.false;
    expect(
      Utilities.compareDateTime('2021-06-09T18:29:00', '2021-06-10T18:33:00', DATE_FORMAT.APPOINTMENT_TIME, false, true)
    ).to.be.true;
  });

  it('should combine Date Time', () => {
    expect(Utilities.combineDateTime('2021-06-09T18:29:00', '2021-05-27T18:31:00Z')).to.eq('2021-06-09T18:31:00');
    expect(Utilities.combineDateTime('2021-07-28T14:20:00', '2021-05-27T19:00:00Z')).to.eq('2021-07-28T19:00:00');
    expect(Utilities.combineDateTime('2021-06-09T18:29:00', '')).to.eq('');
  });

  it('should return getSpecifiedFieldParams string', () => {
    const data = ['Code', 'CommonName'];
    const result = '&specifiedFields=Code&specifiedFields=CommonName';
    expect(Utilities.getSpecifiedFieldParams(data)).to.eq(result);
  });

  it('filters should proper values', () => {
    expect(Utilities.filters(null)).to.be.null;
    const value = { testA: 'A', testB: 'B' };
    expect(Utilities.filters(value).filterCollection).to.eq('[{"testA":"A","testB":"B"}]');

    // should remove null
    expect(Utilities.filters({ testA: null })).to.be.null;
  });

  it('should return field values', () => {
    // without key
    expect(Utilities.getFieldValue<CountryModel>(new CountryModel({ id: 1 }), 'name')).to.eq('');

    // with key
    expect(Utilities.getFieldValue<CountryModel>(new CountryModel({ id: 1 }), 'id')).to.eq(1);
  });

  it('should give current date time', () => {
    expect(Utilities.getCurrentDateTime).to.eq(moment().format(DATE_FORMAT.API_FORMAT));
  });

  it('should be able to parse string into json', () => {
    expect(Utilities.isValidJsonString('{}')).to.be.true;
  });

  it('should fail to parse string into json', () => {
    expect(Utilities.isValidJsonString('sample')).to.be.false;
  });

  it('gridApiPaginatedData should work properly', () => {
    let gridAPi = new GridApiMock();
    const array = Array.from(Array(30).keys());

    // should return 0-9 records default from grid api
    const caseOne = Utilities.gridApiPaginatedData(gridAPi, array);
    expect(caseOne).lengthOf(10);

    // should return 10-19 records
    gridAPi = new GridApiMock({ currentPage: 1 });
    const caseTwo = Utilities.gridApiPaginatedData(gridAPi, array);
    expect(caseTwo[0]).equals(10);

    // should return 10-24 records
    gridAPi = new GridApiMock({ currentPage: 1, pageSize: 15 });
    const caseThree = Utilities.gridApiPaginatedData(gridAPi, array);
    expect(caseThree).lengthOf(15);
  });

  it('should be able to parse string into json object', () => {
    const parsedObject: object = Utilities.parseJSON('{"Test": "Sample"}');
    expect(parsedObject).not.null;

    expect(parsedObject['Test']).to.be.equal('Sample');
  });

  it('should fail to parse string into json object', () => {
    expect(Utilities.parseJSON('TEST')).to.equal(null);

    expect(Utilities.parseJSON('')).to.equal(null);
  });

  it('isSameDate method should work correctly', () => {
    const valueA: string = '2021-06-08T09:13:57Z';
    const valueB: string = '2021-06-08T09:13:57Z';
    const valueC: string = '2021-06-09T09:13:57Z';

    expect(Utilities.isSameDate(valueA, valueB)).to.be.true;
    expect(Utilities.isSameDate(valueA, valueC)).to.be.false;
  });

  it('should create filter object properly', () => {
    expect(Utilities.getFilter('Name', 'ABC')).eql({ propertyName: 'Name', propertyValue: 'ABC' });
    expect(Utilities.getFilter('Name', 'ABC', 'and')).eql({
      propertyName: 'Name',
      propertyValue: 'ABC',
      operator: 'and',
    });
  });

  it('should create tree path properly', () => {
    const data = [
      new AuditHistoryModel({
        name: 'TEST',
        changes: [
          new AuditHistoryModel({ name: 'TEST2', changes: [new AuditHistoryModel({ name: 'TEST3', changes: [] })] }),
        ],
      }),
    ];
    const response = Utilities.getAuditHistoryData(data, [1], false);
    expect(response[0].path).eql([1]);
    expect(response[1].path).eql([1, 1]);
    expect(response[2].path).eql([1, 1, 1]);
  });

  it('getNotFilter should work properly', () => {
    expect(Utilities.getNotFilter('Name')).eql({
      propertyName: 'Name',
      propertyValue: null,
      filterType: 'ne',
      operator: 'and',
    });
  });

  it('should parse string to Date properly', () => {
    expect(Utilities.parseDateTime('19/10/2020', 'DD/MM/YYYY').format('DD/MM/YYYY')).eq('19/10/2020');
    expect(Utilities.parseDateTime('19-10-2020', 'DD-MM-YYYY').format('DD/MM/YYYY')).eq('19/10/2020');
    expect(Utilities.parseDateTime('19-Aug-2020', 'DD-MMM-YYYY').format('DD/MM/YYYY')).eq('19/08/2020');
  });
});
