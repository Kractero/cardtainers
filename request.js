const puppetsList = browser.storage.local.get("puppets")

browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        let puppets = await browser.storage.local.get("puppets")
        if (puppetsList) {
            puppets = JSON.parse(puppets.puppets).split('\n').map(puppet => puppet.toLowerCase().replace(" ", "_"))
        }
        let url = details.url;
        if (url.includes("nation") || url.includes("container")) {
            const parameter = () => {
                const parsedURL = new URL(url);
                const pathname = parsedURL.pathname;
                const segments = pathname.split('/').filter(segment => segment !== '');
                const parameters = {};
                for (const segment of segments) {
                    const [key, value] = segment.split('=');
                    if (key && value) {
                    parameters[key] = value;
                    }
                }
                return parameters.container || parameters.nation
            }
            if (puppets.includes(parameter())) {
                const cookieStoreId = await createContainer(parameter());
                if (details.cookieStoreId === cookieStoreId) return;
                await createNewTabInContainer(url, cookieStoreId );
                return {};
            }
        }
      return {};
    },
    { urls: ["<all_urls>"], types: ['main_frame'] },
    ["blocking"]
  );

async function createContainer(name) {
    try {
      const find = await browser.contextualIdentities.query({ name });
      if (find.length === 0) {
        const lass= await browser.contextualIdentities.create({
            name,
            icon: "fingerprint",
            color: "pink",
          })
        return lass.cookieStoreId;
      } else {
        return find[0].cookieStoreId;
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