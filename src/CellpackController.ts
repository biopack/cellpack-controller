
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
    private debug: boolean

    init(): Promise<void> {
        this.config = this.environment.get("cellpacks")["cellpack-controller"]

        if(this.config.debug !== undefined) this.debug = this.config.debug
        else this.config = this.environment.get('debug',false)

        // load all controllers
        return new Promise<void>((resolve, reject) => {
            Fs.readdir(`${appRoot}/lib/controllers`, (err, files) => {
                files.forEach((file: string, index: number, arr: Array<string>) => {
                    let basename = Path.basename(file,".js")
                    let controllermodule = require(`${appRoot}/lib/controllers/${basename}`)

                    this.controllers[basename] = new (controllermodule.default)()
                    this.controllers[basename].setMicrob(this.microb)
                    if(typeof this.controllers[basename].init === "function"){
                        this.controllers[basename].init()
                    }
                })
                resolve()
            })
        })
    }

    request(connection: Connection): Promise<boolean> {
        //
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
            if(this.environment.get("debug")) this.transmitter.emit("log.cellpack.controller",`Route found: ${route.name}`)
            let controllerName = route.options.get('controller')
            actionName = route.options.get('action')
            controller = <any>this.controllers[controllerName] // REWRITE becase <any> >:()
        }

        controller = Object.assign(Object.create(controller), controller)
        // add useful controller variables
        controller.setConnection(connection)
        //controller.setMicrob(this.microb)

        return new Promise<void | number | string | Response>((resolve, reject) => {

            if(Lodash.isFunction(controller.preAction)){
                return controller.preAction.call(controller, connection).then(() => { // must return promises
                    resolve(controller[actionName].call(controller, connection))
                }).catch((err: any) => {
                    if(this.debug) this.transmitter.emit("log.cellpack.controller",`preAction Error: ${err}`)
                })
            } else {
                resolve(controller[actionName].call(controller, connection))
            }

             // controllerDummy

        }).then<boolean>((ret: void | number | string | Response) => { // void | string | Response
            if(Lodash.isString(ret)){
                if(this.debug) this.transmitter.emit("log.cellpack.controller",`String response detected.`)
                connection.response.headers.set("Content-Type","text/plain")
                connection.response.data = ret
            } else if(Lodash.isNumber(ret)){
                if(this.debug) this.transmitter.emit("log.cellpack.controller",`ResponseStatus response detected.`)
                connection.response.headers.set("Content-Type","text/plain")
                connection.response.status = ret
            } else if(ret instanceof Response){
                if(this.debug) this.transmitter.emit("log.cellpack.controller",`Deep copy response: ${ret}`)
                connection.response.deepCopy(ret)
            } else {
                if(this.debug) this.transmitter.emit("log.cellpack.controller",`Void response`)
            }

            return true
        }).catch((err) => {
            if(this.debug) this.transmitter.emit("log.cellpack.controller",`Error: ${err}`)
        })

    }

}
