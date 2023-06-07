'use strict';
var AWS = require('aws-sdk');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

console.log('Loading function');

const http = require('https'); // or https 

AWS.config.update({region: 'us-west-1'});


const defaultOptions = {
    host: 'ea2cyqlp49.execute-api.us-west-1.amazonaws.com',
    port: 443, // or 443 for https
    headers: {
        'Content-Type': 'application/json',
    }
}

const post = (path, payload) => new Promise((resolve, reject) => {
    const options = { ...defaultOptions, path: path, method: 'POST' };
    const req = http.request(options, res => {
        let buffer = "";
        res.on('data', chunk => buffer += chunk)
        res.on('end', () => resolve(JSON.parse(buffer)))
    });
    req.on('error', e => reject(e.message));
    req.write(JSON.stringify(payload));
    req.end();
});


exports.handler = async (event, context, callback) => new Promise( async (resolve, reject) => {
  // Parse the input for the 
  let day = event.day === undefined ? 1 : event.day;
  let month = event.month === undefined ? 1 : event.month;
  let year = event.year ===undefined ? 1967 : event.year;
  let lat = event.lat ===undefined ? 34 : event.lat;
  let lng = event.lng ===undefined ? 1967 : event.lng;
  let thirty = event.thirty ===undefined ? 1 : event.thirty;
  let sixty = event.sixty ===undefined ? 3 : event.sixty;
  let ninety = event.ninety ===undefined ? 2 : event.ninety;
  let temp = event.temp ===undefined ? 89 : event.temp;
  let humidity = event.humidity ===undefined ? 20 : event.humidity;

  let date = new Date(year, month, day)
  date.setMonth(month)
  date.setDate(day)
  date.setYear(year)
  
  //fire,lat,long,started,perc30,perc60,perc90,hum,temp
  const arr = [0, lat, lng, date.getTime(), thirty, sixty, ninety, temp, humidity]
    
  const token = await post("/dev/backendservice", { "data": arr } );

  // queue implementation 
  
  var params = {
      DelaySeconds : 2,
      MessageAttributes: {
          "day" : {
              DataType : "Number",
              StringValue: day.toString()
          },
          "month" : {
              DataType : "Number",
              StringValue: month.toString()
          },
          "year" : {
              DataType : "Number",
              StringValue: year.toString()
          },
          "lat" : {
              DataType : "Number",
              StringValue: lat.toString()
          },
          "lng" : {
              DataType : "Number",
              StringValue: lng.toString()
          },
          "thirty" : {
              DataType : "Number",
              StringValue: thirty.toString()
          },
          "sixty" : {
              DataType : "Number",
              StringValue: sixty.toString()
          },
          "ninety" : {
              DataType : "Number",
              StringValue: ninety.toString()
          },
          "temp" : {
              DataType : "Number",
              StringValue: temp.toString()
          },
          "humidity" : {
              DataType : "Number",
              StringValue: humidity.toString()
          },
      },
      MessageBody : "Requests sent: ",
      QueueUrl: "https://sqs.us-west-1.amazonaws.com/823493614399/incomingRequestQueue"
    };
  
    sqs.sendMessage(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.MessageId);
        }
        });    
        // Return a greeting to the caller
    callback(null, {
            "prediction": token
    }); 
});
