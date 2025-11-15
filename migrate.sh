#!/bin/bash
timestamp=$(date +%Y%m%d%H%M%S)
npx prisma migrate dev --name "$timestamp"  && npx prisma generate