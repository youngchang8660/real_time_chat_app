import { TOGGLE_LOGOUTTOGGLE } from "../constants/action-types";

export function toggleLogoutDialog(payload) {
    return { type: TOGGLE_LOGOUTTOGGLE, payload }
}