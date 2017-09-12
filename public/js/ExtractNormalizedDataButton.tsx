
import * as React from "react";
import axios from "axios";
import * as NProgress from "nprogress";
import { ActionStore } from './ActionStore';
import * as ActionTypes from './ActionTypes';
import { Actions } from './actions/Actions';

class ExtractNormalizedDataButton extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {
            disabled: false,
            store: ActionStore.actionStore
        };
    }

    componentDidMount() {
        let component = this;
        this.state.store.addListener(ActionTypes.default.FILE_OPERATION_TOGGLED, function (data: any) {
            let componentState = component.state;
            componentState.disabled = !componentState.disabled;
            component.setState(componentState);
        })
    }

    extractNormalizedData() {

        NProgress.start();
        Actions.toggleFileOperation();

        axios.get('/api/write-csv').then(function (response: any) {
            Actions.showMessage(response.data.toString());
            Actions.toggleFileOperation();
            NProgress.done();
        }).catch(function (error: any) {
            Actions.showError(error.toString());
            Actions.toggleFileOperation();
            NProgress.done();
        });
    }

    render() {

        return <button disabled={this.state.disabled} onClick={this.extractNormalizedData} type="button" className="btn btn-primary">
            Extract normalized data
                    </button>;

    }
}

export default ExtractNormalizedDataButton;