export class Participation {
  id: number
  lastVisitedItemId: number
  application: TestApplication
  testAsJson: string
}

export class Item {
  id: string
}

export class TestItem {
  item: Item
}

export class Test {
  items: TestItem[]
}

export class UrlToSendResponseHelper {
  method: string
  url: string
  help: string
  responseClass: string
}

export class PreparedParticipation {

  testAsJson: string
  urlToSendResponses: UrlToSendResponseHelper

}

export default class TestApplication {
  test: Test
}
