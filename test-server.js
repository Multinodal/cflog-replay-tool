// quick and dirty test server to test cf-replay requests and
// then respond to the request after a random amount of time
// lawrence@multinodal.com

const port = 8000;

var express = require('express');
var app = express();

var randomQueue = [];

function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function pushIntoQueue(item) {
    var d = new Date(Date.now() + getRandomBetween(350, 3500));
    var key = d.getTime();

    if( typeof randomQueue[key] == "undefined" )
        randomQueue[key] = [];

    randomQueue[key] = item;
}

var heart_beat = function() {
    if( randomQueue.legnth < 1 ) return;
    Object.keys(randomQueue).forEach(function(key) {
        if( Date.now() < key ) return;
        else {
            var item = randomQueue[key];
            item.res.send('Hello!');

            delete randomQueue[key];
        }
    });
};

app.get('/*', function (req, res) {
    pushIntoQueue({'req':req, 'res':res});
});

app.listen(port, '127.0.0.1', function () {
    console.log('Test-server listening on port %d!', port);
});

i = setInterval(heart_beat, 100);

console.log('Server heart_beat has been started.');

