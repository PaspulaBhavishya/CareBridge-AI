import sqlite3

conn = sqlite3.connect('backend/app/carebridge.db')
cur = conn.cursor()
tables = [r[0] for r in cur.execute("SELECT tbl_name FROM sqlite_master WHERE type='table'").fetchall()]
for t in tables:
    cols = [c[1] for c in cur.execute(f"PRAGMA table_info({t})").fetchall()]
    for c in cols:
        try:
            hits = cur.execute(f"SELECT count(*) FROM {t} WHERE cast({c} as text) LIKE '%Anil%'").fetchone()[0]
            if hits > 0:
                print(f"{t}.{c}: {hits} matches")
        except Exception as e:
            pass
