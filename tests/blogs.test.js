const Page = require('./helpers/page')
let page

beforeEach(async () => {
  page = await Page.build()
  await page.goto('http://localhost:3000')
})

afterEach(async () => {
  await page.close()
})

describe('When Logged In', async () => {
  beforeEach(async () => {
    await page.login()
    await page.click('a[href="/blogs/new"]')
  })

  test('Can see blog create form', async () => {
    const label = await page.getContentsOf('form label')
    expect(label).toEqual('Blog Title')
  })

  describe('And Using Valid Inputs', () => {
    let sampleTitle = 'Test Blog'
    let sampleContent = 'Sample Content For Blog'
    beforeEach(async () => {
      await page.type('.title input[name="title"]', sampleTitle)
      await page.type('.content input[name="content"]', sampleContent)
      await page.click('button[type="submit"]')
      await page.waitFor('form h5')
    })
    test('submitting takes user to review screen', async () => {
      const confirmation = await page.getContentsOf('form h5')
      expect(confirmation).toEqual('Please confirm your entries')
    })
    test('submitting then saving adds blog to index page', async () => {
      await page.click('form button.green')
      await page.waitFor('.card')
      const expectedTitle = await page.getContentsOf('.card .card-content .card-title')
      const expectedContent = await page.getContentsOf('.card .card-content p')
      expect(expectedTitle).toEqual(sampleTitle)
      expect(expectedContent).toEqual(sampleContent)
    })
  })

  describe('And Using Invalid Inputs', () => {
    beforeEach(async () => {
      await page.click('button[type="submit"]')
    })
    test('the form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text')
      const contentError = await page.getContentsOf('.content .red-text')
      expect(titleError).toEqual('You must provide a value')
      expect(contentError).toEqual('You must provide a value')
    })
  })
})

describe('When User is Not Logged In', async () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    }, {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'T',
        content: 'C'
      }
    }
  ]
  test('blog related actions are prohibited', async () => {
    const results = await page.execRequests(actions)

    for(let result of results){
      expect(result).toEqual({error: 'You must log in!'})
    }

  })
})
