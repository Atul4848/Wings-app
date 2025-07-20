import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { FlightPlanViewInputControls } from '../Component';

describe('Flight Plan View Input Controls', () => {
    let wrapper: ShallowWrapper;

    const props = {
        isEditable: true,
        onGetField: sinon.spy(),
        groupInputControls: {
            title: 'TEST',
            inputControls: [
                {
                    fieldKey: 'format',
                    type: EDITOR_TYPES.TEXT_FIELD,
                },
                {
                    fieldKey: 'builtBy',
                    type: EDITOR_TYPES.TEXT_FIELD,
                },
            ],
        },
        onValueChange: sinon.spy(),
        onButtonClick: sinon.spy(),
        isFpfStatusOpen:false
    };

    beforeEach(() => {
        wrapper = shallow(<FlightPlanViewInputControls {...props} />);
    });

    it('should be rendered without errors', () => {
        expect(wrapper).to.be.ok;
    });

    it('should call on value change', () => {
        wrapper.find(ViewInputControl).at(0).simulate('valueChange');
        expect(props.onValueChange.called).to.be.true;
    });
});
