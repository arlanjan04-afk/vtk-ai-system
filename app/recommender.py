RECOMMENDATIONS = {
    "study": [
        {"id": 1, "name": "Spravka ob obuchenii"},
        {"id": 2, "name": "Raspisanie"},
    ],
    "money": [
        {"id": 3, "name": "Stipendiya"},
        {"id": 4, "name": "Oplata"},
    ],
    "docs": [
        {"id": 5, "name": "Spravka voenkomat"},
    ]
}


def get_recommendations(query="", user_role="student"):
    query_lower = query.lower()
    
    if "stipendiya" in query_lower or "oplata" in query_lower:
        return RECOMMENDATIONS["money"]
    elif "spravka" in query_lower:
        return RECOMMENDATIONS["docs"]
    else:
        return RECOMMENDATIONS["study"]


def predict_workload(historical_data=None):
    return {
        "today": {"requests": 25, "load": "medium"},
        "tomorrow": {"requests": 32, "load": "high"},
        "recommendation": "Increase staff"
    }
