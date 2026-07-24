#!/bin/bash

echo "Setting up aws environment"

eval $(floci env)

docker rm floci

docker run -d \
  --name floci \
  -p 4566:4566 \
  -p 7001-7099:7001-7099 \
  -p 6379-6399:6379-6399 \
  -p 9092-9199:9092-9199 \
  -v floci-data:/app/data \
  -v /var/run/docker.sock:/var/run/docker.sock \
  floci/floci:latest

floci start

aws s3 mb s3://ticketly-tickets

aws rds create-db-instance   --db-instance-identifier ticketly-db   --db-instance-class db.t3.micro   --engine postgres   --master-username postgres   --master-user-password postgres   --allocated-storage 20   --db-name ticketly-db --engine-version 17

aws elasticache create-replication-group   --replication-group-id ticketly-redis   --replication-group-description "Ticketly Redis"   --engine redis   --cache-node-type cache.t3.micro   --num-node-groups 1   --replicas-per-node-group 0
