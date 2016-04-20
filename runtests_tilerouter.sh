#!/bin/bash

node cf-replay.js td_tilerouter  5 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z  results/td_tilerouter_speed_5_minutes_60.csv
sleep 5
node cf-replay.js td_tilerouter 10 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_10_minutes_60.csv
sleep 10
node cf-replay.js td_tilerouter 15 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_15_minutes_60.csv
sleep 15
node cf-replay.js td_tilerouter 20 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_20_minutes_60.csv
sleep 20
node cf-replay.js td_tilerouter 25 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_25_minutes_60.csv
sleep 25
node cf-replay.js td_tilerouter 30 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_30_minutes_60.csv
sleep 30
node cf-replay.js td_tilerouter 35 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_35_minutes_60.csv
sleep 35
node cf-replay.js td_tilerouter 40 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_40_minutes_60.csv
sleep 40
node cf-replay.js td_tilerouter 45 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_45_minutes_60.csv
sleep 45
node cf-replay.js td_tilerouter 50 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_50_minutes_60.csv
sleep 50
node cf-replay.js td_tilerouter 55 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_55_minutes_60.csv
sleep 55
node cf-replay.js td_tilerouter 60 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_60_minutes_60.csv
sleep 60
node cf-replay.js td_tilerouter 60 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:01\:00.000Z results/td_tilerouter_speed_60_minutes_60.csv
#sleep 65