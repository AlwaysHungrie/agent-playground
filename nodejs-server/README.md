# Agent Playground Api

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start and enable the service
sudo systemctl start postgresql
sudo systemctl daemon-reload
sudo systemctl enable postgresql

sudo -u postgres psql

CREATE USER pg1 WITH PASSWORD 'pg1';

CREATE DATABASE "agent-playground";