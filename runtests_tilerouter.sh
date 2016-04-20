#!/bin/bash

node cf-replay.js td_tilerouter  5 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:25\:00.000Z  results/td_tilerouter_speed_5_minutes_5.csv
sleep 5
node cf-replay.js td_tilerouter 10 2016-03-01T00\:00\:00.000Z 2016-03-01T00\:50\:00.000Z results/td_tilerouter_speed_10_minutes_5.csv
sleep 10
node cf-replay.js td_tilerouter 15 2016-03-01T00\:00\:00.000Z 2016-03-01T01\:15\:00.000Z results/td_tilerouter_speed_15_minutes_5.csv
sleep 15
node cf-replay.js td_tilerouter 20 2016-03-01T00\:00\:00.000Z 2016-03-01T01\:40\:00.000Z results/td_tilerouter_speed_20_minutes_5.csv
sleep 20
node cf-replay.js td_tilerouter 22 2016-03-01T00\:00\:00.000Z 2016-03-01T01\:40\:00.000Z results/td_tilerouter_speed_22_minutes_5.csv
sleep 22
node cf-replay.js td_tilerouter 25 2016-03-01T00\:00\:00.000Z 2016-03-01T02\:05\:00.000Z results/td_tilerouter_speed_25_minutes_5.csv
sleep 25
node cf-replay.js td_tilerouter 27 2016-03-01T00\:00\:00.000Z 2016-03-01T02\:05\:00.000Z results/td_tilerouter_speed_27_minutes_5.csv
sleep 27
node cf-replay.js td_tilerouter 30 2016-03-01T00\:00\:00.000Z 2016-03-01T02\:30\:00.000Z results/td_tilerouter_speed_30_minutes_5.csv
sleep 30
node cf-replay.js td_tilerouter 32 2016-03-01T00\:00\:00.000Z 2016-03-01T02\:30\:00.000Z results/td_tilerouter_speed_32_minutes_5.csv
sleep 30
node cf-replay.js td_tilerouter 35 2016-03-01T00\:00\:00.000Z 2016-03-01T02\:55\:00.000Z results/td_tilerouter_speed_35_minutes_5.csv
sleep 35
node cf-replay.js td_tilerouter 37 2016-03-01T00\:00\:00.000Z 2016-03-01T02\:55\:00.000Z results/td_tilerouter_speed_37_minutes_5.csv
sleep 35
node cf-replay.js td_tilerouter 40 2016-03-01T00\:00\:00.000Z 2016-03-01T03\:20\:00.000Z results/td_tilerouter_speed_40_minutes_5.csv
sleep 40
node cf-replay.js td_tilerouter 42 2016-03-01T00\:00\:00.000Z 2016-03-01T03\:20\:00.000Z results/td_tilerouter_speed_42_minutes_5.csv
sleep 42
node cf-replay.js td_tilerouter 45 2016-03-01T00\:00\:00.000Z 2016-03-01T03\:45\:00.000Z results/td_tilerouter_speed_45_minutes_5.csv
sleep 45
node cf-replay.js td_tilerouter 47 2016-03-01T00\:00\:00.000Z 2016-03-01T03\:45\:00.000Z results/td_tilerouter_speed_47_minutes_5.csv
sleep 47
node cf-replay.js td_tilerouter 50 2016-03-01T00\:00\:00.000Z 2016-03-01T04\:10\:00.000Z results/td_tilerouter_speed_50_minutes_5.csv
sleep 50
node cf-replay.js td_tilerouter 55 2016-03-01T00\:00\:00.000Z 2016-03-01T04\:35\:00.000Z results/td_tilerouter_speed_55_minutes_5.csv
sleep 55
node cf-replay.js td_tilerouter 60 2016-03-01T00\:00\:00.000Z 2016-03-01T05\:00\:00.000Z results/td_tilerouter_speed_60_minutes_5.csv
sleep 60
node cf-replay.js td_tilerouter 65 2016-03-01T00\:00\:00.000Z 2016-03-01T05\:25\:00.000Z results/td_tilerouter_speed_65_minutes_5.csv
sleep 65
node cf-replay.js td_tilerouter 70 2016-03-01T00\:00\:00.000Z 2016-03-01T05\:50\:00.000Z results/td_tilerouter_speed_70_minutes_5.csv

#sleep 65