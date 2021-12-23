import { TOGGLE_LOGOUTTOGGLE , SELECT_CHAT_ROOM, TOGGLE_MOBILE_AND_CHAT_SELECTED } from '../constants/action-types.js';

const initialState = {
    logoutDialogOpen: false,
    selectedChatRoom: {},
    isMobileAndChatClicked: false,
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
        case TOGGLE_MOBILE_AND_CHAT_SELECTED:
            return {
                ...state,
                isMobileAndChatClicked: !state.isMobileAndChatClicked
            }
        default:
            break;
    }
    return state;
};

export default rootReducer;