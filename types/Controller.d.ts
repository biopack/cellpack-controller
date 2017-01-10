/// <reference types="bluebird" />
import * as Promise from "bluebird";
import { Connection, Response, Environment, Microb } from "microb";
export declare class Controller {
    private connection;
    private microb;
    protected environment: Environment;
    setConnection(connection: Connection): void;
    setMicrob(microb: Microb): void;
    protected getCellpack(name: string): null | any;
    protected render(template: string, data: Object): Response;
    protected preAction(connection: Connection): Promise<void>;
    init(): Promise<void>;
}
