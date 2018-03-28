const rp = require('request-promise')

const infoBip = require('../../config/infobip')

const isString = (val) => val && val.length > 1  || false
const isPhone = (val) => val && !isNaN(val) && val.toString().length > 7 || false

const validateRequest = ({message, phone, name}) => {
  if (!isString(message) || !isPhone(phone) || !isString(name)) {
    throw({
      status: 422,
      message: "All fields are required to send a sms"
    })
  }
}

const sendMessage = (body) => {
  const token =  Buffer
    .from(`${infoBip.username}:${infoBip.password}`)
    .toString('base64')

  const infoBipBody = {
    "from": body.name,
    "to": body.phone,
    "text": body.message
  }
  const headers = {
    'Content-Type': 'Application/json',
    'Authorization': `Basic ${token}`
  }
  const payload = {
    uri: infoBip.apiURL,
    method: "POST",
    headers: headers,
    body: infoBipBody,
    json: true
  }
  return rp(payload)
}

const handler = async (req, res) => {
  try {
    // validate incoming request
    validateRequest(req.body)
    
    // sends message to infobig gateway
    await sendMessage(req.body)
    res
      .status(200)
      .send({ message: `message sent to ${req.body.phone}`}) 
  } catch(err) {
    console.log(err)
    if (err.status) {
      return res
        .status(err.status)
        .send({ message: err.message})
    }
    res
      .status(500)
      .json({ message: "An error occurred try again later"})
  }
}

module.exports = handler
