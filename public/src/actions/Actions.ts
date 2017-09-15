import * as CustomDispatcher from '../Dispatcher';
import { NotificationAction } from './NotificationAction';
import { ErrorAction } from './ErrorAction';
import { FileAction } from './FileAction';
import * as ActionTypes from '../ActionTypes';

let Actions = {
    showMessage: function (message: string) {
        CustomDispatcher.default.dispatcher.dispatch(new NotificationAction(message));
    },
    showError: function (error: string) {
        CustomDispatcher.default.dispatcher.dispatch(new ErrorAction(error));
    },
    toggleFileOperation: function () {
        CustomDispatcher.default.dispatcher.dispatch(new FileAction());
    }
}
export { Actions };