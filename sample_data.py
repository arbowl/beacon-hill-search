import duckdb, json

db = r"c:\Users\andrew.bowler\Downloads\beacon-hill-archive\bill_artifacts.db"
con = duckdb.connect(db, read_only=True)

def show(label, sql):
    rows = con.execute(sql).fetchall()
    cols = [d[0] for d in con.description]
    print(f"\n=== {label} ===")
    for row in rows:
        for k, v in zip(cols, row):
            val = str(v)[:200] if v else None
            print(f"  {k}: {val}")
        print("  ---")

# Sample bills
show("bill_artifacts sample", "SELECT * FROM bill_artifacts LIMIT 2")

# bill_metadata JSON sample
rows = con.execute("SELECT bill_metadata FROM bill_artifacts LIMIT 3").fetchall()
print("\n=== bill_metadata JSON ===")
for (m,) in rows:
    try:
        d = json.loads(m) if m else {}
        print(json.dumps(d, indent=2)[:1000])
    except:
        print(m[:500] if m else None)
    print("---")

# snapshot computed_state
show("artifact_snapshots sample", "SELECT * FROM artifact_snapshots LIMIT 2")

rows = con.execute("SELECT computed_state, computed_reason, computation_metadata FROM artifact_snapshots LIMIT 2").fetchall()
print("\n=== snapshot JSON fields ===")
for row in rows:
    for v in row:
        try:
            print(json.dumps(json.loads(v), indent=2)[:800] if v else None)
        except:
            print(str(v)[:300] if v else None)
    print("---")

# timeline actions
show("timeline_actions sample", "SELECT * FROM timeline_actions LIMIT 3")

rows = con.execute("SELECT extracted_data FROM timeline_actions LIMIT 3").fetchall()
print("\n=== timeline extracted_data JSON ===")
for (v,) in rows:
    try:
        print(json.dumps(json.loads(v), indent=2)[:600] if v else None)
    except:
        print(str(v)[:300] if v else None)
    print("---")

# hearing records
show("hearing_records sample", "SELECT * FROM hearing_records LIMIT 2")

rows = con.execute("SELECT announcement_metadata FROM hearing_records WHERE announcement_metadata IS NOT NULL LIMIT 2").fetchall()
print("\n=== hearing announcement_metadata JSON ===")
for (v,) in rows:
    try:
        print(json.dumps(json.loads(v), indent=2)[:600] if v else None)
    except:
        print(str(v)[:300] if v else None)
    print("---")

# document_index
show("document_index sample", "SELECT reference_id, bill_id, session, committee_id, document_type, source_url, bill_title, preview, needs_review FROM document_index LIMIT 2")

# document_artifacts
show("document_artifacts sample", "SELECT document_id, artifact_id, document_type, source_url, content_preview, needs_review FROM document_artifacts LIMIT 2")

# distinct sessions, action types, categories
print("\n=== distinct sessions ===")
for (v,) in con.execute("SELECT DISTINCT session FROM bill_artifacts ORDER BY session").fetchall():
    print(f"  {v}")

print("\n=== distinct action_type ===")
for (v,) in con.execute("SELECT DISTINCT action_type FROM timeline_actions ORDER BY action_type").fetchall():
    print(f"  {v}")

print("\n=== distinct category ===")
for (v,) in con.execute("SELECT DISTINCT category FROM timeline_actions ORDER BY category").fetchall():
    print(f"  {v}")

print("\n=== distinct document_type (document_index) ===")
for (v,) in con.execute("SELECT DISTINCT document_type FROM document_index ORDER BY document_type").fetchall():
    print(f"  {v}")

con.close()
print("\nDone.")
