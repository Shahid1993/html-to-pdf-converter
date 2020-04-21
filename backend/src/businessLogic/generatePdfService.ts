export interface GeneratePdfService {
    generatePdf(newConvertRequest: ConvertHtmlRequest): Promise<Buffer>
}


import * as chromium from 'chrome-aws-lambda'
import * as puppeteer from 'puppeteer-core'

import { ConvertHtmlRequest } from '../requests/convertHtmlRequest'


export class GenerateHtmlPdfService implements GeneratePdfService {    

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
}