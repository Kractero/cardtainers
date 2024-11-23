const colors = ['blue', 'turquoise', 'green', 'yellow', 'orange', 'red', 'pink', 'purple']
const icons = [
  'fingerprint',
  'briefcase',
  'dollar',
  'cart',
  'circle',
  'gift',
  'vacation',
  'food',
  'fruit',
  'pet',
  'tree',
  'chill',
  'fence',
]
let puppetsCache = null

async function getPuppets() {
  if (puppetsCache) return puppetsCache
  const storedPuppets = await browser.storage.local.get('puppets')
  if (storedPuppets && storedPuppets.puppets) {
    puppetsCache = JSON.parse(storedPuppets.puppets).split('\n')
  }
  return puppetsCache
}

browser.storage.onChanged.addListener(async () => {
  puppetsCache = null
  await getPuppets()
})

browser.webRequest.onBeforeRequest.addListener(
  async function (request) {
    let puppets = await getPuppets()
    let url = request.url
    if (url.includes('nation') || url.includes('container')) {
      const parameter = () => {
        const parsedURL = new URL(url)
        const pathname = parsedURL.pathname
        const match = pathname.match(/(?:^|\/)(container|nation)=([^/]+)/)
        return match ? match[2] : null
      }
      const index = puppets.findIndex(
        puppet => puppet.toLowerCase().replaceAll(' ', '_') === parameter().toLowerCase().replaceAll('%20', '_')
      )
      if (index !== -1) {
        const cookieStoreId = await createContainer(puppets[index])
        if (request.cookieStoreId === cookieStoreId) return
        await createNewTabInContainer(url, cookieStoreId, request.tabId)
        return { cancel: true }
      }
    }
    return {}
  },
  { urls: ['*://*.nationstates.net/*'], types: ['main_frame'] },
  ['blocking']
)

async function createContainer(name) {
  try {
    const find = await browser.contextualIdentities.query({ name })
    if (find.length === 0) {
      const randomIcon = icons[Math.floor(Math.random() * icons.length)]
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      const container = await browser.contextualIdentities.create({
        name,
        icon: randomIcon,
        color: randomColor,
      })
      return container.cookieStoreId
    } else {
      return find[0].cookieStoreId
    }
  } catch (error) {
    console.error('Error creating or finding contextual identity:', error)
    throw error
  }
}

async function createNewTabInContainer(url, cookieStoreId, originalTabId) {
  try {
    let tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const originalTab = await browser.tabs.get(originalTabId)
    await browser.tabs.create({
      url,
      cookieStoreId,
      index: originalTab.index,
      active: tabs[0] && tabs[0].index == originalTab.index ? true : false,
    })
    await browser.tabs.remove(originalTabId)
  } catch (error) {
    console.error('Error creating tab:', error)
    throw error
  }
}
