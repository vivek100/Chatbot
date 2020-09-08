    "message": {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Of course, what is your budget for the gift?",
          "buttons":[
              {
                  "content_type": "postback",
                  "title": "LESS THAN $20",
                  "payload": "GIFT_BUDGET_20_PAYLOAD"
              },
              {
                  "content_type": "postback",
                  "title": "$20 TO $50",
                  "payload": "GIFT_BUDGET_20_TO_50_PAYLOAD"
              },
              {
                  "content_type": "postback",
                  "title": "MORE THAN $50",
                  "payload": "GIFT_BUDGET_50_PAYLOAD"
              }
          ]
        }
      }
    }
