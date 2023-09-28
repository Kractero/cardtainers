const colors = ["blue", "turquoise", "green", "yellow", "orange", "red", "pink", "purple", "toolbar"];
const icons = ["fingerprint", "briefcase", "dollar", "cart", "circle", "gift", "vacation", "food", "fruit", "pet", "tree", "chill", "fence"];

browser.webRequest.onBeforeRequest.addListener(
    async function (request) {
        let puppets = await browser.storage.local.get("puppets")
        if (puppets && puppets.puppets) {
            puppets = JSON.parse(puppets.puppets).split('\n')
        }
        let url = request.url;
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
            const index = puppets.findIndex((puppet) => puppet.toLowerCase().replaceAll(" ", "_") === parameter());
            if (index !== -1) {
              const cookieStoreId = await createContainer(puppets[index]);
              if (request.cookieStoreId === cookieStoreId) return;
              await createNewTabInContainer(url, cookieStoreId );
              return {};
            }
        }
      return {};
    },
    { urls: ["*://www.nationstates.net/*"], types: ['main_frame'] },
    ["blocking"]
  );

async function createContainer(name) {
    try {
      const find = await browser.contextualIdentities.query({ name });
      if (find.length === 0) {
        const randomIcon = icons[Math.floor(Math.random() * icons.length)]
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const container= await browser.contextualIdentities.create({
            name,
            icon: randomIcon,
            color: randomColor,
          })
        return container.cookieStoreId;
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
      await browser.tabs.create({ url, cookieStoreId });
      await browser.tabs.remove(activeTab.id)
    } catch (error) {
      console.error("Error creating tab:", error);
      throw error;
    }
  }