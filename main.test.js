import a from './a.txt'
import b from './b.txt'
import c from './c.txt'
import d from './d.txt'
import e from './e.txt'
import prompts from './prompts.txt'
import main from './main'

describe('testing similarity', () => {
  const files = [a, b, c, d, e]
  const promptLines = prompts
    .trim()
    .split('\n')
    .map((item) => item.split('<')[0])

  test(() => {
    console.log(main(promptLines))
  })
})
