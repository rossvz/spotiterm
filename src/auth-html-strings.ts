export const onAuth = `
<div id="message">Authenticating...</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js"></script>
<script>
 window.onload = () => {
    try {
      const token = window.location.hash.split('#')[1]
    axios.post('http://localhost:3000/token',{token})
    .then(data => {
      window.close()
      document.getElementById('message').innerText = 'Success! You can close this page now.'
    })
    .catch(e => console.error(e))
    } catch(e){
      consoe.error(e)
    }
 }
</script>
`
