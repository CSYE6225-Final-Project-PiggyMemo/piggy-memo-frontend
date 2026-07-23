/**
 * Enum type to define message type
*/
export enum InfoType {
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
    type: InfoType
}