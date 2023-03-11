#!/bin/bash
LIMIT=4
for i in $(seq 1 $LIMIT)
do
    curl --request GET --url http://localhost:3001/api/redis-limit
    echo -e "\n";
done
