import { TOGGLE_LOGOUTTOGGLE, SELECT_CHAT_ROOM } from "../constants/action-types";

export function toggleLogoutDialog(payload) {
    return { type: TOGGLE_LOGOUTTOGGLE, payload }
}

export function selectChatRoom(payload) {
    return { type: SELECT_CHAT_ROOM, payload }
}