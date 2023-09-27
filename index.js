const puppets = ["Wheatinsline", "Tanka"]

document.querySelector('#test').addEventListener('click', async () => {
    browser.tabs.query({ currentWindow: true }).then((tabs) => {
        for (const tab of tabs) {
          if (tab.active) {
            if (tab.url.includes("/nation=wheatinsline")) {
                console.log("WHEAT DETECTED!")
            }
          }
        }
      });
    const contextualIdentity = await browser.contextualIdentities.create({
        name: "Sombra",
        icon: "fingerprint",
        color: "pink",
    });
    console.log(contextualIdentity)
})