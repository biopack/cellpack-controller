/// <reference types="bluebird" />
import * as Promise from "bluebird";
import { Cellpack, Connection } from "microb";
export default class CellpackController extends Cellpack {
    private controllers;
    init(): Promise<void>;
    request(connection: Connection): Promise<boolean>;
}
