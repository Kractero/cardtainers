const colors = ["blue", "turquoise", "green", "yellow", "orange", "red", "pink", "purple"];
const icons = ["fingerprint", "briefcase", "dollar", "cart", "circle", "gift", "vacation", "food", "fruit", "pet", "tree", "chill", "fence"];

browser.webRequest.onBeforeRequest.addListener(
    async function (request) {
        let puppets = await browser.storage.local.get("puppets");
        if (puppets && puppets.puppets) {
            puppets = JSON.parse(puppets.puppets).split('\n');
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
                return parameters.container || parameters.nation;
            };
            const index = puppets.findIndex((puppet) => puppet.toLowerCase().replaceAll(" ", "_") === parameter());
            if (index !== -1) {
                const cookieStoreId = await createContainer(puppets[index]);
                if (request.cookieStoreId === cookieStoreId) return;
                await createNewTabInContainer(url, cookieStoreId, request.tabId);
                return { cancel: true };
            }
        }
        return {};
    },
    { urls: ["*://*.nationstates.net/*"], types: ['main_frame'] },
    ["blocking"]
);

async function createContainer(name) {
    try {
        const find = await browser.contextualIdentities.query({ name });
        if (find.length === 0) {
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const container = await browser.contextualIdentities.create({
                name,
                icon: randomIcon,
                color: randomColor,
            });
            return container.cookieStoreId;
        } else {
            return find[0].cookieStoreId;
        }
    } catch (error) {
        console.error("Error creating or finding contextual identity:", error);
        throw error;
    }
}

async function createNewTabInContainer(url, cookieStoreId, originalTabId) {
    try {
        const originalTab = await browser.tabs.get(originalTabId);
        await browser.tabs.create({
            url,
            cookieStoreId,
            index: originalTab.index,
            active: false
        });
        await browser.tabs.remove(originalTabId);
    } catch (error) {
        console.error("Error creating tab:", error);
        throw error;
    }
}
