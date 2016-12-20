import { Connection, Response } from "microb";
export declare class Controller {
    private connection;
    setConnection(connection: Connection): void;
    protected render(template: string, data: Object): Response;
}
