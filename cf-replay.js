/*
*      nodejs script cf-replay: read cloudfront log and replay a time span of requests
*
*      take two jsonDates (startDate and endDate), scan s3 bucket for matching dates
*      (determined by log filename). Retrieve all matching files, unzip them, scan through
*      the file contents, and "replay" requests that fall within startDate and endDate
*/

var reader = require('cloudfront-log-reader');
var s3scan = require('s3scan');
var keepalive = require('agentkeepalive');
var split = require('split');
var konphyg = require('konphyg')(__dirname + '/config');
var _ = require('underscore');

if ( process.argv.length < 3 ) {
    console.log('Syntax: node cf-replay.js <config-key>');
    process.exit(1);
}

try {
    var config = konphyg(process.argv[2]);

    if( !config.bucketName ) throw "Invalid config file: missing Amazon S3 'bucketName'";
    if( !config.bucketPath ) throw "Invalid config file: missing Amazon S3 'bucketPath' (if there is no sub-folder(s), just put an empty string value)";
    if( !config.requestTimeout ) throw "Invalid config file: missing 'requestTimeout' numeric value";
    if( typeof config.keepAlive != "boolean" ) throw "Invalid config file: missing 'keepAlive' boolean value";
    if( !config.startTime ) throw "Invalid config file: missing 'startTime' (use JSONDate format)'";
    if( !config.endTime ) throw "Invalid config file: missing 'endTime' (use JSONDate format)'";
    if( !config.speedupFactor) throw "Invalid config file: missing 'speedupFactor'";
    if( !config.target ) throw "Invalid config file: missing 'target'";
    else {
        if ( !config.target.host ) throw "Invalid config file: missing 'target.host'";
        if ( !config.target.port ) throw "Invalid config file: missing 'target.port'";
    }
} catch (e) {
    console.log('\t' + e + '\n');
    console.log('\tSyntax: node cf-replay.js <config-key>');
    process.exit(1);
}

var startDate = new Date(config.startTime),
    endDate = new Date(config.endTime);

if( startDate.toJSON() == null || endDate.toJSON() == null ) {
    console.log("\n\tNull date detected, is your jsonDate formatting correct?\n");
    JSONDateHelp();
    process.exit(2);
}
else if( startDate > endDate ) {
    console.log('\n\tYour start date is later than your end date. Please adjust.\n');
    process.exit(3);
}

console.log("Start Date: %s", startDate.toJSON());
console.log("End Date..: %s", endDate.toJSON());

function listFiles(uri, callback) {
    var found = [];

    var agent = new keepalive.HttpsAgent({
        keepAlive: true,
        keepAliveTimeout: 60000
    });

    s3scan.List(uri, {agent: agent})
        .on('error', function errorFunction(err) {
            console.log('Error retrieving S3 bucket list: %s', JSON.stringify(err));
        })
        .on('data', function dataFunction(keys) {
            keys = keys.toString().trim();
            keys.split('\n').forEach(function (key) {
                found.push(key);
            });
        })
        .on('end', function endFunction() {
            callback(found);
        });
}

/*
*  CloudFront Log File Name Format:
*  The name of each log file that CloudFront saves in your Amazon S3 bucket uses the following file name format:
*  distribution-ID.YYYY-MM-DD-HH.unique-ID.gz
*/

function cloudFrontFileDate(filename) {
    var d = null,
        parts = filename.split('.');

    if( parts.length < 4 ) {
        throw ("cloudFrontFileDate function expects a filename separated by a 4 dots.\nGot: " + filename);
    }
    else {
        var dparts = parts[1].split('-');
        if( dparts.length < 4 ) {
            throw ("cloudFrontFileDate function expects part[1] to be YYYY-MM-DD-HH.\nGot: " + parts[1]);
        }
        else {
            var jsonDate = dparts[0] + '-' + dparts[1] + '-' + dparts[2] + "T" + dparts[3] + ":00:00.000Z";
            return new Date(jsonDate);
        }
    }
}

function filterFileListByDate(found) {
    var s = new Date(startDate.toJSON()).setUTCMinutes(0, 0, 0);
    var e = new Date(endDate.toJSON()).setUTCMinutes(59, 59, 999);
    var files = [];

    console.log('-------');
    found.forEach(function(key) {
        try {
            var d = cloudFrontFileDate(key);
            var b =  (d >= s && d <= e);
            console.log('File %s (%s)', key, (b ? "in range" : "skip this file"));
            if( b ) files.push(key);
        }
        catch(err) {
            console.trace(err);
        }
    });

    processResults(files);
}

function createLogObject(date, parts) {
    var obj = {};

    obj["date"] = date;
    obj["x-edge-location"] = parts[2];
    obj["bytes"] = parts[3];
    obj["method"] = parts[5];
    obj["host"] = parts[6];
    obj["uri-stem"] = parts[7];
    obj["status"] = parts[8];
    obj["uri-query"] = parts[12];
    obj["x-edge-result-type"] = parts[13];
    obj["protocol"] = parts[16];
    obj["time-taken"] = parts[18];
    obj["x-edge-response-result-type"] = parts[22];

    return obj;
}

// Each CloudFront log line contains 23 tab-separated parts
// See: http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html

function processResults(keys) {
    var results = [];
    var totalRecords = 0, totalStreams = 0;

    console.log('');
    keys.forEach(function(key) {
        console.log("Processing: %s", key);
        totalStreams++;
        reader.LogStream('s3://' + config.bucketName + '/' + key)
            .pipe(split())
            .on('data', function(data) {
                var parts = data.split(/\s+/g);
                delete data;
                if( parts.length < 23 ) {
                    delete parts;
                    return;
                }
                var jsonDate = parts[0] + "T" + parts[1] + ".000Z";
                var d = new Date(jsonDate);
                if( d.toJSON() == null ) return;
                else if(d >= startDate && d <= endDate) {

                    var i = parts.length;

                    while(i--) {
                        var key = "RegExpPart" + (i + 1);
                        if( typeof(config[key]) == "object" ) {
                            var regexp = new RegExp(config[key].regexp, 'i');
                            if( parts[i].match(regexp) == null ) return;
                        }
                    }

                    results.push(createLogObject(d, parts));
                }
                delete parts;
            })
            .on('error', function(err) {
                console.log(JSON.stringify(err));
                totalStreams--;
            })
            .on('end', function() {
                console.log("Finished processing %s...", key);
                totalRecords += results.length;
                if( totalStreams ) totalStreams--;
                if( !totalStreams ) {
                    console.log("\nCompleted reading all s3 streams, total of %d logs fit date-time span supplied.", totalRecords);
                    replayResults(results);
                }
            });
    });
}

var http = require('http');

http.globalAgent.keepAlive = config.keepAlive;
http.globalAgent.keepAliveMsecs = config.requestTimeout;

var totalRequests = 0,
    totalResponses = 0,
    totalErrors = 0,
    totalMilliseconds = 0;

var interval = null;

var statSet = [];

function replayResults(results) {
    var dtStart = Date.now();
    var dtDuration = 0;

    results = _.sortBy(results, 'date');

    if( results.length < 1 ) return;

    dtStart = results[0].date;

    console.log('Calculating execution order and offset...');

    var requestSet = [];

    for(x = 0; x < results.length; x++) {
        var data = results[x];

        // Calculate # of seconds past start we should fire request
        var offset = Math.round(((data.date - dtStart) / 1000)  / config.speedupFactor);

        if (offset > dtDuration) dtDuration = offset;

        if ( typeof requestSet[offset] == 'undefined' ) {
            requestSet[offset] = [];
        }

        totalRequests ++;
        requestSet[offset].push(data);
    }

    console.log('\nrequestSet array contains %d parts', requestSet.length);

    console.log("Executing...\n\n");

    var timings = [];
    var reqSeq = 0;
    var execStart = Date.now();

    interval = setInterval(function() {

        // Determine how much time has passed
        var runOffsetMS = (Date.now() - execStart);
        var runOffset = Math.round(runOffsetMS / 1000);

        // Have we got some requests to fire?
        if ( typeof requestSet[runOffset] != 'undefined' ) {
            var first = requestSet[runOffset][0];

            statSet[runOffset] = {
                'runOffset' : runOffset,
                'totalSent' : 0,
                'requestSent' : 0,
                'averageTime': 0,
                'responseReceived' : [],
                'timeouts' : 0
            };

            console.log('\n* ['+new Date(first.date)+'] '+requestSet[runOffset].length+' requests sent from replay tool.\n' );

            // Send all requests that occurred in this second according to logfile

            requestSet[runOffset].forEach(function(item){
                var reqNum = reqSeq ++;

                var req = http.request({
                        host: config.target.host,
                        port: config.target.port,
                        path: item["uri-stem"],
                        method: item.method,
                        reqStart: new Date().getTime(),
                    },
                    function(resp) {}
                    )
                    .on('error', function(err) {
                        var diff = (new Date().getTime()) - timings[reqNum];
                        console.log('ERROR ON - #' + reqNum + ' [path = ' + item["uri-stem"] + '] [DT=' + diff + 'ms]');
                        console.log(err);

                        totalErrors++;
                        incrementTotals(0);
                        updateStats(runOffset, 0, true, 0);

                        exitIfDone();
                    })
                    .on('socket', function(socket) {
                        socket.setTimeout(20 * 1000);
                        socket.on('timeout', function() {
                            req.abort();
                        });
                        timings[reqNum] = new Date().getTime();
                    })
                    .on('response', function(resp) {
                        var diff = (new Date().getTime()) - timings[reqNum];
                        incrementTotals(diff);
                        updateStats(runOffset, diff, false, resp.statusCode);
                        console.log(' - #' + reqNum + ' [path = ' + item["uri-stem"] + '] [DT=' + diff + 'ms, R=' + resp.statusCode + ']');

                        exitIfDone();
                    });

                req.end();
            });

            // Discard the request info so we don't process it again
            delete requestSet[runOffset];
        }

    }, 100);

}

function incrementTotals(diff) {
    totalMilliseconds += diff;
    totalResponses++;
}

function updateStats(runOffset, timeTaken, timeout, status) {
    var s = statSet[runOffset];

    s.requestSent++;
    if( timeout ) s.timeouts ++;
    if( timeTaken > 0) {
        s.totalSent += timeTaken;
        s.averageTime = s.totalSent  / (s.requestSent - s.timeouts);
    }

    if( _.indexOf(s.responseReceived, status) == -1 )
        s.responseReceived.push(status);
}

var fs = require('fs');
var printf = require('util').format;

function exitIfDone() {
    if (totalResponses >= totalRequests) {
        var average = totalMilliseconds / (totalResponses - totalErrors);
        var log_file = (typeof(config.resultsFile) == "string" && config.resultsFile.length > 0);
        var wstream = null;

        clearInterval(interval);

        if( log_file)  {
            try {
                wstream = fs.createWriteStream(config.resultsFile);
                console.log('\n\t' + config.resultsFile + ' created for logging output.');
            }
            catch(err) {
                console.trace(err);
            }
        }

        var totals = printf("Totals :  requests (%d), responses (%d), http errors (%d), average response time: %d ms.\n",
                        totalRequests, totalResponses, totalErrors, average.toFixed(2));

        if( log_file )
            wstream.write(totals);
        else
            console.log('\n' + totals);

        statSet = _.sortBy(statSet, 'runOffset');

        Object.keys(statSet).forEach(function(key) {
            var s = statSet[key];

            if( typeof s == "undefined") return;

            var line =  printf('second %d: %d requests - average time: %d ms, timeouts: %d, responses received: %s',
                            key, s.requestSent, s.averageTime.toFixed(2), s.timeouts, JSON.stringify(s.responseReceived));

            if( log_file )
                wstream.write(line + '\n');
            else
                console.log(line);

        });

        if( log_file ) {
            wstream.end();
            console.log('\n\t' + config.resultsFile + ' closed.');
        }
    }
}

function JSONDateHelp() {
    console.log('\t-----');
    console.log("\tjsonDate format example : 2016-03-01T08:15:00.123Z\n");
    console.log("\tReference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON\n");
}


// start everything off here...
listFiles('s3://' + config.bucketName + '/' + config.bucketPath, filterFileListByDate);