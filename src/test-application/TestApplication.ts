export class TestItem {
  item_id: number
  item: any
}

export class TestAsJson {
  name: string
  items: TestItem[]
}

export class UrlToSendResponses {
  method: string
  url: string
  help: string
  responseClass: string
}

export class UrlToSendProgress {
  method: string
  url: string
  help: string
}

export class PreparedParticipation {

  participationId: number
  lastVisitedItemId: number
  testAsJson: TestAsJson
  urlToSendResponses: UrlToSendResponses
  urlToSendProgress: UrlToSendProgress

}
