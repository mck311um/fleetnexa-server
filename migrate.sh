#!/bin/bash
name=$(date +%H%M%S)
npx prisma migrate dev --name "$name" && npx prisma generate