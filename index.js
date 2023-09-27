window.addEventListener('load', async () => {
  let puppets = await browser.storage.local.get("puppets")
  if (puppets) {
    document.querySelector('#puppets').value = JSON.parse(puppets.puppets)
  }
  document.querySelector('#puppetsform').addEventListener('submit',  async (e) => {
    e.preventDefault()
    await browser.storage.local.set({"puppets": JSON.stringify(document.querySelector('#puppets').value)})
  })
});