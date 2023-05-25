const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const axios = require("axios")
const path = require('path');
// bus.status().then(busStatus => console.log(busStatus))
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//  app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// app.get("/messenger", (req, res) => {
//   const options = {
//     root: path.join(__dirname)
//   };

//   const fileName = 'messenger.js';
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log('Sent:', fileName);
//     }
//   });
// })
// app.get("/bootstrap", (req, res) => {
//   const options = {
//     root: path.join(__dirname)
//   };

//   const fileName = 'bootstrap.js';
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log('Sent:', fileName);
//     }
//   });
// })

app.post("/", (req, res) => processWebhook(req, res));

app.get("/", (req, res) => {
  res.send("Running");
})

const server = app.listen(process.env.PORT || 3000, () => {
  const port = server.address().port;
  console.log("App now running on port", port);
});

var processWebhook = (request, response) => {
  const agent = new WebhookClient({
    request,
    response
  });

  const welcome = agent => {
    agent.add("Hi, Welcome to Double D Trailers. Please ask any question you have for us.")
  }


  const fallback = async (agent) => {

    let userAsks = request.body.queryResult.queryText;

    let res;
    try {
      res = await axios.post(
        "https://api.openai.com/v1/completions",
        {
          model: "text-davinci-003",
          prompt: "Double D Trailers is a custom-built horse trailer manufacturer with various models available for sale, such as gooseneck horse trailers, bumper pull horse trailers, and horse trailers with living quarters. The company prioritizes safety and comfort during transport, using patented safety features and construction technology. Customers can design and order their trailers online using the Double D Trailers Customizer, with financing and a nationwide warranty service program available. Visit doubledtrailers.com for more information. \n\n User asks: " + userAsks + "?\n\n",
          temperature: 0.2,
          max_tokens: 60,
        },

        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer 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",
          },
        }
      );
      res = res.data.choices[0].text;

    } catch (error) {
      console.log(error)

      res = "I am offline at the moment, Meanwhile you can browse through our blogs page for best experience!";

    }

    agent.add(res);
  };

  let intentMap = new Map();

  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("Default Welcome Intent", welcome);

  agent.handleRequest(intentMap);
};
