# pickUpTheSlack

**version: 1.0.1**

A slack(https://slack.com/) slash command integration made for the IEEE Carleton Office to notify users in the room to look at slack.


## Motivation
A few of the exec team wanted a quick way to notify anyone in the office instead of systematically mmentioning people one by one until they found someone who is in the room.

This idea was thought up during one of Carleton's Stay Late and Make Sessions (http://staylateandmake.ca/)


## Setup
#### Slack Slash Integration
>Slash Commands allow you to listen for custom triggers in chat messages across all Slack channels. When a Slash Command is triggered, relevant data will be sent to an external URL in real-time. - Slack

**Steps:**

1. Add new Slack Configuration
2. Fill in the following fields
3. Enter the url to be called in the URL field

#### Configuration file (config.json)
Both the server and the client uses the config.json file to get various settings such as:

- Slack Validation token (server & client)
- Slack Team Domain (server)
- Slack Command (server)
- Remote URL to call when calling the client (server)
- Location of the audio file (client)
- Start Time to notify (server)
- End Time to notify (server)
- Timeout when notifying (client)
- Timeout when notifying for emergencies i.e. force (client)

A sample configuration can be found in config.sample.json


#### Server ./index.js
A service that the Slack slash command can invoke. Once it checks for authorization, it
calls a url that is specified in config.json

This is tested to work on heroku.

**To run:**

- `npm install`
- `npm start`


#### Client: ./client/client.js
The client that is responsible for receiving requests from the server and notifying users in the room via playing a sound with a time-out.
A confirmation or status messages are sent back to slack via the server.

**To run:**

- `cd client`
- `npm install`
- `npm start`

## Usage
Once the server and the client is setup:

1. go to your slack portal
2. open a channel, private group, a direct message, or a message with slackbot
3. type "/office" in the chat
4. type "/office" force to invoke the force command

## Testing
#### To test locally:

1. Go to your Router's port forward settings and port forward from your router's <CHOOSE_PORT> to <YOUR_PC_IP>:<5000>
2. Go to your slack slash command integration and change the URL field to http://<YOUR_PUBLIC_ROUTER_IP>:<CHOOSE_PORT>
3. Change REMOTE_URL value in config.json
4. Run both the server and client applications

*Request flow: slack <--> server(port 5000) <--> client(port 5050)*

#### To test with heroku:
1. Initialize a heroku app
2. Push to heroku
3. Change URL field in slack's slash command integration to match heroku's url

*Request flow: slack <--> heroku server(port 5000) <--> client(port 5050)*


## License
MIT
