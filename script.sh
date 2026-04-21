

docker exec -it smart-season-field-monitoring-db-1 bash &&
psql -U postgres -d smart_season
select * from fields;
select * from users;
pnpm drizzle-kit generate --config=src/config/drizzle-config.ts
pnpm drizzle-kit push --config=src/config/drizzle-config.ts







