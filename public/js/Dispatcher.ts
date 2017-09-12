import { Dispatcher } from 'flux';
import { Action } from './actions/Action';

class CustomDispatcher extends Dispatcher<Action> {
    static dispatcher: CustomDispatcher = new CustomDispatcher();
}

export default CustomDispatcher;