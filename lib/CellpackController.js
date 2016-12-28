"use strict";
const appRoot = require("app-root-path");
const Promise = require("bluebird");
const Fs = require("fs");
const Path = require("path");
const Lodash = require("lodash");
const microb_1 = require("microb");
const Controller_1 = require("./Controller");
const ControllerError_1 = require("./ControllerError");
class CellpackController extends microb_1.Cellpack {
    constructor() {
        super(...arguments);
        this.controllers = {};
    }
    init() {
        return new Promise((resolve, reject) => {
            Fs.readdir(`${appRoot}/lib/controllers`, (err, files) => {
                files.forEach((file, index, arr) => {
                    let basename = Path.basename(file, ".js");
                    let controllermodule = require(`${appRoot}/lib/controllers/${basename}`);
                    this.controllers[basename] = new (controllermodule.default)();
                });
                resolve();
            });
        });
    }
    request(connection) {
        let route = connection.environment.get('route');
        let actionName = "404";
        let controller;
        if (route === undefined) {
            if (this.environment.get("debug"))
                this.transmitter.emit("log.cellpack.controller", `Unknown route`);
            if (this.controllers["error"] instanceof Controller_1.Controller) {
                if (this.environment.get("debug"))
                    this.transmitter.emit("log.cellpack.controller", `Found user error controller`);
                controller = this.controllers["error"];
            }
            else {
                if (this.environment.get("debug"))
                    this.transmitter.emit("log.cellpack.controller", `Using internal error controller`);
                controller = new ControllerError_1.ControllerError();
            }
        }
        else {
            if (this.environment.get("debug"))
                this.transmitter.emit("log.cellpack.controller", `Route found!`);
            let controllerName = route.options.get('controller');
            actionName = route.options.get('action');
            controller = this.controllers[controllerName];
        }
        controller.setConnection(connection);
        controller.setMicrob(this.microb);
        return new Promise((resolve, reject) => {
            if (Lodash.isFunction(controller.preAction)) {
                return controller.preAction.call(controller, connection).then(() => {
                    resolve(controller[actionName].call(controller, connection));
                }).catch((err) => {
                    if (this.environment.get("debug"))
                        this.transmitter.emit("log.cellpack.controller", `preAction Error: ${err}`);
                });
            }
            else {
                resolve(controller[actionName].call(controller, connection));
            }
        }).then((ret) => {
            if (Lodash.isString(ret)) {
                if (this.environment.get("debug"))
                    this.transmitter.emit("log.cellpack.controller", `String response detected.`);
                connection.response.data = ret;
            }
            else if (ret instanceof microb_1.Response) {
                if (this.environment.get("debug"))
                    this.transmitter.emit("log.cellpack.controller", `Deep copy response: ${ret}`);
                connection.response.deepCopy(ret);
            }
            else {
                if (this.environment.get("debug"))
                    this.transmitter.emit("log.cellpack.controller", `Void response`);
            }
            return true;
        }).catch((err) => {
            if (this.environment.get("debug"))
                this.transmitter.emit("log.cellpack.controller", `Error: ${err}`);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CellpackController;
