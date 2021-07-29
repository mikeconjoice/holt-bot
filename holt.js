if (process.env.NODE_ENV === "develop") {
  require("dotenv").config();
};

var fs = require("fs")

// Create an Twitter object to connect to Twitter API
var Twit = require('twit');

// Pulling keys from another file
var config = require('./config.js');
// Making a Twit object for connection to the API
var T = new Twit(config);

// Setting up a user stream
var stream = T.stream('statuses/filter', { track: '@positiveholt' });

// Now looking for tweet events
// See: https://dev.twitter.com/streaming/userstreams
stream.on('tweet', tweetEvent);

//array to add random emojis to the beginning of the tweet
const emoji = ["🔥🔥🔥", "🔥🎺🔥", "🔥🙋‍♀️🔥"];


// Here a tweet event is triggered!
function tweetEvent(tweet, mediaId) {

    var id = tweet.id_str;
    var text = tweet.text;
    var name = tweet.user.screen_name;

    //from itsAydrian in twitch chat on 1/28 😘    
    let i = Math.floor(Math.random() * 3);

    // checks text of tweet for mention of Shania Bot
    if ((text.includes('@positiveholt'))) {

      // Start a reply back to the sender
      var replyText = emoji[i] + "@" + name + " YASSSSS!!! ";
      var b64content = fs.readFileSync('yas.gif', { encoding: 'base64' })

      // first we must post the media to Twitter
      T.post('media/upload', { media_data: b64content }, function (err, data, response) {
        // now we can assign alt text to the media, for use by screen readers and
        // other text-based presentations and interpreters
        var mediaIdStr = data.media_id_string
        var altText = "Small flowers in a planter on a sunny balcony, blossoming."
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

        T.post('media/metadata/create', meta_params, function (err, data, response) {
          if (!err) {
            var params = { status: replyText, media_ids: [mediaIdStr] }

            // Post that tweet
            T.post('statuses/update', params)
          }
        }
        )
      }
      )
    }
  })
}