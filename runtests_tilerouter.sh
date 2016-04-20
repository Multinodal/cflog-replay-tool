#!/bin/bash

node cf-replay.js tilerouter  5 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z  results/tilerouter_speed_5_minutes_60.csv
pause 5
node cf-replay.js tilerouter 10 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_10_minutes_60.csv
pause 10
node cf-replay.js tilerouter 15 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_15_minutes_60.csv
pause 15
node cf-replay.js tilerouter 20 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_20_minutes_60.csv
pause 20
node cf-replay.js tilerouter 25 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_25_minutes_60.csv
pause 25
node cf-replay.js tilerouter 30 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_30_minutes_60.csv
pause 30
node cf-replay.js tilerouter 35 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_35_minutes_60.csv
pause 35
node cf-replay.js tilerouter 40 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_40_minutes_60.csv
pause 40
node cf-replay.js tilerouter 45 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_45_minutes_60.csv
pause 45
node cf-replay.js tilerouter 50 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_50_minutes_60.csv
pause 50
node cf-replay.js tilerouter 55 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_55_minutes_60.csv
pause 55
node cf-replay.js tilerouter 60 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_60_minutes_60.csv
pause 60
node cf-replay.js tilerouter 60 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:59\:00.000Z results/tilerouter_speed_60_minutes_60.csv
#pause 65