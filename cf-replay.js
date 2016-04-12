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

    if (!config.bucketName) throw "Invalid config file: missing Amazon S3 'bucketName'";
    if (!config.bucketPath) throw "Invalid config file: missing Amazon S3 'bucketPath' (if there is no sub-folder(s), just put an empty string value)";

    if( !config.startTime )throw "Invalid config file: missing 'startTime' (use JSONDate format)'";
    if( !config.endTime )throw "Invalid config file: missing 'endTime' (use JSONDate format)'";

    if (!config.speedupFactor) throw "Invalid config file: missing 'speedupFactor'";
    if (!config.target) throw "Invalid config file: missing 'target'";
    else {
        if (!config.target.host) throw "Invalid config file: missing 'target.host'";
        if (!config.target.port) throw "Invalid config file: missing 'target.port'";
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

var agent = new keepalive.HttpsAgent({
    keepAlive: true,
    maxSockets: Math.ceil(require('os').cpus().length * 16),
    keepAliveTimeout: 60000
});

function listFiles(uri, callback) {
    found = [];
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
*  CloudFront Log File Name Format
*
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
            // create a jsonDate string
            var jsonDate = dparts[0] + '-' + dparts[1] + '-' + dparts[2] + "T" + dparts[3] + ":00:00.000Z";
            d = new Date(jsonDate);
            return d;
        }
    }
}

function filterFileListByDate(found) {
    var s = new Date(startDate.toJSON()),
        e = new Date(endDate.toJSON()),
        files = [];

    console.log('-------');

    // manipulate startDate and endDate to cover entire hour, as the filename only contains hour
    s.setUTCMinutes(0, 0, 0);
    e.setUTCMinutes(59, 59, 999);

    found.forEach(function(key) {
        var d = null;
        try {
            d = cloudFrontFileDate(key);
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
        var offset = Math.round((data.date - dtStart) / 1000);

        if (offset > dtDuration) dtDuration = offset;

        if ( typeof requestSet[offset] == 'undefined' ) {
            requestSet[offset] = [];
        }

        requestSet[offset].push(data);
    }

    console.log('\nrequestSet array contains %d parts', requestSet.length);

    console.log("Executing...\n\n");

    var timings = [];
    var reqSeq = 0;
    var execStart = Date.now();

    var interval = setInterval(function() {

        // Determine how much time has passed
        var runOffsetMS = (Date.now() - execStart);
        var runOffset = Math.round(runOffsetMS / 1000);

        // Is the test over yet?
        if ( runOffset > dtDuration ) {
            clearInterval(interval);
        }

        // Have we got some requests to fire?
        if ( typeof requestSet[runOffset] != 'undefined' ) {
            var first = requestSet[runOffset][0];
            console.log('['+new Date(first.date)+'] '+requestSet[runOffset].length+' Requests' );

            // Send all requests that occurred in this second according to logfile

            requestSet[runOffset].forEach(function(item){
                var reqNum = reqSeq ++;

                var req = http.request({
                        host: config.target.host,
                        port: config.target.port,
                        path: item["uri-stem"],
                        method: item.method,
                        reqStart: new Date().getTime(),
                        agent: false
                    },
                    function(resp) {}
                    )
                    .on('socket', function() { timings[reqNum] = new Date().getTime(); })
                    .on('response', function(resp) {
                        var diff = (new Date().getTime()) - timings[reqNum];
                        console.log(' - #' + reqNum + ' [DT=' + diff + 'ms, R=' + resp.statusCode + ']'); }
                    );

                req.end();
            });

            // Discard the request info so we don't process it again
            delete requestSet[runOffset];
        }

    }, 100);

}

listFiles('s3://' + config.bucketName + '/' + config.bucketPath, filterFileListByDate);

function JSONDateHelp() {
    console.log('\t-----');
    console.log("\tjsonDate format example : 2016-03-01T08:15:00.123Z\n");
    console.log("\tReference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON\n");
}