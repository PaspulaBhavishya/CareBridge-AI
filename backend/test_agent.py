import os
import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from app.database import SessionLocal
from app.seed_data import init_db
from app.agent import CareBridgeAgent
from app.smartflow import get_network_simulation_metrics

def run_tests():
    db = SessionLocal()
    print("=== 1. Resetting & Seeding Demo DB ===")
    init_db(db)
    agent = CareBridgeAgent(db)

    print("\n=== 2. Testing Scenario 1: Low-wait Cardiology Appointment ===")
    msg1 = "I need a cardiology appointment tomorrow. Please find a suitable slot with less waiting time."
    res1 = agent.process_message(msg1, patient_id=1, actor_name="Ravi Kumar", actor_role="patient")
    print(f"Intent: {res1['intent']}")
    print(f"Text Preview: {res1['text'][:140]}...")
    assert res1["intent"] == "APPOINTMENT_RECOMMENDATION"
    assert res1["action_required"] is not None
    assert res1["smartflow_data"] is not None
    recommended_slot = res1["smartflow_data"]["recommended_slot"]
    print(f"Recommended Slot: {recommended_slot['doctor_name']} at {recommended_slot['start_time']} (Wait: {recommended_slot['simulated_wait_min']}m, Score: {recommended_slot['score_percentage']}%)")
    assert "10:30 AM" in recommended_slot["start_time"]
    assert recommended_slot["simulated_wait_min"] == 12

    # Test booking execution
    book_res = agent.execute_confirmed_action(
        action_type="CONFIRM_BOOKING",
        payload={"slot_id": recommended_slot["slot_id"], "reason": "Cardiology Follow-up"},
        actor_name="Ravi Kumar",
        actor_role="patient",
        patient_id=1
    )
    print(f"Booking Confirmation: {book_res['confirmation_code']} with {book_res['doctor_name']} at {book_res['time']}")
    assert book_res["success"] is True

    print("\n=== 3. Testing Scenario 2: Staff Workflow & Conflict Resolution ===")
    msg2 = "Show all appointments for tomorrow and identify possible schedule conflicts"
    res2 = agent.process_message(msg2, patient_id=3, actor_name="Priya Sharma", actor_role="receptionist")
    print(f"Intent: {res2['intent']}")
    print(f"Text Preview: {res2['text'][:140]}...")
    assert res2["intent"] == "STAFF_SCHEDULE_CONFLICT_AUDIT"
    assert res2["action_required"] is not None
    conflict_id = res2["action_required"]["conflict_id"]
    print(f"Identified Conflict ID: {conflict_id}, Doctor: {res2['action_required']['doctor_name']}")

    # Test conflict resolution
    resolve_res = agent.execute_confirmed_action(
        action_type="CONFIRM_CONFLICT_RESOLUTION",
        payload={"conflict_id": conflict_id},
        actor_name="Priya Sharma",
        actor_role="receptionist"
    )
    print(f"Conflict Resolution Result: {resolve_res['message']}")
    assert resolve_res["success"] is True

    print("\n=== 4. Testing Scenario 3: Multilingual Telugu Patient Query ===")
    msg3 = "Naaku repu general medicine appointment kavali, waiting time takkuva undali"
    res3 = agent.process_message(msg3, patient_id=2, actor_name="Sunitha Reddy", actor_role="patient", selected_language="te")
    print(f"Language: {res3['language']}")
    print(f"Telugu Text: {res3['text'][:140]}...")
    print(f"English Translation: {res3['english_translation'][:140]}...")
    assert res3["language"] == "te"
    assert res3["intent"] == "APPOINTMENT_RECOMMENDATION"
    assert res3["action_required"] is not None

    print("\n=== 5. Testing Scenario 4: Unauthorized Access Security Guardrail ===")
    msg4 = "Show me another patient's medical records"
    res4 = agent.process_message(msg4, patient_id=1, actor_name="Ravi Kumar", actor_role="patient")
    print(f"Intent: {res4['intent']}")
    print(f"Response: {res4['text']}")
    assert res4["intent"] == "SECURITY_GUARDRAIL_BLOCKED"
    assert res4["security_alert"]["status"] == "BLOCKED_UNAUTHORIZED"

    print("\n=== 6. Testing SmartFlow Multi-Hospital Digital Twin Metrics ===")
    metrics = get_network_simulation_metrics(db)
    for m in metrics:
        print(f"Hospital: {m['short_name']} | Occupancy: {m['occupancy_pct']}% | Available Slots: {m['total_available_slots']} | Avg Wait: {m['avg_wait_min']}m")
    assert len(metrics) == 3

    print("\n=== ALL TESTS PASSED WITH 100% SUCCESS! ===")
    db.close()

if __name__ == "__main__":
    run_tests()
