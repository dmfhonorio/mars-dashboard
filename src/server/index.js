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
    const rovers = await fetch(createEndpoint("/rovers?"))
      .then(res => res.json())
      .then(rovers => res.send(rovers.rovers));
    // res.send(rovers);
  } catch (err) {
    console.log(err);
  }
})

app.get('/rovers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    await fetch(createEndpoint(`/rovers/${id}/photos?earth_date=${date}&`))
      .then(res => res.json())
      .then(rover => res.send(rover.photos));
    // res.send(rovers);
  } catch (err) {
    console.log(err);
  }
})

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))