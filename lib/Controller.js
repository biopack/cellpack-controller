"use strict";
const Lodash = require("lodash");
const Promise = require("bluebird");
class Controller {
    setConnection(connection) {
        this.connection = connection;
    }
    setMicrob(microb) {
        this.microb = microb;
        this.environment = microb.getEnvironment();
    }
    getCellpack(name) {
        return this.microb.getCellpack(name);
    }
    render(template, data) {
        let existedData = this.connection.environment.get('template.data', {});
        this.connection.environment.set('template', template);
        this.connection.environment.set('template.data', Lodash.merge(data, existedData));
        return this.connection.response;
    }
    preAction(connection) {
        return Promise.resolve();
    }
    init() { return Promise.resolve(); }
}
exports.Controller = Controller;
