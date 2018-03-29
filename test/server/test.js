const expect = require('chai').expect
const nock = require('nock');
const Supertest = require('supertest')
const server = require('../../app')

const request = new Supertest(server)
// test call to endpoint with invalid details to return 500 error

describe('Test', () => {
  const infoBipURL = 'https://api.infobip.com'

  after(() => server.close())

  describe('Error', () => {
    before(() => {
      nock(infoBipURL)
        .post('/sms/1/text/single', {
          from: 'Enaho Murphy',
          to: 2349099350122,
          text: 'This is a test message'
        })
        .reply(401);
    })

    it('should return 500 when sms fails to deliver', (done) => {
      request
        .post('/api/v1/send')
        .send({
          name: 'Enaho Murphy',
          phone: '2349099350122',
          message: 'This is a test message'
        })
        .expect(500)
        .end((err, res) => {
          expect(res.body.message).eql('An error occurred try again later')
          done()
        })
    })
    it('should return 422 if phone number is invalid', (done) => {
      request
        .post('/api/v1/send')
        .send({
          name: 'Enaho Murphy',
          phone: '',
          message: 'This is a test message'
        })
        .expect(422)
        .end((err, res) => {
          expect(res.body.message).eql('All fields are required and must be valid')
          expect(res.body.errors[0]).to.deep.equal({ 
            path: 'phone',
            message: 'phone is required and must be a valid number' 
          })
          done()
        })
    })

    it('should return 422 if name is invalid', (done) => {
      request
        .post('/api/v1/send')
        .send({
          name: '',
          phone: '20948473020',
          message: 'This is a test message'
        })
        .expect(422)
        .end((err, res) => {
          expect(res.body.message).eql('All fields are required and must be valid')
          expect(res.body.errors[0]).to.deep.equal({ 
            path: 'name',
            message: 'name is required and must be a valid name' 
          })
          done()
        })
    })

    it('should return 422 if message is invalid', (done) => {
      request
        .post('/api/v1/send')
        .send({
          name: 'Enaho Murphy',
          phone: '27382372922',
          message: ''
        })
        .expect(422)
        .end((err, res) => {
          expect(res.body.message).eql('All fields are required and must be valid')
          expect(res.body.errors[0]).to.deep.equal({ 
            path: 'message',
            message: 'message is required and must be a valid message' 
          })
          done()
        })
    })

    it('should return 422 and errors of length 3 if no field is passed', (done) => {
      request
        .post('/api/v1/send')
        .send({})
        .expect(422)
        .end((err, res) => {
          expect(res.body.message).eql('All fields are required and must be valid')
          expect(res.body.errors).to.be.lengthOf(3)
          done()
        })
    })
  })

  describe('Success', () => {
    before(() => {
      nock(infoBipURL)
        .post('/sms/1/text/single', {
          from: 'Enaho Murphy',
          to: '2349099350122',
          text: 'This is a test message'
        })
        .reply(200);
    })

    it('should return 200 when sms has been successfully sent', (done) => {
      request
        .post('/api/v1/send')
        .send({ 
          name: 'Enaho Murphy',
          phone: '2349099350122',
          message: 'This is a test message'
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.message).eql('message sent to 2349099350122')
          done()
        })
    })
  })
})