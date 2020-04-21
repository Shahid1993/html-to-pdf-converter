import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import "source-map-support/register"

import { ConvertHtmlRequest } from '../../requests/convertHtmlRequest'
import { HtmlPdfService, HtmlPdfConvertService } from '../../businessLogic/htmlPdfService'

import { GeneratePdfService, GenerateHtmlPdfService } from '../../businessLogic/generatePdfService'

const generateHtmlPdfService: GeneratePdfService = new GenerateHtmlPdfService()
const htmlPdfService: HtmlPdfService = new HtmlPdfConvertService()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ', event)

    const newConvertReq: ConvertHtmlRequest = JSON.parse(event.body)
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const pdfBuffer = await generateHtmlPdfService.generatePdf(newConvertReq)

    const newItem = await htmlPdfService.saveHtmlPdf(newConvertReq, pdfBuffer, jwtToken)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            item: newItem
          })
    }
}