import { TOGGLE_LOGOUTTOGGLE , SELECT_CHAT_ROOM} from '../constants/action-types.js';

const initialState = {
    logoutDialogOpen: false,
    selectedChatRoom: {},
};

function rootReducer(state = initialState, action) {
    switch(action.type) {
        case TOGGLE_LOGOUTTOGGLE:
            return {
                ...state,
                logoutDialogOpen: !state.logoutDialogOpen
            }
        case SELECT_CHAT_ROOM:
            return {
                ...state,
                selectedChatRoom: action.payload
            }
        default:
            break;
    }
    return state;
};

export default rootReducer;