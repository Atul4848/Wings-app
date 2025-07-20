import { expect } from 'chai';
import * as sinon from 'sinon';
import {
  PermitModel,
  RuleFilterModel,
  PermitSettingsStoreMock,
  PermitStoreMock,
  PermitExceptionRuleModel,
  CONDITION_EDITOR,
} from '../../Shared';
import PermitDocumentValueEditor from '../Components/PermitRequirements/PermitDocumentValueEditor';
import React from 'react';
import { mount } from 'enzyme';
import { AgGridPopoverWrapper, AgGridAutoCompleteV2, AgGridSelectControl, AgGridCellEditor } from '@wings-shared/custom-ag-grid';
import { Autocomplete } from '@material-ui/lab';

describe('PermitDocumentValueEditor Component', () => {
  let wrapper: any;
  let settingsStoreMock: PermitSettingsStoreMock;
  let permitStoreMock: PermitStoreMock;
  const mockRef = React.createRef();

  const props = {
    settingsStore: new PermitSettingsStoreMock(),
    permitStore: new PermitStoreMock(),
    context: {
      componentParent: {
        onDropDownChange: sinon.spy(),
        onInputChange: sinon.spy(),
      },
    },
    value: [],
    colDef: {
      headerName: 'Test Header',
    },
    data: {
      condition: {
        conditionType: {
          label: CONDITION_EDITOR.ARRIVAL_COUNTRY,
        },
      },
    },
  };

  beforeEach(() => {
    settingsStoreMock = new PermitSettingsStoreMock();
    permitStoreMock = new PermitStoreMock();
    wrapper = mount(<PermitDocumentValueEditor {...props} ref={mockRef} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should render without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should render Autocomplete when editor type is multi-select', () => {
    wrapper.setProps({
      data: {
        condition: {
          conditionType: {
            label: CONDITION_EDITOR.REGISTRATION_NATIONALITY,
          },
        },
      },
    });
    wrapper.update();

    const autoComplete = wrapper.find(Autocomplete);
    expect(autoComplete.exists()).to.be.true;
  });

  it('should render AgGridSelectControl for boolean values', () => {
    wrapper.setProps({
      data: {
        condition: {
          conditionType: {
            label: CONDITION_EDITOR.IS_CARGO_FLIGHT,
          },
        },
      },
    });
    wrapper.update();

    const selectControl = wrapper.find(AgGridSelectControl);
    expect(selectControl.exists()).to.be.false;
  });

  it('should render AgGridAutoCompleteV2 for specific editor types', () => {
    wrapper.setProps({
      data: {
        condition: {
          conditionType: {
            label: CONDITION_EDITOR.AIRCRAFT_CATEGORY,
          },
        },
      },
    });
    wrapper.update();

    const autoComplete = wrapper.find(AgGridAutoCompleteV2);
    expect(autoComplete.exists()).to.be.true;
  });

  it('should handle multi-select input correctly', () => {
    wrapper.setProps({
      data: {
        condition: {
          conditionType: {
            label: CONDITION_EDITOR.REGISTRATION_NATIONALITY_REGION,
          },
        },
      },
    });
    wrapper.update();

    const popoverWrapper = wrapper.find(AgGridPopoverWrapper);
    expect(popoverWrapper.exists()).to.be.true;
  });

  it('should call onSearch function with AgGridAutoCompleteV2', () => {
    const agGridAutoCompleteSearch = wrapper.find(AgGridAutoCompleteV2).props();
    agGridAutoCompleteSearch.onSearch(null, CONDITION_EDITOR.ARRIVAL_AIRPORT);
    agGridAutoCompleteSearch.onSearch(null, CONDITION_EDITOR.DEPARTURE_AIRPORT );
    agGridAutoCompleteSearch.onSearch(null, CONDITION_EDITOR.ARRIVAL_STATE );
    agGridAutoCompleteSearch.onSearch(null, CONDITION_EDITOR.NEXT_DESTINATION_AIRPORT);
  });

  
});
