import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(DATABASE_DIR, 'carebridge.db')}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def migrate_db():
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            # Check existing columns in appointments table
            result = conn.execute(text("PRAGMA table_info(appointments)")).fetchall()
            existing_cols = [row[1] for row in result]
            
            new_columns = [
                ("clinical_soap_notes", "TEXT"),
                ("prescription_json", "TEXT"),
                ("follow_up_date", "VARCHAR(50)"),
                ("vitals_json", "TEXT"),
                ("simulation_mode", "BOOLEAN DEFAULT 1"),
            ]
            for col_name, col_type in new_columns:
                if col_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE appointments ADD COLUMN {col_name} {col_type}"))
                    conn.commit()

            # Check schedule_slots table
            slot_res = conn.execute(text("PRAGMA table_info(schedule_slots)")).fetchall()
            slot_cols = [row[1] for row in slot_res]
            if "simulation_mode" not in slot_cols:
                conn.execute(text("ALTER TABLE schedule_slots ADD COLUMN simulation_mode BOOLEAN DEFAULT 1"))
                conn.commit()
        except Exception as e:
            print("DB migration check note:", e)
    Base.metadata.create_all(bind=engine)

migrate_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

