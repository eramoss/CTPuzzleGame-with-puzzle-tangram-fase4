import { MecanicaRope } from "../ct-platform-classes/MecanicaRope";

export class TestApplication {
  name: string;
  url: string;
}

export class UrlHelper {
  method: string;
  url: string;
  help: string;
}

export class PreparedParticipation {
  test: Test;
  urlToEndOfTestQuiz: UrlHelper;
  urlToSendResponses: UrlHelper;
}

export class Test {
  items: TestItem[];
}

export class TestItem {
  id: number;
  url: string;
  item: MecanicaRope;
  hasResponse: boolean;
}
