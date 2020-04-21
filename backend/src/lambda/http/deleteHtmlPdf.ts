import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { HtmlPdfService, HtmlPdfConvertService } from '../../businessLogic/htmlPdfService'

const htmlPdfService: HtmlPdfService = new HtmlPdfConvertService()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const htmlPdfId = event.pathParameters.htmlPdfId

  // TODO: Remove a TODO item by id
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  await htmlPdfService.deleteHtmlPdf(htmlPdfId, jwtToken)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin' : '*'
    },
    body: null
  }
}
