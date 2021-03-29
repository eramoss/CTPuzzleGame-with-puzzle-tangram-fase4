export class UrlToSendProgress {
  method: string
  url: string
  help: string
}

export class UrlToSendResponses {
  method: string
  url: string
  help: string
  responseClass: string
}

export class UrlToSendUserData {
  method: string
  url: string
  help: string
}

export class UrlToEndOfTestQuiz {
  url: string
  help: 'Open in a browser'
}

export default class PreparedParticipation {

  lastVisitedItemId:number
  participationId:number
  test: string
  urlToSendResponses: UrlToSendResponses
  urlToSendProgress: UrlToSendProgress
  urlToSendUserData: UrlToSendUserData
  urlToEndOfTestQuiz: UrlToEndOfTestQuiz

}
