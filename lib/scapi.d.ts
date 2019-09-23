/// <reference types="node" />
import events from "events";
import { SCError } from "./Errors";
import Logger from "./utils/logger";
interface RequestHandler {
    resolve: (result: any) => void;
    reject: (error: SCError) => void;
}
interface RequestHandlers {
    [guid: string]: RequestHandler;
}
export default class SCAPI extends events.EventEmitter {
    schost: string;
    scport: number;
    requests: RequestHandlers;
    log: Logger;
    udp: any;
    constructor(schost?: string, scport?: number);
    connect(): void;
    disconnect(): void;
    call(requestId: any, oscpath: any, args: any, ok: any, err: any): Promise<unknown>;
    receive(signal: any, msg: any): void;
}
export {};
