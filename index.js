window.addEventListener('load', async () => {
  let puppets = await browser.storage.local.get('puppets')
  if (puppets && puppets.puppets) {
    if (document.querySelector('#puppets')) {
      document.querySelector('#puppets').value = JSON.parse(puppets.puppets)
    }
  }
  if (document.querySelector('#puppetsform')) {
    document.querySelector('input').focus()
    document.querySelector('#puppetsform').addEventListener('submit', async e => {
      e.preventDefault()
      await browser.storage.local.set({ puppets: JSON.stringify(document.querySelector('#puppets').value) })
    })

    const filterable = puppets.puppets
      ? JSON.parse(puppets.puppets)
          .split('\n')
          .map(puppet => puppet.toLowerCase().replaceAll(' ', '_'))
      : []

    let match = ''
    populateDatalist()

    document.querySelector('input').addEventListener('input', async e => {
      const inputValue = e.target.value.toLowerCase().replace(' ', '_')
      match = filterable.filter(puppet => puppet.includes(inputValue))[0]
      populateDatalist()
    })

    function populateDatalist() {
      const datalist = document.getElementById('puppetlist')
      datalist.innerHTML = ''
      filterable.forEach(puppet => {
        const option = document.createElement('option')
        option.value = puppet
        datalist.appendChild(option)
      })
    }

    document.addEventListener('keypress', async event => {
      if (event.key === 'Enter' && match) {
        const url = `https://nationstates.net/nation=${match}`
        window.open(url, '_blank')
      }
    })
  }
})
