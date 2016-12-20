
import * as appRoot from "app-root-path"
import * as Promise from "bluebird"
import * as Fs from "fs"
import * as Path from "path"
import * as Lodash from "lodash"
//
import { Cellpack, Connection, Response } from "microb"
//
import { Controller } from "./Controller"
import { ControllerError } from "./ControllerError"

export default class CellpackController extends Cellpack {

    private controllers: { [key: string]: Controller } = {}

    init(): Promise<void> {
        // load all controllers
        return new Promise<void>((resolve, reject) => {
            Fs.readdir(`${appRoot}/lib/controllers`, (err, files) => {
                files.forEach((file: string, index: number, arr: Array<string>) => {
                    let basename = Path.basename(file,".js")
                    let controllermodule = require(`${appRoot}/lib/controllers/${basename}`)


                    this.controllers[basename] = new (controllermodule.default)()

                    // console.log(controllermodule.default)
                    // this.controllers[file] = new (controllermodule.default)()
                })
                resolve()
            })
        })
    }

    request(connection: Connection): Promise<boolean> {
        let route = connection.environment.get('route')
        let actionName = "404"
        let controller: any

        if(route === undefined){
            if(this.environment.get("debug")) this.transmitter.emit("log.cellpack.controller",`Unknown route`)
            if(this.controllers["error"] instanceof Controller){
                if(this.environment.get("debug")) this.transmitter.emit("log.cellpack.controller",`Found user error controller`)
                controller = <any>this.controllers["error"]
            } else {
                if(this.environment.get("debug")) this.transmitter.emit("log.cellpack.controller",`Using internal error controller`)
                controller = new ControllerError()
            }
        } else {
            if(this.environment.get("debug")) this.transmitter.emit("log.cellpack.controller",`Route found!`)
            let controllerName = route.options.get('controller')
            actionName = route.options.get('action')
            controller = <any>this.controllers[controllerName] // REWRITE becase <any> >:()
        }

        // let controllerDummy = new Controller()
        // controllerDummy.setConnection(connection)

        // add useful controller variables
        controller.setConnection(connection)

        return new Promise<void | string | Response>((resolve, reject) => {
            resolve(controller[actionName].call(controller, connection)) // controllerDummy
        }).then<boolean>((ret: void | string | Response) => { // void | string | Response
            if(Lodash.isString(ret)){
                if(this.environment.get("debug")) this.transmitter.emit("log.cellpack.controller",`String response detected.`)
                connection.response.data = ret
            } else if(ret instanceof Response){
                if(this.environment.get("debug")) this.transmitter.emit("log.cellpack.controller",`Deep copy response: ${ret}`)
                connection.response.deepCopy(ret)
            } else {
                if(this.environment.get("debug")) this.transmitter.emit("log.cellpack.controller",`Void response`)
            }

            return true
        }).catch((err) => {
            if(this.environment.get("debug")) this.transmitter.emit("log.cellpack.controller",`Error: ${err}`)
        })

    }

}
