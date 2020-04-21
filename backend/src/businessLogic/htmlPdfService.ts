import * as uuid from 'uuid'
import * as chromium from 'chrome-aws-lambda'
import * as puppeteer from 'puppeteer-core'

import { ConvertHtmlRequest } from '../requests/convertHtmlRequest'
import { HtmlPdfItem } from '../models/HtmlPdfItem'
import { parseUserId } from '../auth/utils'
import { HtmlPdfAccess, HtmlPdfDataAccess } from '../dataLayer/htmlPdfAccess'

const htmlPdfAccess: HtmlPdfAccess = new HtmlPdfDataAccess()

export interface HtmlPdfService {
    generatePdf(newConvertRequest: ConvertHtmlRequest): Promise<Buffer>
    saveHtmlPdf(newConvertRequest: ConvertHtmlRequest, pdfBuffer: Buffer, jwtToken: string)
}


export class HtmlPdfConvertService implements HtmlPdfService {

    public async generatePdf(newConvertRequest: ConvertHtmlRequest): Promise<Buffer> {
        
        const url = newConvertRequest.url

        console.log(`Generating PDF for ${url}`);
    
        let browser = null;
        try {
          browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
          });
    
          const page = await browser.newPage();
    
          await page.goto(url, {
            waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
          });
          const result = await page.pdf({
            printBackground: true,
            format: 'A4',
            displayHeaderFooter: true,
            footerTemplate: `
            <div style="font-size:10px; margin-left:20px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
            `,
            margin: {
              top: '20px',
              right: '20px',
              bottom: '50px',
              left: '20px',
            },
          });
          console.log(`buffer size = ${result.length}`);
          return result;
        } catch (error) {
          console.log(`Failed to PDF url ${url} Error: ${JSON.stringify(error)}`);
        } finally {
          if (browser !== null) {
            await browser.close();
          }
        }
    }

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
}
