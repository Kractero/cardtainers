const puppets = ["Wheatinsline", "Tanka", "Booslick"]
let myPort = browser.runtime.connect({ name: "port-from-cs" });

for ( let i = 0; i < puppets.length; i++) {
  let puppet = puppets[i].toLowerCase().replace(' ', '_')
  if (window.location.pathname.includes(puppet)) {
    myPort.postMessage(puppet);
    break;
  }
}