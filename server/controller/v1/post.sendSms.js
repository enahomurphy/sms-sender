const rp = require('request-promise')

const infoBip = require('../../config/infobip')

const isString = (val) => val && val.length > 1  || false
const isPhone = (val) => val &&
  !isNaN(val) &&
  val.toString().length > 7 ||
  false

// validates request and generates error messages
// for each fields
const validateRequest = (body) => {
  const errors = []
  const RequestKeys = Object.keys(body)
  const validFields = ['phone', 'name', 'message']

  validFields.forEach((key) => {
    const validFields = RequestKeys.includes(key)
    if ((validFields && key === 'phone') && !isPhone(body[key])) {
      errors.push({
        path: key,
        message: `${key} is required and must be a valid number`
      })
    }
    else if ((!validFields || !isString(body[key])) ||
      (validFields && !isString(body[key]))  ) {
        errors.push({
          path: key,
          message: `${key} is required and must be a valid ${key}`
        })
    }
  })

  if (errors.length) {
    throw({
      status: 422,
      errors,
      message: "All fields are required and must be valid"
    })
  }
}

const sendMessage = (body) => {
  const token =  Buffer
    .from(`${infoBip.username}:${infoBip.password}`)
    .toString('base64')

  const infoBipBody = {
    from: body.name,
    to: body.phone,
    text: body.message
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
    if (err.status) {
      return res
        .status(err.status)
        .send({ 
          message: err.message,
          errors: err.errors
        })
    }
    res
      .status(500)
      .json({ message: "An error occurred try again later"})
  }
}

module.exports = handler
