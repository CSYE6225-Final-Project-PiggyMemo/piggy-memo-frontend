/**
 * Enum type to define message type
*/
export enum registraInfoType {
    EMPTY,
    VALIDATING,
    WARNING,
    AVAILABLE
};

/**
 * Interface to bind message type with each message.
 * message: The actual message.
 * type: The type of the information.
*/
export interface Info {
    message: string,
    type: registraInfoType
}

/**
 * Validate all information provided by the user
 * @param list Including messages of username, password, and their corresponding types
 * @returns True if all information is valid, false otherwise.
 */
export function allValid(list: Info[]) {
    for (const i of list) {
        if (i.type != registraInfoType.AVAILABLE) return false;
    }
    return true;
}