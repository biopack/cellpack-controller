import * as Lodash from "lodash"
import * as Promise from "bluebird"
//
import { Connection, Response, Environment, Cellpack, Microb } from "microb"

export class Controller {

    private connection: Connection
    private microb: Microb
    private environment: Environment

    setConnection(connection: Connection){
        this.connection = connection
    }

    setMicrob(microb: Microb){
        this.microb = microb
        this.environment = microb.getEnvironment()
    }

    protected getCellpack(name: string): null | any {
        // return (this.environment.get("cellpacks")[name] === undefined ? null : this.environment.get("cellpacks")[name])
        return this.microb.getCellpack(name)
    }

    protected render(template: string, data: Object): Response {

        // let response = new Response()

        let existedData = this.connection.environment.get('template.data',{})

        this.connection.environment.set('template', template)
        this.connection.environment.set('template.data', Lodash.merge(data,existedData))

        return this.connection.response
    }

    protected preAction(connection: Connection): Promise<void> {
        return Promise.resolve()
    }
}
