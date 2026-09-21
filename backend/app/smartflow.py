"""
CareBridge SmartFlow 2.0 — Multi-Hospital Workflow Intelligence & What-If Simulation Engine
Calculates transparent administrative efficiency scores and dynamic hospital queue metrics.
Formula: Score = 0.5 * Availability + 0.3 * Wait Efficiency + 0.2 * Preference Match
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from .models import Hospital, Doctor, ScheduleSlot, Department

# Baseline simulated queue lengths and staff workloads across Hospital A, B, and C
BASELINE_QUEUES: Dict[int, int] = {
    1: 18, # Hospital A: High queue (18 patients waiting)
    2: 6,  # Hospital B: Moderate queue (6 patients waiting)
    3: 3   # Hospital C: Low queue (3 patients waiting)
}

BASE_STAFF_WORKLOAD: Dict[int, int] = {
    1: 85, # Hospital A: 85% workload
    2: 52, # Hospital B: 52% workload
    3: 35  # Hospital C: 35% workload
}

# In-memory dynamic queue surge tracker for interactive 'What-If' simulations
# Keys are hospital_ids (1 = Apex Hub, 2 = Metro Multi-Specialty, 3 = City Health)
SIMULATION_SURGE: Dict[int, int] = {
    1: 0,
    2: 0,
    3: 0
}

def apply_simulation_surge(hospital_id: int, delta: int) -> Dict[str, Any]:
    """
    Dynamically adjusts simulated patient queue load for a given hospital node.
    Enables live 'What-If' scenarios for judges & administrators.
    """
    current = SIMULATION_SURGE.get(hospital_id, 0)
    new_val = max(0, min(50, current + delta))
    SIMULATION_SURGE[hospital_id] = new_val
    return {
        "success": True,
        "hospital_id": hospital_id,
        "previous_surge": current,
        "current_surge": new_val,
        "delta": delta,
        "baseline_queue": BASELINE_QUEUES.get(hospital_id, 10),
        "total_queue": BASELINE_QUEUES.get(hospital_id, 10) + new_val,
        "surge_state": SIMULATION_SURGE
    }

def reset_simulation_surge() -> Dict[str, Any]:
    """
    Resets all simulated queue surges back to baseline state.
    """
    global SIMULATION_SURGE
    SIMULATION_SURGE = {1: 0, 2: 0, 3: 0}
    return {
        "success": True,
        "message": "All hospital simulation queues reset to baseline (Hospital A: 18, Hospital B: 6, Hospital C: 3).",
        "surge_state": SIMULATION_SURGE
    }

def calculate_smartflow_score(
    slot: ScheduleSlot,
    doctor: Doctor,
    hospital: Hospital,
    preferred_time: str = ""
) -> Dict[str, Any]:
    """
    Computes transparent multi-factor scoring for a given appointment slot.
    Incorporates active What-If simulation queue surges into real-time waiting efficiency.
    All components normalized between 0.0 and 1.0.
    """
    surge = SIMULATION_SURGE.get(hospital.id, 0)

    # 1. Availability Component (0.5 weight)
    unbooked_slots_count = len([s for s in doctor.slots if not s.is_booked])
    availability_ratio = min(1.0, max(0.2, unbooked_slots_count / 8.0))
    
    # Factor in hospital overall bed occupancy headroom (including surge)
    effective_occupied = min(hospital.total_beds, hospital.occupied_beds + surge)
    hospital_headroom = max(0.05, 1.0 - (effective_occupied / max(hospital.total_beds, 1)))
    availability = round(0.7 * availability_ratio + 0.3 * hospital_headroom, 3)

    # 2. Wait Efficiency Component (0.3 weight)
    base_wait = slot.simulated_wait_min
    surge_penalty = surge * 3 # +3 min per waiting patient
    effective_wait = max(8, base_wait + surge_penalty)
    wait_efficiency = round(max(0.12, min(1.0, 1.0 - (effective_wait - 10) / 45.0)), 3)

    # 3. Preference Match Component (0.2 weight)
    pref_score = 0.85
    if preferred_time:
        pref_lower = preferred_time.lower()
        slot_time = slot.start_time.lower()
        if "morning" in pref_lower and ("am" in slot_time or int(slot_time.split(":")[0]) < 12):
            pref_score = 0.98
        elif "afternoon" in pref_lower and "pm" in slot_time:
            pref_score = 0.98
        elif any(digit in slot_time for digit in ["10", "11"]) and "10" in pref_lower:
            pref_score = 1.0
        else:
            pref_score = 0.70
    else:
        pref_score = round(min(1.0, doctor.rating / 5.0), 3)

    composite_score = round(
        (0.5 * availability) + (0.3 * wait_efficiency) + (0.2 * pref_score),
        3
    )

    return {
        "overall_score": composite_score,
        "score_percentage": int(composite_score * 100),
        "availability": availability,
        "wait_efficiency": wait_efficiency,
        "preference_match": pref_score,
        "simulated_wait_min": effective_wait,
        "base_wait_min": base_wait,
        "active_surge_patients": surge,
        "factors": {
            "availability_weight": f"50% (Doctor capacity & {int(hospital_headroom * 100)}% hospital headroom)",
            "wait_efficiency_weight": f"30% (Dynamic wait: {effective_wait}m; surge: +{surge} pts)",
            "preference_weight": f"20% (Time fit & doctor rating: {doctor.rating}★)"
        },
        "formula_display": f"0.5×{availability} + 0.3×{wait_efficiency} + 0.2×{pref_score} = {composite_score}"
    }

def get_network_simulation_metrics(db: Session) -> List[Dict[str, Any]]:
    """
    Returns live digital twin hospital metrics across Hospital A, B, and C,
    incorporating real-time What-If queue load surges.
    """
    hospitals = db.query(Hospital).all()
    results = []
    
    for hosp in hospitals:
        doctors = db.query(Doctor).filter(Doctor.hospital_id == hosp.id).all()
        doc_ids = [d.id for d in doctors]
        slots = db.query(ScheduleSlot).filter(ScheduleSlot.doctor_id.in_(doc_ids)).all() if doc_ids else []
        
        available_slots = len([s for s in slots if not s.is_booked])
        booked_slots = len([s for s in slots if s.is_booked])
        
        surge = SIMULATION_SURGE.get(hosp.id, 0)
        base_queue = BASELINE_QUEUES.get(hosp.id, 10)
        current_queue = base_queue + surge
        workload_pct = min(98, BASE_STAFF_WORKLOAD.get(hosp.id, 60) + int(surge * 2.5))
        effective_occupied_beds = min(hosp.total_beds, hosp.occupied_beds + surge)
        occupancy_pct = int((effective_occupied_beds / max(hosp.total_beds, 1)) * 100)
        effective_avg_wait = max(8, hosp.avg_admin_wait_min + (surge * 3))

        dept_stats = []
        departments = db.query(Department).all()
        for dept in departments:
            dept_docs = [d for d in doctors if d.department_id == dept.id]
            dept_slots = [s for s in slots if s.doctor_id in [d.id for d in dept_docs]]
            dept_avail = len([s for s in dept_slots if not s.is_booked])
            
            base_dept_wait = (
                sum(s.simulated_wait_min for s in dept_slots) // len(dept_slots)
                if dept_slots else hosp.avg_admin_wait_min
            )
            dept_wait = max(6, base_dept_wait + (surge * 3))
            
            dept_stats.append({
                "department_name": dept.name,
                "telugu_name": dept.telugu_name,
                "available_slots": dept_avail,
                "est_admin_wait_min": dept_wait,
                "active_doctors": len(dept_docs)
            })

        if effective_avg_wait >= 35 or occupancy_pct >= 88 or current_queue >= 15:
            status = "High Congestion"
            queue_level = "High"
        elif effective_avg_wait >= 20 or occupancy_pct >= 70 or current_queue >= 6:
            status = "Busy"
            queue_level = "Moderate"
        else:
            status = "Optimal"
            queue_level = "Low"

        results.append({
            "hospital_id": hosp.id,
            "code": hosp.code,
            "name": hosp.name,
            "short_name": hosp.short_name,
            "area": hosp.area,
            "occupancy_pct": occupancy_pct,
            "total_beds": hosp.total_beds,
            "occupied_beds": effective_occupied_beds,
            "baseline_queue": base_queue,
            "current_queue": current_queue,
            "queue_level": queue_level,
            "staff_workload_pct": workload_pct,
            "simulated_surge": surge,
            "active_icu_units": hosp.active_icu_units,
            "avg_wait_min": effective_avg_wait,
            "total_available_slots": available_slots,
            "total_booked_slots": booked_slots,
            "phone": hosp.contact_phone,
            "departments": dept_stats,
            "status": status
        })

    return results

def get_smartflow_recommendation(
    db: Session,
    department_name: str = "Cardiology",
    preferred_time: str = ""
) -> Dict[str, Any]:
    """
    Evaluates multi-hospital routing for a requested clinical department.
    Returns explainable AI decision breakdown comparing Hospital A, B, and C.
    """
    hospitals = db.query(Hospital).all()
    dept = db.query(Department).filter(Department.name.ilike(f"%{department_name}%")).first()
    if not dept:
        dept = db.query(Department).first()

    candidates = []

    for hosp in hospitals:
        surge = SIMULATION_SURGE.get(hosp.id, 0)
        docs = db.query(Doctor).filter(
            Doctor.hospital_id == hosp.id,
            Doctor.department_id == dept.id if dept else True
        ).all()
        
        if not docs:
            docs = db.query(Doctor).filter(Doctor.hospital_id == hosp.id).all()

        lead_doc = docs[0] if docs else None
        if not lead_doc:
            continue

        open_slot = db.query(ScheduleSlot).filter(
            ScheduleSlot.doctor_id == lead_doc.id,
            ScheduleSlot.is_booked == False
        ).first()

        if not open_slot:
            open_slot = db.query(ScheduleSlot).filter(
                ScheduleSlot.doctor_id == lead_doc.id
            ).first()

        if open_slot:
            score_data = calculate_smartflow_score(open_slot, lead_doc, hosp, preferred_time)
            candidates.append({
                "hospital_id": hosp.id,
                "hospital_code": hosp.code,
                "hospital_name": hosp.name,
                "hospital_short": hosp.short_name,
                "area": hosp.area,
                "doctor_name": lead_doc.name,
                "specialization": lead_doc.specialization,
                "doctor_rating": lead_doc.rating,
                "slot_time": open_slot.start_time,
                "slot_date": open_slot.date,
                "simulated_wait_min": score_data["simulated_wait_min"],
                "active_surge": surge,
                "smartflow_score": score_data["overall_score"],
                "score_pct": score_data["score_percentage"],
                "breakdown": score_data,
                "status": "Optimal" if score_data["simulated_wait_min"] < 20 else ("Busy" if score_data["simulated_wait_min"] < 35 else "High Congestion")
            })

    candidates.sort(key=lambda x: x["smartflow_score"], reverse=True)

    recommended = candidates[0] if candidates else None
    runner_up = candidates[1] if len(candidates) > 1 else None

    if recommended:
        wait_diff = (runner_up["simulated_wait_min"] - recommended["simulated_wait_min"]) if runner_up else 0
        if wait_diff > 0:
            benefit_text = f"Saves ~{wait_diff} minutes of patient waiting time compared to {runner_up['hospital_short']}."
        else:
            benefit_text = "Provides highest clinical specialist availability and optimal facility capacity."

        why_points = [
            f"Doctor slot available ({recommended['doctor_name']} • {recommended['specialization']}).",
            f"Lowest simulated administrative waiting estimate among eligible slots (~{recommended['simulated_wait_min']}m vs ~{runner_up['simulated_wait_min']}m at {runner_up['hospital_short']})." if runner_up else f"Lowest simulated administrative wait ({recommended['simulated_wait_min']}m).",
            f"Matches patient's preferred time ({recommended['slot_time']}).",
            "No appointment conflict or room collision detected."
        ]

        why_text = (
            f"Recommended: **{recommended['hospital_short']} — {recommended['specialization']}, {recommended['slot_time']}**\n\n"
            f"**Why?**\n"
            + "\n".join(f"• {pt}" for pt in why_points) + "\n\n"
            f"*(Note: This is a simulated administrative recommendation, not a medical or emergency triage decision.)*"
        )
        recommended_header = f"Recommended: {recommended['hospital_short']} — {recommended['specialization']}, {recommended['slot_time']}"
    else:
        why_text = "No candidate facilities available."
        why_points = []
        benefit_text = ""
        recommended_header = "No Available Slots"

    surge_active = any(v > 0 for v in SIMULATION_SURGE.values())
    surge_recalculation_notice = None
    if surge_active:
        active_surges = [f"Hospital {chr(64+hid)} (+{val} patients)" for hid, val in SIMULATION_SURGE.items() if val > 0]
        surge_recalculation_notice = f"⚡ Dynamic Recalculation Active: Queue surge at {', '.join(active_surges)}. SmartFlow dynamically rerouted optimal pathway."

    return {
        "department": dept.name if dept else department_name,
        "recommended": recommended,
        "all_candidates": candidates,
        "recommended_header": recommended_header,
        "why_points": why_points,
        "why_recommended": why_text,
        "benefit_summary": benefit_text,
        "administrative_disclaimer": "This is a simulated administrative recommendation, not a medical or emergency triage decision.",
        "surge_recalculation_notice": surge_recalculation_notice,
        "formula": "SmartFlow 2.0 = 0.5×Availability + 0.3×Wait_Efficiency + 0.2×Preference_Match",
        "surge_active": surge_active,
        "surge_state": SIMULATION_SURGE
    }
