"use strict";
const microb_1 = require("microb");
const Controller_1 = require("./Controller");
class ControllerError extends Controller_1.Controller {
    404(connection) {
        console.log('METHOD 404');
        return new microb_1.Response(404, "Error 404.");
    }
}
exports.ControllerError = ControllerError;
