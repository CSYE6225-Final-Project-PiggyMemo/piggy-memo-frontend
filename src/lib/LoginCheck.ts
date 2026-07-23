//Reuse infotype and info from regcheck
import { InfoType, Info } from "./Info";

/**
 * Validate all information provided by the user
 * @param list Including messages of username, password, and their corresponding types
 * @returns True if all information is valid, false otherwise.
 */
export function allValid(list: Info[]) {
    for (const i of list) {
        if (i.type != InfoType.EMPTY) return false;
    }
    return true;
}