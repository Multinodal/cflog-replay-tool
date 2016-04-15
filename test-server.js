// quick and dirty test server to test cf-replay requests and
// then respond to the request after a random amount of time

const port = 8000;

var express = require('express');
var app = express();
var secondsCnt = 0, outCnt = 0, totalSent = 0;
var bReplay = false;

function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function pushIntoQueue(item) {
    setTimeout( function() {
        item.res.send('Hello!');
        outCnt ++;
        totalSent++;
    },  getRandomBetween(150, 500));
}

app.get('/*', function (req, res) {
    bReplay = true;
    pushIntoQueue({'req':req, 'res':res});
});

app.listen(port, '127.0.0.1', function () {
    console.log('Test-server listening on port %d!', port);
});

setInterval(function() {
    if( bReplay ) {
        secondsCnt++;
        if( outCnt > 0 ) {
            console.log("\n\t\tExpress: %d responses sent at %d seconds by server. (totalSent: %d)\n",
                outCnt, secondsCnt, totalSent);

            outCnt = 0;
        }
    }
}, 1000);


