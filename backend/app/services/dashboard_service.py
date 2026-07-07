from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional


async def get_dashboard_stats(
    user_id: str,
    db: AsyncIOMotorDatabase,
) -> dict:
    """Aggregate all performance stats for a user dashboard."""
    
    # 1. Total sessions count
    total_sessions = await db.interview_sessions.count_documents(
        {"user_id": user_id}
    )

    # 2. Total questions answered
    total_evaluations = await db.evaluations.count_documents(
        {"user_id": user_id}
    )

    # 3. Overall average score
    pipeline_avg = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": None,
            "avg_score": {"$avg": "$overall_score"},
            "max_score": {"$max": "$overall_score"},
            "min_score": {"$min": "$overall_score"},
        }},
    ]
    score_stats = await db.evaluations.aggregate(pipeline_avg).to_list(1)
    
    avg_score = round(score_stats[0]["avg_score"]) if score_stats else 0
    max_score = round(score_stats[0]["max_score"]) if score_stats else 0
    min_score = round(score_stats[0]["min_score"]) if score_stats else 0

    # 4. Category-wise average scores
    pipeline_category = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$category",
            "avg_score": {"$avg": "$overall_score"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"avg_score": 1}},  # ascending so weakest is first
    ]
    category_stats = await db.evaluations.aggregate(pipeline_category).to_list(10)
    
    category_scores = [
        {
            "category": stat["_id"] or "general",
            "average_score": round(stat["avg_score"]),
            "questions_answered": stat["count"],
        }
        for stat in category_stats
    ]

    # 5. Weak topics (score < 60)
    weak_topics = [cs for cs in category_scores if cs["average_score"] < 60]

    # 6. Score breakdown averages (accuracy, clarity, completeness, confidence)
    pipeline_breakdown = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": None,
            "avg_accuracy": {"$avg": "$scores.accuracy"},
            "avg_clarity": {"$avg": "$scores.clarity"},
            "avg_completeness": {"$avg": "$scores.completeness"},
            "avg_confidence": {"$avg": "$scores.confidence"},
        }},
    ]
    breakdown_stats = await db.evaluations.aggregate(pipeline_breakdown).to_list(1)
    
    score_breakdown = {
        "accuracy": round(breakdown_stats[0]["avg_accuracy"]) if breakdown_stats else 0,
        "clarity": round(breakdown_stats[0]["avg_clarity"]) if breakdown_stats else 0,
        "completeness": round(breakdown_stats[0]["avg_completeness"]) if breakdown_stats else 0,
        "confidence": round(breakdown_stats[0]["avg_confidence"]) if breakdown_stats else 0,
    }

    # 7. Recent sessions (last 5)
    recent_sessions_cursor = db.interview_sessions.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(5)
    
    recent_sessions = []
    async for session in recent_sessions_cursor:
        session["_id"] = str(session["_id"])
        recent_sessions.append({
            "id": session["_id"],
            "session_name": session.get("session_name", "Unnamed"),
            "overall_score": session.get("overall_score", 0),
            "total_questions": session.get("total_questions", 0),
            "created_at": session["created_at"].isoformat(),
        })

    # 8. Score trend over time (last 10 sessions)
    pipeline_trend = [
      {"$match": {"user_id": user_id}},
      {"$sort": {"created_at": 1}},
      {"$limit": 10},
      {
        "$project": {
            "label": {
                "$dateToString": {
                    "format": "%d %b",
                    "date": "$created_at"
                }
            },
            "overall_score": 1,
        }
      },
    ]

    trend_data = await db.interview_sessions.aggregate(pipeline_trend).to_list(10)

    score_trend = [
        {
          "label": t["label"],
          "score": t["overall_score"],
        }
        for t in trend_data
    ]

    return {
        "total_sessions": total_sessions,
        "total_questions_answered": total_evaluations,
        "overall_avg_score": avg_score,
        "max_score": max_score,
        "min_score": min_score,
        "category_scores": category_scores,
        "weak_topics": weak_topics,
        "score_breakdown": score_breakdown,
        "recent_sessions": recent_sessions,
        "score_trend": score_trend,
    }