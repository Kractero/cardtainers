// const puppets = ["Wheatinsline", "Tanka"]

// console.log("loaded")
// puppets.forEach(puppet => {
//   console.log(browser.tabs.current)
// });

// document.querySelector('#test').addEventListener('click', async () => {
//     browser.tabs.query({ currentWindow: true }).then((tabs) => {
//         for (const tab of tabs) {
//           if (tab.active) {
//             if (tab.url.includes("/nation=wheatinsline")) {
//                 console.log("WHEAT DETECTED!")
//             }
//           }
//         }
//       });
//     const contextualIdentity = await browser.contextualIdentities.create({
//         name: "Container",
//         icon: "fingerprint",
//         color: "pink",
//     });
//     console.log(contextualIdentity)
// })

// browser.runtime.onMessage.addListener(notify);

// function notify(message) {
//   browser.notifications.create({
//     type: "basic",
//     iconUrl: browser.extension.getURL("link.png"),
//     title: "You clicked a link!",
//     message: message.url,
//   });
// }

let portFromCS;

function connected(p) {
  portFromCS = p;
  portFromCS.postMessage({ greeting: "hi there content script!" });
  portFromCS.onMessage.addListener(async (m) => {
    const find = await browser.contextualIdentities
      .query({
        name: m,
      }
    )
    const activeTab = await browser.tabs.query({ active: true })
    if (activeTab) {
      if (find.length === 0) {
        const contextualIdentity = await browser.contextualIdentities.create({
          name: m,
          icon: "fingerprint",
          color: "pink",
        });
        const todd = await browser.tabs.create({
          url: activeTab[0].url,
          cookieStoreId: contextualIdentity.cookieStoreId,
        });
      } else {
        const todd = await browser.tabs.create({
          url: activeTab[0].url,
          cookieStoreId: find.cookieStoreId,
        });
      }
    }
  });
}

browser.runtime.onConnect.addListener(connected);