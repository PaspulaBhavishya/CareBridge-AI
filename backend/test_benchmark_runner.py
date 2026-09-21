from app.main import run_agent_benchmark
from app.database import SessionLocal

def main():
    db = SessionLocal()
    try:
        res = run_agent_benchmark(db=db)
        print("=== CAREBRIDGE AI BENCHMARK RESULTS ===")
        print(f"Total Queries Tested: {res['total_queries']}")
        print(f"Passed Queries:       {res['passed_queries']}")
        print(f"Accuracy Rate:        {res['accuracy_rate']}%")
        print(f"Avg Latency:          {res['avg_latency_ms']} ms")
        print(f"Domain Breakdown:     {res['domain_distribution']}")
        print("\nAll Results:")
        for r in res['results']:
            status_icon = "PASS" if r["passed"] else "FAIL"
            safe_q = r['query'][:35].encode('ascii', 'replace').decode('ascii')
            print(f"  [{status_icon}] #{r['id']} ({r['sub_agent']}): '{safe_q}' -> {r['predicted_intent']} (exp: {r['expected_intent']})")
    finally:
        db.close()

if __name__ == "__main__":
    main()
