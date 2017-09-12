import { EventEmitter } from 'events';
import * as CustomDispatcher from './Dispatcher';
import { Action } from './actions/Action';
import { NotificationAction } from './actions/NotificationAction';
import { ErrorAction } from './actions/ErrorAction';
import { FileAction } from './actions/FileAction';
import * as ActionTypes from './ActionTypes';

class ActionStore extends EventEmitter {

    static actionStore: ActionStore = new ActionStore();

    private _message: string;

    constructor() {
        super()

        CustomDispatcher.default.dispatcher.register((action: Action) => {

            if (action instanceof NotificationAction) {
                this.emit(ActionTypes.default.NOTIFICATION, action.payload);
            }
            else if (action instanceof ErrorAction) {
                this.emit(ActionTypes.default.ERROR, action.payload);
            }
            else if (action instanceof FileAction) {
                this.emit(ActionTypes.default.FILE_OPERATION_TOGGLED);
            }
        })

    }

}

export { ActionStore };