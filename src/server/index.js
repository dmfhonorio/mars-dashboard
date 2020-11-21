require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

const createEndpoint = (path) => {
  const BASE_NASA_API = "https://api.nasa.gov/mars-photos/api/v1";
  return `${BASE_NASA_API}${path}api_key=${process.env.API_KEY}`;
}

app.get('/rovers', async (req, res) => {
  try {
    await fetch(createEndpoint("/rovers?"))
      .then(res => res.json())
      .then(rovers => res.send(rovers.rovers));
  } catch (err) {
    res.status(500).json({ error: 'error fetching rovers from NASA API'})
  }
})

app.get('/rovers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    await fetch(createEndpoint(`/rovers/${id}/photos?earth_date=${date}&`))
      .then(res => res.json())
      .then(rover => res.send(rover.photos));
  } catch (err) {
    res.status(500).json({ error: `error fetching rover ${id} from NASA API`})
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))