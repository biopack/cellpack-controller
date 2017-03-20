/// <reference types="bluebird" />
import * as Promise from "bluebird";
import { Connection, Response, Environment, Microb } from "microb";
export declare class Controller {
    private connection;
    protected microb: Microb;
    protected environment: Environment;
    protected action: string;
    setAction(action: string): void;
    getAction(): string;
    setConnection(connection: Connection): void;
    getConnection(): Connection;
    setMicrob(microb: Microb): void;
    protected getCellpack(name: string): null | any;
    protected render(template: string, data: Object): Response;
    protected preAction(connection: Connection): Promise<Controller>;
    init(): Promise<void>;
}
