import { apiEndpoint } from '../config'
//import { Todo } from '../types/Todo';
//import { CreateTodoRequest } from '../types/CreateTodoRequest';
import Axios from 'axios'
//import { UpdateTodoRequest } from '../types/UpdateTodoRequest';
import { CreateHtmlPdfRequest } from '../types/CreateHtmlPdfRequest';
import { HtmlPdf } from '../types/HtmlPdf';
import { UpdateHtmlPdfRequest } from '../types/UpdateHtmlPdfRequest';

export async function getHtmlPdfs(idToken: string): Promise<HtmlPdf[]> {
  console.log('Fetching htmlpdfs')

  const response = await Axios.get(`${apiEndpoint}/htmlpdf`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('HtmlPdfs:', response.data)
  return response.data.items
}

export async function getHtmlPdf(idToken: string, htmlPdfId: string): Promise<HtmlPdf> {
  console.log('Fetching HtmlPdf')
  const response = await Axios.get(`${apiEndpoint}/htmlpdf/${htmlPdfId}`,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })

  return response.data.item
}

export async function createHtmlPdf(
  idToken: string,
  newHtmlPdf: CreateHtmlPdfRequest
): Promise<HtmlPdf> {
  const response = await Axios.post(`${apiEndpoint}/htmlpdf`,  JSON.stringify(newHtmlPdf), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchHtmlPdf(
  idToken: string,
  htmlPdfId: string,
  updatedHtmlPdf: UpdateHtmlPdfRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/htmlpdf/${htmlPdfId}`, JSON.stringify(updatedHtmlPdf), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteHtmlPdf(
  idToken: string,
  htmlPdfId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/htmlpdf/${htmlPdfId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/todos/${todoId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
