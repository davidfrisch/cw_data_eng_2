#!/bin/bash

python3 /app/pipeline/db.py
prefect server start --host 0.0.0.0
