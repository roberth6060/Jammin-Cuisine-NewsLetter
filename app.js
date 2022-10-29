/**
 * Install mailchimp client library:
 * yarn add @mailchimp/mailchimp_marketing# OR
 * npm install @mailchimp/mailchimp_marketing
 * Launch App with heroku: (In terminal) heroku login (Enter) email and password:
 * process.env.PORT || 3000  (listens on heroku and locally on port 3000)
 * Create Procfile: File heroku will check to see how to launch file (touch Procfile)
 * in Procfile: (Type) web: node app.js to tell heroku how to launch file
 * Next, Save work to git (git init) -->See Notes Boox
 * Deploy the app (heroku create)
 * Next, push local version of app to heroku with: npm i - g heroku
 * live site https://safe-mountain-58301.herokuapp.com
 */

//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
//mailchimp API call:
const mailchimp = require("@mailchimp/mailchimp_marketing");
const https = require("https");
const dotenv = require("dotenv").config();

// const request = require("request");
const app = express();
//Get express to use local static files (signin.css):
app.use(express.static("public"));
//This line makes it easier to parse the the request by placing the information in the request body.
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//Gain access to local html file.
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function (req, res) {
  //Use let when you know that the value of a variable will change:
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  console.log(firstName, lastName, email);
  //Ping endpoint response({"health_status": "Everything's Chimpy!"})
  //Data taken from (https://mailchimp.com/developer/marketing/api/lists/batch-subscribe-or-unsubscribe/)
  //mailchimp websit->APi References->Lists/Audiences->POST/lists/ {list_id}->memvers->(Show Properties) to see mailchimp keys used below:
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };
  //Need to turn (above) JavaScript object into a plat-pack JSON:
  //This data will be sent to mailchimp:
  const jsonData = JSON.stringify(data);

  //Find out which url to use by going to the mailchimp API:
  const url = `${process.env.URL}`;
  //Create options (JavaScript object):
  const options = {
    method: "POST",
    auth: `${process.env.AUTH}`,
  };
  //Make request (Create callback function that will give response from the mailchimp server):
  const request = https.request(url, options, function (response) {
    //Check for success (status code ===200) or failure:
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
    //Check what data is sent:
    response.on("data", function (data) {
      console.log(JSON.parse(data));
    });
  });

  //Inside write, we will pass JSON data to mailchimp server:
  request.write(jsonData);
  //Use this to specifyu you're done with the request:
  request.end();
});

//post request for failure route. Will have completion handler that redirects user to home route:
app.post("/failure", function (req, res) {
  res.redirect("/");
});

// Use process.env.PORT(Dynamic PORT) so that heroku chooses port to run web application:
app.listen(process.env.PORT || 3002, function () {
  console.log("Sever is running on port 3000.");
});
