#!/bin/bash

node cf-replay.js testname  5 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z  results/testname_speed_5_minutes_60.csv
sleep 5
node cf-replay.js testname 10 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_10_minutes_60.csv
sleep 10
node cf-replay.js testname 15 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_15_minutes_60.csv
sleep 15
node cf-replay.js testname 20 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_20_minutes_60.csv
sleep 20
node cf-replay.js testname 25 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_25_minutes_60.csv
sleep 25
node cf-replay.js testname 30 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_30_minutes_60.csv
sleep 30
node cf-replay.js testname 35 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_35_minutes_60.csv
sleep 35
node cf-replay.js testname 40 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_40_minutes_60.csv
sleep 40
node cf-replay.js testname 45 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_45_minutes_60.csv
sleep 45
node cf-replay.js testname 50 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_50_minutes_60.csv
sleep 50
node cf-replay.js testname 55 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_55_minutes_60.csv
sleep 55
node cf-replay.js testname 60 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_60_minutes_60.csv
sleep 60
node cf-replay.js testname 60 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/testname_speed_60_minutes_60.csv
#sleep 65