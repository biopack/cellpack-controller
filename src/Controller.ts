import * as Lodash from "lodash"
//
import { Connection, Response } from "microb"

export class Controller {

    private connection: Connection

    setConnection(connection: Connection){
        this.connection = connection
    }

    protected render(template: string, data: Object): Response {

        // let response = new Response()

        let existedData = this.connection.environment.get('template.data',{})

        this.connection.environment.set('template', template)
        this.connection.environment.set('template.data', Lodash.merge(data,existedData))

        return this.connection.response
    }
}
