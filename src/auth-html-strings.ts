export const onAuth = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js"></script>
<script>
 window.onload = () => {
    try {
      const token = window.location.hash.split('#')[1]
    axios.post('http://localhost:3000/token',{token})
    .then(data => window.close())
    .catch(e => console.error(e))
    } catch(e){
      consoe.error(e)
    }
 }
</script>
`
