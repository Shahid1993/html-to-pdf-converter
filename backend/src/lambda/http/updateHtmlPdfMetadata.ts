import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateHtmlPdfRequest } from '../../requests/updateHtmlPdfRequest'
import { HtmlPdfService, HtmlPdfConvertService } from '../../businessLogic/htmlPdfService'

const htmlPdfService: HtmlPdfService = new HtmlPdfConvertService()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const htmlPdfId = event.pathParameters.htmlPdfId
  const updatedHtmlPdf: UpdateHtmlPdfRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  await htmlPdfService.updateHtmlPdf(updatedHtmlPdf, htmlPdfId, jwtToken)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin' : '*'
    },
    body: null
  }
}
