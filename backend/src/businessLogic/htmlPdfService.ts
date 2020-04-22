import * as uuid from 'uuid'

import { ConvertHtmlRequest } from '../requests/convertHtmlRequest'
import { UpdateHtmlPdfRequest } from '../requests/updateHtmlPdfRequest'
import { HtmlPdfItem } from '../models/HtmlPdfItem'
import { parseUserId } from '../auth/utils'
import { HtmlPdfAccess, HtmlPdfDataAccess } from '../dataLayer/htmlPdfAccess'

const htmlPdfAccess: HtmlPdfAccess = new HtmlPdfDataAccess()

export interface HtmlPdfService {
    saveHtmlPdf(newConvertRequest: ConvertHtmlRequest, pdfBuffer: Buffer, jwtToken: string): Promise<HtmlPdfItem>
    getAllHtmlPdfs(jwtToken: string): Promise<HtmlPdfItem[]>
    deleteHtmlPdf(htmlPdfId: string, jwtToken: string)
    updateHtmlPdf(updateHtmlPdf: UpdateHtmlPdfRequest, htmlPdfId: string, jwtToken: string)
    getHtmlPdfById(htmlPdfId: string, jwtToken: string): Promise<HtmlPdfItem>
}


export class HtmlPdfConvertService implements HtmlPdfService {

    public async saveHtmlPdf(newConvertRequest: ConvertHtmlRequest, pdfBuffer: Buffer, jwtToken: string): Promise<HtmlPdfItem> {
        
        const htmlPdfId = uuid.v4()
        const userId = parseUserId(jwtToken)

        const pdfUrl = await htmlPdfAccess.savePdfBuffer(pdfBuffer, htmlPdfId)

        console.log(`Converted pdf url: ${pdfUrl}`)

        return await htmlPdfAccess.saveHtmlPdf({
            userId,
            htmlPdfId,
            ...newConvertRequest,
            pdfUrl,
            timeStamp: new Date().toISOString()
        })
    }

    public async getAllHtmlPdfs(jwtToken: string): Promise<HtmlPdfItem[]> {

        const userId = parseUserId(jwtToken)

        return await htmlPdfAccess.getAllHtmlPdfs(userId)
    }

    public async deleteHtmlPdf(htmlPdfId: string, jwtToken: string) {
        const userId = parseUserId(jwtToken)
    
        await htmlPdfAccess.deleteHtmlPdf(htmlPdfId, userId)
    }

    public async updateHtmlPdf(updateHtmlPdf: UpdateHtmlPdfRequest, htmlPdfId: string, jwtToken: string) {
        const userId = parseUserId(jwtToken)
    
        return await htmlPdfAccess.updateHtmlPdf({
            ...updateHtmlPdf,
            modificationDate: new Date()
        }, htmlPdfId, userId)
    }

    public async getHtmlPdfById(htmlPdfId: string, jwtToken: string): Promise<HtmlPdfItem> {
        const userId = parseUserId(jwtToken)

        return await htmlPdfAccess.getHtmlPdfById(userId, htmlPdfId)
    }
}
