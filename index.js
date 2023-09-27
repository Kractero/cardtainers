let nsPuppetShow;

async function createContainer(name) {
  try {
    const find = await browser.contextualIdentities.query({ name });
    if (find.length === 0) {
      return await browser.contextualIdentities.create({
        name,
        icon: "fingerprint",
        color: "pink",
      });
    } else {
      return find[0];
    }
  } catch (error) {
    console.error("Error creating or finding contextual identity:", error);
    throw error;
  }
}

async function createNewTabInContainer(url, cookieStoreId) {
  try {
    const activeTab = (await browser.tabs.query({ active: true }))[0];
    if (activeTab && activeTab.cookieStoreId === cookieStoreId) {
      return;
    }
    await browser.tabs.remove(activeTab.id)
    await browser.tabs.create({ url, cookieStoreId });
  } catch (error) {
    console.error("Error creating tab:", error);
    throw error;
  }
}

function connected(p) {
  nsPuppetShow = p;
  nsPuppetShow.postMessage({ greeting: "hi there content script!" });
  nsPuppetShow.onMessage.addListener(async (message) => {
    const name = message;
    const activeTab = (await browser.tabs.query({ active: true }))[0];

    if (activeTab) {
      try {
        const contextualIdentity = await createContainer(name);
        await createNewTabInContainer(activeTab.url, contextualIdentity.cookieStoreId);
      } catch (error) {
        console.error("Error handling message:", error);
      }
    }
  });
}

browser.runtime.onConnect.addListener(connected);