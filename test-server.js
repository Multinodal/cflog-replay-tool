// quick and dirty test server to test cf-replay requests and
// then respond to the request after a random amount of time
// lawrence@multinodal.com

const port = 8000;

var express = require('express');
var app = express();
var secondsCnt = 0;
var outCnt = 0;
var bReplay = false;

var randomQueue = [];

function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function pushIntoQueue(item) {
    var d = new Date(Date.now() + getRandomBetween(150, 2500));
    var key = d.getTime();

    if( typeof randomQueue[key] == "undefined" )
        randomQueue[key] = [];

    randomQueue[key] = item;
}

var heart_beat = function() {
    //if( randomQueue.length < 1 ) return;
    Object.keys(randomQueue).forEach(function(key) {
        if( Date.now() < key ) return;
        else {
            var item = randomQueue[key];
            item.res.send('Hello!');
            outCnt ++;
            delete randomQueue[key];
        }
    });
};

app.get('/*', function (req, res) {
    bReplay = true;
    pushIntoQueue({'req':req, 'res':res});
});

app.listen(port, '127.0.0.1', function () {
    console.log('Test-server listening on port %d!', port);
});

setInterval(heart_beat, 100);

setInterval(function() {
    if( bReplay ) {
        secondsCnt++;
        if( outCnt > 0 ) {
            console.log("\n\t\tExpress: %d responses sent at %d seconds by server.\n", outCnt, secondsCnt);
            outCnt = 0;
        }
    }
}, 1000);

console.log('Server heart_beat has been started.');

