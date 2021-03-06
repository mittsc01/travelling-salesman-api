CREATE TABLE ts_points (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  lat TEXT NOT NULL,
  lng TEXT NOT NULL,
  index INTEGER NOT NULL,
  route_id INTEGER
    REFERENCES ts_routes(id) ON DELETE CASCADE NOT NULL,
  date_created TIMESTAMP DEFAULT now() NOT NULL,
  date_modified TIMESTAMP
);