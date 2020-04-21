export interface HtmlPdfAccess {
    savePdfBuffer(pdfBuffer: Buffer, htmlPdfId: string): Promise<string>
    saveHtmlPdf(htmlPdf: HtmlPdfItem): Promise<HtmlPdfItem>
    getAllHtmlPdfs(userId: string): Promise<HtmlPdfItem[]>
}

import * as AWS  from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {Types} from 'aws-sdk/clients/s3'

const XAWS = AWSXRay.captureAWS(AWS)

import { HtmlPdfItem } from '../models/HtmlPdfItem'

export class HtmlPdfDataAccess implements HtmlPdfAccess{
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly htmlPdfTable = process.env.HTML_PDF_TABLE,
        private readonly s3: Types = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.HTML_PDF_S3_BUCKET
    ){}

    async savePdfBuffer(pdfBuffer: Buffer, htmlPdfId: string): Promise<string> {

        console.log(`Saving converted pdf buffer to S3 bucket: ${this.bucketName} for id: ${htmlPdfId}`)
        
                
        await this.s3
            .putObject({
                Bucket: this.bucketName,
                Key: `${htmlPdfId}.pdf`,
                Body: pdfBuffer
            })
            .promise()

        const pdfUrl: string = `https://${this.bucketName}.s3.amazonaws.com/${htmlPdfId}.pdf`

        return pdfUrl as string
    }



    async saveHtmlPdf(htmPdf: HtmlPdfItem): Promise<HtmlPdfItem> {
        console.log(`Saving new htmlPdf item with id ${htmPdf.htmlPdfId}`)

        const params = {
            TableName: this.htmlPdfTable,
            Item: htmPdf
        }

        await this.docClient.put(params).promise()

        return htmPdf as HtmlPdfItem
    }

    async getAllHtmlPdfs(userId: string): Promise<HtmlPdfItem[]> {
        console.log('Getting all htmlPdfs')

        const params = {
            TableName: this.htmlPdfTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }

        const result = await this.docClient.query(params).promise()

        const todos = result.Items
        return todos as HtmlPdfItem[]
    }
} 

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE){
        console.log('Creating a local dynamodb instance')

        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}