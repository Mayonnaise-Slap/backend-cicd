#!/bin/bash
# call before building postgres to init users and databases for the services. Used to not expose secrets
set -e

envsubst < /docker-entrypoint-initdb.d/init-database.sql.template > /docker-entrypoint-initdb.d/init-database.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/init-database.sql
