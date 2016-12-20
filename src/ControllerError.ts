import { Connection, Response } from "microb"
//
import { Controller } from "./Controller"

export class ControllerError extends Controller {
    404(connection: Connection){

        console.log('METHOD 404')

        return new Response(404,"Error 404.")
    }
}
