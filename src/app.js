'use strict';

const apiai = require('apiai');
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('node-uuid');
const request = require('request');
const JSONbig = require('json-bigint');
const async = require('async');
var fs = require('fs');

const REST_PORT = (process.env.PORT || 5000);
const APIAI_ACCESS_TOKEN = "48db1454985249c2ba0c66b7880b99d7";
const APIAI_LANG = 'en';
const FB_VERIFY_TOKEN = "my_voice_is_my_password_verify_me";
const FB_PAGE_ACCESS_TOKEN = "EAAaIS9QfnxUBAHV3Gx9xFoKifOpc2RWtkWidLRdwQbptjBvRvhTIVsQhLNCfpfR6zXyfpGewMylC2ZBTUAamVJX6r7yROCjnOYZBMU2ZAgn4s7xnZB2OCoz4dEUkUxrrqHtU5q7MWvgOS56nVVZCFEf6gBZCbjcvx8WnWWxaR1EgZDZD";

const apiAiService = apiai(APIAI_ACCESS_TOKEN, {language: APIAI_LANG, requestSource: "fb"});
const sessionIds = new Map();

const name=0;

function processEvent(event) {
    var sender = event.sender.id.toString();

    if ((event.message && event.message.text) || (event.postback && event.postback.payload)) {
        var text = event.message ? event.message.text : event.postback.payload;
        // Handle a text message from this sender

        if (!sessionIds.has(sender)) {
            sessionIds.set(sender, uuid.v4());
        }

        console.log("Text", text);

        if((event.postback && event.postback.payload)){
            console.log("Post back", text);
            if(text === "no"){
            
               }
            if(text === "yes"){
                        var greetings2 = "I am a Shiba Inu breed,\u000A 4 years old now.\u000AThis is me when I was 4 months old :D.";
                        var splittedText1 = splitResponse(greetings2);
                        //sendFBMessage(sender, "I am Batuk, an Internet Doggo.", sendGif(sender));
                        
                        async.eachSeries(splittedText1, (textPart, callback) => {
                            sendGif(sender,"https://shiba.fr/wp-content/uploads/shiba-inu-prix-chiot.jpg");
                            sendFBSenderAction(sender,"typing_on");
                            setTimeout(() => {
                             sendFBMessage(sender, {text: textPart},sendFBMessage({text: "What is your favourite Animal?"}));
                             
                            }, 3000);
                            
                        });
               }


        }else{

        let apiaiRequest = apiAiService.textRequest(text,
            {
                sessionId: sessionIds.get(sender),
                originalRequest: {
                    data: event,
                    source: "facebook"
                }
            });

        apiaiRequest.on('response', (response) => {
            if (isDefined(response.result)) {
                let responseText = response.result.fulfillment.speech;
                let responseData = response.result.fulfillment.data;
                let action = response.result.action;
                console.log(responseText+"||"+responseData+"||"+action);

                if (isDefined(responseData) && isDefined(responseData.facebook)) {
                    if (!Array.isArray(responseData.facebook)) {
                        try {
                            console.log('Response as formatted message');
                            sendFBMessage(sender, responseData.facebook);
                        } catch (err) {
                            sendFBMessage(sender, {text: err.message});
                        }
                    } else {
                        async.eachSeries(responseData.facebook, (facebookMessage, callback) => {
                            try {
                                if (facebookMessage.sender_action) {
                                    console.log('Response as sender action');
                                    sendFBSenderAction(sender, facebookMessage.sender_action, callback);
                                }
                                else {
                                    console.log('Response as formatted message');
                                    sendFBMessage(sender, facebookMessage, callback);
                                }
                            } catch (err) {
                                sendFBMessage(sender, {text: err.message}, callback);
                            }
                        });
                    }
                } else if (isDefined(responseText)) {
                   if(name != 1){
                    console.log('Response as text message');
                    // facebook API limit for text length is 320,
                    // so we must split message if needed
                    var splittedText = splitResponse(responseText);

                    async.eachSeries(splittedText, (textPart, callback) => {
                        sendFBMessage(sender, {text: textPart}, callback);
                    });

                    if(action === "smalltalk.greetings.hello"){
                        console.log(sender);

                        var greetings1 = "I am Batuk, an Internet Doggo.";
                        var splittedText1 = splitResponse(greetings1);
                        //sendFBMessage(sender, "I am Batuk, an Internet Doggo.", sendGif(sender));
                        sendGif(sender,"https://media.giphy.com/media/FTJfA8RiHaOfS/giphy.gif");
                        async.eachSeries(splittedText1, (textPart, callback) => {
                            
                            sendFBSenderAction(sender,"typing_on");
                            setTimeout(() => {
                             sendFBMessage(sender, {text: textPart},sendGreetingOptions(sender));
                             
                            }, 3000);
                            
                        });

                    }
                    if(action === "smalltalk.confirmation.yes"){
                        console.log(sender);
                        name=1;
                        var greetings1 = "oh, what is he or she called ?";
                        var splittedText1 = splitResponse(greetings1);
                        //sendFBMessage(sender, "I am Batuk, an Internet Doggo.", sendGif(sender));
                        sendGif(sender,"https://i.redd.it/zpzmibmndanx.gif");
                        async.eachSeries(splittedText1, (textPart, callback) => {
                            
                            sendFBSenderAction(sender,"typing_on");
                            setTimeout(() => {
                             sendFBMessage(sender, {text: textPart},sendGreetingOptions(sender));
                             
                            }, 3000);
                            
                        });

                    }
                }
                    if(name === 1){
                        console.log(sender);
                        name=0;
                        var greetings1 = "Okay, say hi to "+text+" from me :).";
                        var splittedText1 = splitResponse(greetings1);
                        //sendFBMessage(sender, "I am Batuk, an Internet Doggo.", sendGif(sender));
                        sendGif(sender,"https://i.redd.it/zpzmibmndanx.gif");
                        async.eachSeries(splittedText1, (textPart, callback) => {
                            
                            sendFBSenderAction(sender,"typing_on");
                            setTimeout(() => {
                             sendFBMessage(sender, {text: textPart},sendGreetingOptions(sender));
                             
                            }, 3000);
                            
                        });

                    }

                }

            }
        });

        apiaiRequest.on('error', (error) => console.error(error));
        apiaiRequest.end();
        }
    }
}

function splitResponse(str) {
    if (str.length <= 320) {
        return [str];
    }

    return chunkString(str, 300);
}

function chunkString(s, len) {
    var curr = len, prev = 0;

    var output = [];

    while (s[curr]) {
        if (s[curr++] == ' ') {
            output.push(s.substring(prev, curr));
            prev = curr;
            curr += len;
        }
        else {
            var currReverse = curr;
            do {
                if (s.substring(currReverse - 1, currReverse) == ' ') {
                    output.push(s.substring(prev, currReverse));
                    prev = currReverse;
                    curr = currReverse + len;
                    break;
                }
                currReverse--;
            } while (currReverse > prev)
        }
    }
    output.push(s.substr(prev));
    return output;
}

function sendFBMessage(sender, messageData, callback) {
    console.log("inside send Message Function "+messageData);
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: FB_PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, (error, response, body) => {
        if (error) {
            console.log('Error sending message:1 ', error);
        } else if (response.body.error) {
            console.log('Error:1 ', response.body.error);
        }

        if (callback) {
            callback();
        }
    });
}
function sendGif(sender,url,callback) {
    
    let messageData = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": url,
            }
        }
    }

            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token:FB_PAGE_ACCESS_TOKEN},
                method: 'POST',
                json: {
                    recipient: {id:sender},
                    message: messageData,
                }
            }, function(error, response, body) {
                if (error) {
                    console.log('Error sending messages:2 ', error)
                } else if (response.body.error) {
                    console.log('Error:2 ', response.body.error)
                }
                sendFBSenderAction(sender,"typing_on");
                if (callback) {
                   callback();
                }
            });
}
function sendGreetingOptions(sender,callback) {
    sendFBSenderAction(sender,"typing_on");
    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
              "template_type":"button",
              "text":"Wanna know more about me?",
              "buttons":[
                {
                    "type": "postback",
                    "title": "Yes",
                    "payload": "yes"
                },{
                    "type": "postback",
                    "title": "No",
                    "payload": "no"
                }
              ]
            }
          }
    }
    setTimeout(() => {
            request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {access_token:FB_PAGE_ACCESS_TOKEN},
                    method: 'POST',
                    json: { 
                        recipient: {id:sender},
                        message: messageData,
                    }
                }, function(error, response, body) {
                    if (error) {
                        console.log('Error sending messages:2 ', error)
                    } else if (response.body.error) {
                        console.log('Error:2 ', response.body.error)
                    }

                            if (callback) {
                        callback();
                    }
                });

            }, 3000);

}

function sendGreetingOptions2(sender,callback) {
    sendFBSenderAction(sender,"typing_on");
    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
              "template_type":"button",
              "text":"Wanna know about my friends?",
              "buttons":[
                {
                    "type": "postback",
                    "title": "Yes",
                    "payload": "moreyes"
                },{
                    "type": "postback",
                    "title": "No",
                    "payload": "moreno"
                }
              ]
            }
          }
    }
    setTimeout(() => {
            request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {access_token:FB_PAGE_ACCESS_TOKEN},
                    method: 'POST',
                    json: { 
                        recipient: {id:sender},
                        message: messageData,
                    }
                }, function(error, response, body) {
                    if (error) {
                        console.log('Error sending messages:2 ', error)
                    } else if (response.body.error) {
                        console.log('Error:2 ', response.body.error)
                    }

                            if (callback) {
                        callback();
                    }
                });

            }, 3000);

}
function sendFBSenderAction(sender, action, callback) {
    setTimeout(() => {
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: FB_PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: {
                recipient: {id: sender},
                sender_action: action
            }
        }, (error, response, body) => {
            if (error) {
                console.log('Error sending action: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
            if (callback) {
                callback();
            }
        });
    }, 1000);
}

function doSubscribeRequest() {
    request({
            method: 'POST',
            uri: "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=" + FB_PAGE_ACCESS_TOKEN
        },
        (error, response, body) => {
            if (error) {
                console.error('Error while subscription: ', error);
            } else {
                console.log('Subscription result: ', response.body);
            }
        });
}

function isDefined(obj) {
    if (typeof obj == 'undefined') {
        return false;
    }

    if (!obj) {
        return false;
    }

    return obj != null;
}

const app = express();

app.use(bodyParser.text({type: 'application/json'}));
app.use('/', express.static(__dirname))  

app.get('/webhook/', (req, res) => {
    if (req.query['hub.verify_token'] == FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);

        setTimeout(() => {
            doSubscribeRequest();
        }, 3000);
    } else {
        res.send('Error, wrong validation token');
    }
});

app.post('/webhook/', (req, res) => {
    try {
        var data = JSONbig.parse(req.body);

        if (data.entry) {
            let entries = data.entry;
            entries.forEach((entry) => {
                let messaging_events = entry.messaging;
                if (messaging_events) {
                    messaging_events.forEach((event) => {
                        var sender = event.sender.id.toString();
                        if (event.message && !event.message.is_echo ||
                            event.postback && event.postback.payload) {
                            
                            
                            sendFBSenderAction(sender,"mark_seen");
                            sendFBSenderAction(sender,"typing_on");
                            setTimeout(() => {
                             processEvent(event);
                            }, 3000);
                            
                        }
                    });
                }
            });
        }

        return res.status(200).json({
            status: "ok"
        });
    } catch (err) {
        return res.status(400).json({
            status: "error",
            error: err
        });
    }

});

app.listen(REST_PORT, () => {
    console.log('Rest service ready on port ' + REST_PORT);
});

doSubscribeRequest();
