export interface HtmlPdfAccess {
    savePdfBuffer(pdfBuffer: Buffer, htmlPdfId: string): Promise<string>
    saveHtmlPdf(htmlPdf: HtmlPdfItem): Promise<HtmlPdfItem>
    getAllHtmlPdfs(userId: string): Promise<HtmlPdfItem[]>
    deleteHtmlPdf(htmlPdfId: string, userId: string)
    updateHtmlPdf(updatedHtmlPdf: HtmlPdfUpdate, htmlPdfId: string, userId: string): Promise<HtmlPdfUpdate>
    getHtmlPdfById(userId: string, htmlPdfId: string): Promise<HtmlPdfItem>
}

import * as AWS  from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {Types} from 'aws-sdk/clients/s3'
import { PDFDocument } from 'pdf-lib'
import * as toBuffer from 'typedarray-to-buffer'

const XAWS = AWSXRay.captureAWS(AWS)

import { HtmlPdfItem } from '../models/HtmlPdfItem'
import { HtmlPdfUpdate } from '../models/HtmlPdfUpdate'

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
            },
            ScanIndexForward: false,
        }

        const result = await this.docClient.query(params).promise()

        const htmlpdfs = result.Items
        return htmlpdfs as HtmlPdfItem[]
    }

    async deleteHtmlPdf(htmlPdfId: string, userId: string) {
        console.log(`Deleting existing htmlPdf item with id ${htmlPdfId}`)

        const params = {
            TableName: this.htmlPdfTable,
            Key: {
                "userId": userId,
                "htmlPdfId": htmlPdfId
            },
        };

        await this.docClient.delete(params).promise();

        return
    }

    async updateHtmlPdf(updateHtmlPdf: HtmlPdfUpdate, htmlPdfId: string, userId: string): Promise<HtmlPdfUpdate> {
        
        console.log(`Updating existing html item with id ${htmlPdfId}`)

        // Udpate metadata in the pdf file
        await this.processPdf(updateHtmlPdf, htmlPdfId)

        const params = {
            TableName: this.htmlPdfTable,
            Key: {
                "userId": userId,
                "htmlPdfId": htmlPdfId
            },
            UpdateExpression: "set #title = :title, #author = :author, #subject = :subject, #producer = :producer, #creator = :creator, #modificationDate = :modificationDate",
            ExpressionAttributeNames: {
                "#title": "title",
                "#author": "author",
                "#subject": "subject",
                "#producer": "producer",
                "#creator": "creator",
                "#modificationDate": "modificationDate"
            },
            ExpressionAttributeValues: {
                ":title": updateHtmlPdf['title'],
                ":author": updateHtmlPdf['author'],
                ":subject": updateHtmlPdf['subject'],
                ":producer": updateHtmlPdf['producer'],
                ":creator": updateHtmlPdf['creator'],
                ":modificationDate": updateHtmlPdf['modificationDate'].toISOString()
            },
            ReturnValues: "ALL_NEW"
        }

        const result = await this.docClient.update(params).promise()

        const attributes = result.Attributes

        return attributes as HtmlPdfUpdate

    }

    async processPdf(updateHtmlPdf: HtmlPdfUpdate, htmlPdfId: string) {
        const key = htmlPdfId+'.pdf'
        console.log('Processing S3 item with key: ', key)

        const response = await this.s3
            .getObject({
                Bucket: this.bucketName,
                Key: key
            })
            .promise()

        const body = response.Body

        const pdfDoc = await PDFDocument.load(Buffer.from(body))
        
        pdfDoc.setTitle(updateHtmlPdf.title)
        pdfDoc.setAuthor(updateHtmlPdf.author)
        pdfDoc.setSubject(updateHtmlPdf.subject)
        pdfDoc.setProducer(updateHtmlPdf.producer)
        pdfDoc.setCreator(updateHtmlPdf.creator)
        pdfDoc.setModificationDate(new Date())

        const pdfBytes = await pdfDoc.save()
        const pdfBuffer = toBuffer(pdfBytes)

        console.log(`Writing updated pdf back to S3 bucket: ${this.bucketName} with key: ${key}`)
        await this.s3
            .putObject({
                Bucket: this.bucketName,
                Key: key,
                Body: pdfBuffer
            })
            .promise()
    }

    async getHtmlPdfById(userId: string, htmlPdfId: string): Promise<HtmlPdfItem> {
        console.log(`Getting HtmlPdf by Id: ${htmlPdfId}`)

        const params = {
            TableName: this.htmlPdfTable,
            KeyConditionExpression: "#userId = :userId AND #htmlPdfId = :htmlPdfId",
            ExpressionAttributeNames: {
                "#userId": "userId",
                "#htmlPdfId": "htmlPdfId"
            },
            ExpressionAttributeValues: {
                ":userId": userId,
                ":htmlPdfId": htmlPdfId
            }
        } 

        const result = await this.docClient.query(params).promise()

        

        if (result.Count !== 0){
            const htmlpdf = result.Items[0]
            return htmlpdf as HtmlPdfItem
        }

        return null
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