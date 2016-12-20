"use strict";
const Lodash = require("lodash");
class Controller {
    setConnection(connection) {
        this.connection = connection;
    }
    render(template, data) {
        let existedData = this.connection.environment.get('template.data', {});
        this.connection.environment.set('template', template);
        this.connection.environment.set('template.data', Lodash.merge(data, existedData));
        return this.connection.response;
    }
}
exports.Controller = Controller;
