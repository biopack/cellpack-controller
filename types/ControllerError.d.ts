import { Connection, Response } from "microb";
import { Controller } from "./Controller";
export declare class ControllerError extends Controller {
    404(connection: Connection): Response;
}
