import { MecanicaRope } from "../ct-platform-classes/MecanicaRope"

export class TestApplication {
  name: string
  url: string
}

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

export class UrlToSendSource {
  method: string
  url: string
  help: string
}

export class UrlToEndOfTestQuiz {
  url: string
  help: 'Open in a browser'
}

export class PreparedParticipation {

  lastVisitedItemId: number
  participationId: number
  test: Test
  urlToSendResponses: UrlToSendResponses
  urlToSendProgress: UrlToSendProgress
  urlToSendSource: UrlToSendSource
  urlToSendUserData: UrlToSendUserData
  urlToEndOfTestQuiz: UrlToEndOfTestQuiz

}

export class Test {
  items: TestItem[]
}

export class TestItem {
  id: number
  item: MecanicaRope
}
