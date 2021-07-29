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

//upload the gif
const pathToFile = "./yas.gif"
const mediaType = "image/gif"

const mediaData = fs.readFileSync(pathToFile)
const mediaSize = fs.statSync(pathToFile).size

initializeMediaUpload()
  .then(appendFileChunk)
  .then(finalizeUpload)
  .then(publishStatusUpdate)

function initializeMediaUpload() {
  return new Promise(function(resolve, reject) {
    T.post("media/upload", {
      command: "INIT",
      total_bytes: mediaSize,
      media_type: mediaType
    }, function(error, data, response) {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        resolve(data.media_id_string)
      }
    })
  })
}

function appendFileChunk(mediaId) {
  return new Promise(function(resolve, reject) {
    T.post("media/upload", {
      command: "APPEND",
      media_id: mediaId,
      media: mediaData,
      segment_index: 0
    }, function(error, data, response) {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        resolve(mediaId)
      }
    })
  })
}

function finalizeUpload(mediaId) {
  return new Promise(function(resolve, reject) {
    T.post("media/upload", {
      command: "FINALIZE",
      media_id: mediaId
    }, function(error, data, response) {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        resolve(mediaId)
      }
    })
  })
}


function publishStatusUpdate(mediaId) {

  var id = tweet.id_str;
  var text = tweet.text;
  var name = tweet.user.screen_name;

  let i = Math.floor(Math.random() * 3);

  return new Promise(function(resolve, reject) {
    if ((text.includes('@positiveholt'))) {

      // Start a reply back to the sender
      var replyText = emoji[i] + "@"+ name + " YASSSSS!!! ";
      
      // Post that tweet
      T.post('statuses/update', { status: replyText, in_reply_to_status_id: id, media_ids: mediaId }, tweeted);
  
      // Make sure it worked!
      function tweeted(err, reply) {
        if (err) {
          console.log(err.message);
        } else {
          console.log('Tweeted: ' + reply.text);
        }
  
      }
// Here a tweet event is triggered!
    }    
  }
}
