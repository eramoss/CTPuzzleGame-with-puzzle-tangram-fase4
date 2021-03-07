export class Participation {
  id: number
  lastVisitedItemId: number
  application: TestApplication
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

export default class TestApplication {
  test: Test
}
