const express = require('express')
const bodyParse = require('body-parser')
const { join } = require('path')

const app = express()

// makes sure app accepts application/json
// and application/x-www-form-urlencoded
app.use(bodyParse.json())
app.use(bodyParse.urlencoded({ extended: false}))

// serves static files
app.use(express.static(join(__dirname, './client/public')))

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, './client/index.html'))
})


const port = process.env.PORT || 8081
app.listen(port, () => {
    console.log(`app is running on port ${port}`)
})