import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'

import { HtmlPdfService, HtmlPdfConvertService } from '../../businessLogic/htmlPdfService'

const htmlPdfService: HtmlPdfService = new HtmlPdfConvertService()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ', event)
    const htmlPdfId = event.pathParameters.htmlPdfId


    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const htmlPdf = await htmlPdfService.getHtmlPdfById(htmlPdfId, jwtToken)

    if (htmlPdf != null){
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                item: htmlPdf
            })
        }
    }

    return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: ''
    }
}