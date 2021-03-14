import { Logger } from "../main"

async function sendRequest(url: string, json: any = null, method: string = 'GET'): Promise<Response> {
  Logger.info('Calling ' + method, url)
  let response = null
  try {
    let params = null
    if (method == 'POST' || method == 'PUT') {
      params = {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(json)
      }
    }
    response = await fetch(url, params)

    Logger.info('Status', response.status)
    //Logger.info('Body', response.body)
    //Logger.info('Text', response.text)
    Logger.info('StatusText', response.statusText)
  } catch (e) {
    Logger.error('Request failed');
    Logger.error(e);
  }
  return response
}

export function POST(url: string, json: any = null): Promise<Response> {
  return sendRequest(url, json, 'POST')
}

export function PUT(url: string, json: any): Promise<Response> {
  return sendRequest(url, json, 'PUT')
}

export function GET(url: string): Promise<Response> {
  return sendRequest(url)
}
