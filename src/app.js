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

var name=0;

const accessToken = 'EAAEUQvxOrEMBAP9PGeNcddvk2UODlUZCYMX9nzZBElmZAfAZCil0nlPlerGsZBirwiBtMCW0ARbkVzSpgvEdpH4EZB2zBIqK1MzGDc6APPgXSBURDzHkiEBKwAvi4bIlQZAsrVTX8uaAcJgnRZA1p46lu4EPjgtILo8EUBkdO3OYAC4Xjrg43iYo';
var recentPostId='';
var currentPost;
var acceptedFbPost= Array();
var FbAcceptedCount=0;
var PostCounter = [2,2,1,3,1,1];

        setTimeout(function checkPost(){
            request({'url':'https://graph.facebook.com/v2.9/974127312733413/visitor_posts?access_token=' + FB_PAGE_ACCESS_TOKEN
           }, function (error, response, body) {
               if (!error && response.statusCode == 200) {
                   //console.log(response.body);
                   var data = JSON.parse(response.body);
                    if(recentPostId != null){
                        if(data.data.length != 0 ){
                            console.log(data.data.length);
                            if(recentPostId === data.data[0].id)
                                {
                                    console.log('latest post in database: '+recentPostId+'\n latest post returned by the api'+data.data[0].id);
                                } else {
                                    console.log('latest post in database: '+recentPostId+'\n latest post returned by the api'+data.data[0].id);
                                    recentPostId=data.data[0].id;
                                    currentPost=data;
                                    acceptedFbPost[FbAcceptedCount]=data.data[0];
                                    FbAcceptedCount++;
                                    PostCounter[0]++;
                                    //send the private reply thingy
                                    console.log("Detected New Post on the page.");
                                    request({
                                        url: 'https://graph.facebook.com/v8.0/me/messages',
                                        qs: {access_token:FB_PAGE_ACCESS_TOKEN},
                                        method: 'POST',
                                        json: {
                                            recipient: {
                                                "post_id": recentPostId
                                            },
                                            message: {
                                                "text": "How can we help you?",
                                                "quick_replies":[
                                                  {
                                                    "content_type":"text",
                                                    "title":"Talk to Batuk!",
                                                    "payload":"selectedBatuk",
                                                    "image_url":"https://i.pinimg.com/originals/9f/8a/16/9f8a16e38df86be51951fa374fb9b351.png"
                                                  },{
                                                    "content_type":"text",
                                                    "title":"Talk to Customer Care!",
                                                    "payload":"selectedCare",
                                                    "image_url":"https://cdn.shopify.com/s/files/1/1061/1924/products/CAT_emoji_icon_png_1024x1024.png"
                                                  }
                                                ]
                                              }
                                        }
                                    }, function(error, response, body) {
                                        if (error) {
                                            console.log('Error sending messages:2 ', error)
                                        } else if (response.body.error) {
                                            console.log('Error:2 ', response.body.error)
                                        }
                                    });
                                }
                        }
                    }else{
                        if(data.data != undefined){
                            recentPostId=data.data[0].id;
                            PostCounter[0]++;
                        }
                    }
               }else{
                console.log("Didnt work"+ response.statusCode)
               }
           });
           setTimeout(checkPost,60000);

        }, 60000);

function processEvent(event) {
    var sender = event.sender.id.toString();
    console.log("Id when inside: "+sender)

    if ((event.message && event.message.text) || (event.postback && event.postback.payload)) {
        var text = event.message ? event.message.text : event.postback.payload;
        // Handle a text message from this sender

        if (!sessionIds.has(sender)) {
            sessionIds.set(sender, uuid.v4());
        }

        console.log("Text", text);

        if((event.postback || event.message.quick_reply)){
            console.log("Post back", text);
            if(text === "no"){
            
            }else if(text === "yes"){
                        var greetings2 = "This is me when I was 4 months old :D.\u000A I am a Shiba Inu.";
                        var splittedText1 = splitResponse(greetings2);
                        //sendFBMessage(sender, "I am Batuk, an Internet Doggo.", sendGif(sender));
                        
                        async.eachSeries(splittedText1, (textPart, callback) => {
                            sendGif(sender,"https://i.ibb.co/JqHjxXF/Mini-Shiba-Inu-HP-long.jpg");
                            sendFBSenderAction(sender,"typing_on");
                            
                            setTimeout(() => {
                             sendFBMessage(sender, {text: textPart},sendQuickReply(sender,{text: "What person are you?"}));
                             
                            }, 3000);
                            
                        });
            }else if(text === "playgame"){
                var greetings2 = "I have a 20% off coupon for you.\u000A Play a game with me to win a coupon.";
                var splittedText1 = splitResponse(greetings2);
                //sendFBMessage(sender, "I am Batuk, an Internet Doggo.", sendGif(sender));
                
                async.eachSeries(splittedText1, (textPart, callback) => {
                    //sendGif(sender,"https://i.ibb.co/JqHjxXF/Mini-Shiba-Inu-HP-long.jpg");
                    sendFBSenderAction(sender,"typing_on");
                    
                    setTimeout(() => {
                     sendFBMessage(sender, {text: textPart},sendGameButton(sender));
                     
                    }, 3000);
                    
                });
            }else if(event.message.quick_reply){
                if (event.message.quick_reply.payload === "SelectedDog") {
                    console.log("Post back", event.message.quick_reply.payload);
                    var greetings2 = "I just Created a sticker for you!";
                    var splittedText1 = splitResponse(greetings2);
                    //sendFBMessage(sender, "I am Batuk, an Internet Doggo.", sendGif(sender));
                    
                    async.eachSeries(splittedText1, (textPart, callback) => {
                        sendGif(sender,"https://image.freepik.com/free-vector/astronaut-dog_151676-115.jpg");
                        sendFBSenderAction(sender,"typing_on");
                        setTimeout(() => {
                            sendFBMessage(sender, {text: textPart},sendCustomDogLayout(sender));
                            
                           }, 3000);
                    });
                }
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
                            console.log(textPart);
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
                             sendFBMessage(sender, {text: textPart});
                             
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
                             sendFBMessage(sender,  {text: textPart});
                             
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
            setTimeout(() => {
            callback();
        }, 3000);
            
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
function sendQuickReply(sender,text,callback) {
    sendFBSenderAction(sender,"typing_on");
    let messageData = {
        "text": "What person are you ?",
        "quick_replies":[
          {
            "content_type":"text",
            "title":"Dog Person",
            "payload":"SelectedDog",
            "image_url":"https://i.pinimg.com/originals/9f/8a/16/9f8a16e38df86be51951fa374fb9b351.png"
          },{
            "content_type":"text",
            "title":"Cat Person",
            "payload":"SelectedCat",
            "image_url":"https://cdn.shopify.com/s/files/1/1061/1924/products/CAT_emoji_icon_png_1024x1024.png"
          }
        ]
      }
    setTimeout(() => {
            request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {access_token:FB_PAGE_ACCESS_TOKEN},
                    method: 'POST',
                    json: { 
                        recipient: {id:sender},
                        messaging_type: "RESPONSE",
                        message: messageData,
                    }
                }, function(error, response, body) {
                    if (error) {
                        console.log('Error sending messages:2 ', error)
                    } else if (response.body.error) {
                        console.log('Error:4 ', response.body.error)
                    }

                            if (callback) {
                        callback();
                    }
                });

            }, 3000);

}
function sendCustomDogLayout(sender,callback) {
    sendFBSenderAction(sender,"typing_on");
    let messageData = {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"generic",
            "elements":[
               {
                "title":"Custome Grey Sticker!",
                "image_url":"https://petersfancybrownhats.com/company_image.png",
                "subtitle":"$2.99",
                "default_action": {
                  "type": "web_url",
                  "url": "https://petersfancybrownhats.com/view?item=103",
                  "webview_height_ratio": "tall",
                },
                "buttons":[
                  {
                    "type":"web_url",
                    "url":"https://petersfancybrownhats.com",
                    "title":"View Website"
                  },{
                    "type":"postback",
                    "title":"Keep Chatting",
                    "payload":"playgame"
                  }              
                ]      
              },{
                "title":"Custome Green Sticker!",
                "image_url":"https://petersfancybrownhats.com/company_image.png",
                "subtitle":"$2.99",
                "default_action": {
                  "type": "web_url",
                  "url": "https://petersfancybrownhats.com/view?item=103",
                  "webview_height_ratio": "tall",
                },
                "buttons":[
                  {
                    "type":"web_url",
                    "url":"https://petersfancybrownhats.com",
                    "title":"View Website"
                  },{
                    "type":"postback",
                    "title":"Keep Chatting",
                    "payload":"playgame"
                  }              
                ]      
              },{
                "title":"Custome Blue Sticker!",
                "image_url":"https://petersfancybrownhats.com/company_image.png",
                "subtitle":"$2.99",
                "default_action": {
                  "type": "web_url",
                  "url": "https://petersfancybrownhats.com/view?item=103",
                  "webview_height_ratio": "tall",
                },
                "buttons":[
                  {
                    "type":"web_url",
                    "url":"https://petersfancybrownhats.com",
                    "title":"View Website"
                  },{
                    "type":"postback",
                    "title":"Keep Chatting",
                    "payload":"playgame"
                  }              
                ]      
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
                        console.log('Error:4 ', response.body.error)
                    }

                            if (callback) {
                        callback();
                    }
                });

            }, 3000);

}
function sendGameButton(sender,callback) {
    sendFBSenderAction(sender,"typing_on");
    let messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "button",
                text: "Play Game.",
                buttons: [{
                    type: "web_url",
                    url: "https://nameless-tor-65554.herokuapp.com" + "/options.html",
                    title: "Win Coupon!",
                    webview_height_ratio: "compact",
                    messenger_extensions: true
                }]
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
                        console.log('Error:4 ', response.body.error)
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
// Handle postback from webview
app.get('/optionspostback', (req, res) => {
    let body = req.query;
    let response = `Great, I will book you a ${body.bed} bed, with ${body.pillows} pillows and a ${body.view} view.`

    res.status(200).send('Please close this window to return to the conversation thread.');
    console.log("Id when inside: "+body.psid)
    sendFBMessage(body.psid, {text: response});
});


app.listen(REST_PORT, () => {
    console.log('Rest service ready on port ' + REST_PORT);
});

doSubscribeRequest();
