require('dotenv').load()

const infoBibUsername = process.env.INFO_BIB_USERNAME
const infoBibPassword = process.env.INFO_BIB_PASSWORD
const infoBipS = process.env.INFO_BIB_API_URL

module.exports = {
  username: process.env.INFO_BIB_USERNAME,
  password: process.env.INFO_BIB_PASSWORD,
  apiURL: process.env.INFO_BIB_API_URL
}