import { SELECT_CHAT_ROOM, TOGGLE_MOBILE_AND_CHAT_SELECTED } from "../constants/action-types";

export function selectChatRoom(payload) {
    return { type: SELECT_CHAT_ROOM, payload }
}

export function toggleMobileAndChatSelected(payload) {
    return { type: TOGGLE_MOBILE_AND_CHAT_SELECTED, payload }
}