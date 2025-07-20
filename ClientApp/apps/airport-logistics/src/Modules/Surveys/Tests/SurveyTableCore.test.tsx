import * as React from 'react';
import moment from 'moment';
import * as sinon from 'sinon';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { mount, ReactWrapper } from 'enzyme';
import { MemoryRouter } from 'react-router';
import { expect } from 'chai';
import { SurveyMock } from '../../Shared/Mocks';
import { SurveyTableCore } from '../SurveyTable/SurveyTableCore/SurveyTableCore';

describe('SurveyTableCore component', () => {
  let wrapper: ReactWrapper;
  describe('when all props are passed properly', () => {
    beforeEach(() => {
      wrapper = mount(
        <MemoryRouter>
          <SurveyTableCore rowData={SurveyMock.surveys}></SurveyTableCore>
        </MemoryRouter>
      )
    });
    it('should be rendered without errors', () => {
      expect(wrapper).to.have.length(1);
    });
    it('should add 7 columns in the table', () => {
      expect(wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs).to.have.length(7)
    });
    it('should call sizeColumnsToFit hook on ready', () => {
      const onGridReady = wrapper.find(CustomAgGridReact).props().gridOptions.onGridReady
      const fn = sinon.stub();
      const params: any = {
        api: {
          sizeColumnsToFit: fn
        }
      }
      onGridReady(params);
      expect(fn.calledOnce).to.be.true;
    });

    it('should give proper params in cellRendererParams for statusLabel', () => {
      const statusLabelField: any = wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs.find((column: any) => column.field === 'statusLabel');
      const params: any = {
        data: {
          statusLabel: 'label',
          statusClassName: 'statusClassName'
        },
      }
      expect(statusLabelField.cellRendererParams(params)).that.deep.equals({ label: 'label', modifier: `table statusClassName` });
    });

    describe('When user tries to give date filter', () => {
      it('should give 0 if the selected date is same as cell date', () => {
        const approvedDate: any = wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs.find((column: any) => column.field === 'approvedDate');
        expect(approvedDate.filterParams.comparator(new Date('2020/10/10'), '10-Oct-2020')).to.eqls(0);
      });

      it('should give -1 if the selected date is after the cell date', () => {
        const approvedDate: any = wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs.find((column: any) => column.field === 'approvedDate');
        expect(approvedDate.filterParams.comparator(new Date('2020/11/10'), '10-Oct-2020')).to.eqls(-1);
      });

      it('should give 1 if the selected date is before the cell date', () => {
        const approvedDate: any = wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs.find((column: any) => column.field === 'approvedDate');
        expect(approvedDate.filterParams.comparator(new Date('2020/09/10'), '10-Oct-2020')).to.eqls(1);
      });

      it('should return null if the cell date is invalid', () => {
        const approvedDate: any = wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs.find((column: any) => column.field === 'approvedDate');
        expect(approvedDate.filterParams.comparator(new Date('2020/09/10'), '10-Ocat-2020')).to.eqls(null)
      });
    });

    describe('When user tries to format column which has dates', () => {
      it('dateComparator should return -1 if firstValue is invalid', () => {
        const dateField: any = wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs.find((column: any) => column.field === 'submittedDate');
        expect(dateField.comparator(null)).to.eqls(-1);
      });

      it('dateComparator should return 1 if secondValue is invalid', () => {
        const dateField: any = wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs.find((column: any) => column.field === 'submittedDate');
        expect(dateField.comparator(moment(), null)).to.eqls(1);
      });

      it('dateComparator should return 0 if both are same', () => {
        const currentTime = moment();
        const dateField: any = wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs.find((column: any) => column.field === 'submittedDate');
        expect(dateField.comparator(currentTime, currentTime)).to.eqls(0);
      });

      it('dateComparator should return -1 if first date is smaller than second', () => {
        const currentTime = moment();
        const dateField: any = wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs.find((column: any) => column.field === 'submittedDate');
        expect(dateField.comparator(currentTime.subtract(1, 'day').format('DD-MMM-YYYY HH:mm'), moment().format('DD-MMM-YYYY HH:mm'))).to.eqls(-1);
      });

      it('dateComparator should return 1 if first date is after than second', () => {
        const currentTime = moment();
        const dateField: any = wrapper.find(CustomAgGridReact).props().gridOptions.columnDefs.find((column: any) => column.field === 'submittedDate');
        expect(dateField.comparator(moment().add(1, 'day').format('DD-MMM-YYYY HH:mm'), currentTime.format('DD-MMM-YYYY HH:mm'))).to.eqls(1);
      });
    });
  })
})
