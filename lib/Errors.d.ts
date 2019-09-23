declare class ExtendableError {
    message: string;
    stack: string;
    constructor(message: string);
}
/**
 * A custom error class that adds a data field for passing structured error data.
 */
export declare class SCError extends ExtendableError {
    data: object;
    constructor(message: string, data: object);
    /**
     * Update message and data with additional information.
     * Used when passing the error along but when you want
     * to add additional contextual debugging information.
     */
    annotate(message: string, data: object): void;
}
/**
 * SCLangError - syntax errors while interpreting code, interpret code execution errors, and asynchronous errors.
 *
 * @param type - SyntaxError | Error : Tells which format the error object will be in.
 * @param error - The error data object
 *               An Error will have a stack trace and all of the fields of the sclang error
 *               that it is generated from.
 *               SyntaxError is created by parsing the posted output of sclang.
 *
 * See SuperColliderJS-encodeError
 *
 * @param data - optional additional debug information supplied from supercollider.js
 */
export declare class SCLangError extends SCError {
    type: string;
    error: object;
    constructor(message: string, type: string, error: object, data?: any);
}
export {};
