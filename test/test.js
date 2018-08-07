const supertest = require('supertest');
const expect = require('chai').expect;
const mocha = require('mocha')
const tv4 = require('tv4');
const fs = require('fs');


// Based on blog post at https://medium.com/@shashiraja/convert-postman-api-tests-to-mocha-10705af6e37a
const test_data = JSON.parse(fs.readFileSync('./test/data.json', 'utf8'));
const baseUrl = supertest("restful-booker.herokuapp.com");
const apiEndPoint = "/booking";

var response;
var body;

var schema = {
    "$id": "booking",
    "type": "object",
    "definitions": {},
    "$schema": "http://json-schema.org/draft-06/schema#",
    "additionalProperties": false,
    "properties": {
        "bookingid": {
            "$id": "/properties/bookingid",
            "type": "integer"
        },
        "booking": {
            "$id": "/properties/booking",
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "firstname": {
                    "$id": "/properties/booking/properties/firstname",
                    "type": "string"
                },
                "lastname": {
                    "$id": "/properties/booking/properties/lastname",
                    "type": "string"
                },
                "totalprice": {
                    "$id": "/properties/booking/properties/totalprice",
                    "type": "integer"
                },
                "depositpaid": {
                    "$id": "/properties/booking/properties/depositpaid",
                    "type": "boolean"
                },
                "bookingdates": {
                    "$id": "/properties/booking/properties/bookingdates",
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "checkin": {
                            "$id": "/properties/booking/properties/bookingdates/properties/checkin",
                            "type": "string"
                        },
                        "checkout": {
                            "$id": "/properties/booking/properties/bookingdates/properties/checkout",
                            "type": "string"
                        }
                    },
                    "required": [
                        "checkin",
                        "checkout"
                    ]
                },
                "additionalneeds": {
                    "$id": "/properties/booking/properties/additionalneeds",
                    "type": "string"
                }
            },
            "required": [
                "firstname",
                "lastname",
                "totalprice",
                "depositpaid",
                "bookingdates",
                "additionalneeds"
            ]
        }
    },
    "required": [
        "bookingid",
        "booking"
    ]
};

const call_booking_api = async function (request_body) {
    return baseUrl.post(apiEndPoint)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send(request_body);
}

test_data.forEach(async function (data) {
    describe(`Book a movie for ${data.firstname}`, function () {

        before(async function () {
            response = await call_booking_api(data);
            body = response.body;
        });

        it('status code is 200', function () {
            expect(response.status).to.equal(200);
        });

        it('schema is valid', function () {
            expect(tv4.validate(body, schema)).to.be.true;
        });

        it("firstname and lastname are correct", function () {
            expect(body.booking.firstname).to.equal(data.firstname);
            expect(body.booking.lastname).to.equal(data.lastname);
        });

        it("totalprice value is correct", function () {
            expect(body.booking.totalprice).to.equal(data.totalprice);
        });

        it("depositpaid flag is correct", function () {
            expect(body.booking.depositpaid).to.equal(data.depositpaid);
        });
    });
});