import duckdb

db = r"c:\Users\andrew.bowler\Downloads\beacon-hill-archive\bill_artifacts.db"
con = duckdb.connect(db, read_only=True)

# List all tables
tables = con.execute(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='main'"
).fetchall()
print("=== TABLES ===")
for t in tables:
    print(t[0])

# For each table: columns and row count
for t in tables:
    name = t[0]
    cols = con.execute(
        f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='{name}'"
    ).fetchall()
    print(f"\n=== {name} (columns) ===")
    for c in cols:
        print(f"  {c[0]}: {c[1]}")
    try:
        n = con.execute(f'SELECT COUNT(*) FROM "{name}"').fetchone()[0]
        print(f"  -> {n} rows")
    except Exception as e:
        print(f"  -> (count error: {e})")

# Sample a few rows from first table if any
if tables:
    first = tables[0][0]
    print(f"\n=== Sample rows from '{first}' (limit 3) ===")
    sample = con.execute(f'SELECT * FROM "{first}" LIMIT 3').fetchdf()
    print(sample.to_string())

con.close()
