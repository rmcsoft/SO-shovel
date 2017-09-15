
import * as React from "react";
import axios from "axios";
import * as NProgress from "nprogress";
import { ActionStore } from '../../ActionStore';
import * as ActionTypes from '../../ActionTypes';
import { Actions } from '../../actions/Actions';

class UpdateSoUserDumpButton extends React.Component<any, any> {

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

    updateSoUserDump() {
        NProgress.start();
        Actions.toggleFileOperation();
        axios.get('/api/users/update').then(function (response: any) {
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

        return <button id="updateSoUserDumpBtn" disabled={this.state.disabled} onClick={this.updateSoUserDump} type="button" className="btn btn-primary">
            Update SO user dump
                        <i className="fa fa-refresh" aria-hidden="true"></i>
        </button>;

    }
}

export default UpdateSoUserDumpButton;