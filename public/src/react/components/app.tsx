import * as React from "react";
import * as ReactDOM from "react-dom";
import InstalledDumpInfo from "./InstalledDumpInfo";
import ConfigPanel from "./ConfigPanel";
import Buttons from "./Buttons";
import * as NotificationSystem from "react-notification-system";
import { ActionStore } from '../../ActionStore';
import * as ActionTypes from '../../ActionTypes';

class App extends React.Component<any, any> {

    _notificationSystem: any;

    constructor() {
        super();
        this.state = {
            store: ActionStore.actionStore
        };
    }

    componentDidMount() {
        let component = this;
        this._notificationSystem = this.refs.notificationSystem;
        this.state.store.addListener(ActionTypes.default.NOTIFICATION, function (data: any) {
            component.addNotification(data);
        })
        this.state.store.addListener(ActionTypes.default.ERROR, function (data: any) {
            component.addError(data);
        })
    }

    addNotification(message: string) {
        this._notificationSystem.addNotification({
            message: message,
            level: 'info'
        });
    }

    addError(error: string) {
        this._notificationSystem.addNotification({
            message: error,
            level: 'error'
        });
    }

    render() {
        return <div>
            <InstalledDumpInfo />
            <ConfigPanel />
            <Buttons />
            <NotificationSystem ref="notificationSystem" />
        </div>
    }

}

ReactDOM.render(
    <App />,
    document.getElementById("root")
);

export default App;