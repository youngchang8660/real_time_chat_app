import { TOGGLE_LOGOUTTOGGLE } from '../constants/action-types.js';

const initialState = {
    logoutDialogOpen: false,
};

function rootReducer(state = initialState, action) {
    switch(action.type) {
        case TOGGLE_LOGOUTTOGGLE:
            return {
                ...state,
                logoutDialogOpen: !state.logoutDialogOpen
            }
        default:
            break;
    }
    return state;
};

export default rootReducer;