from typing import List, Optional

from app.services.dashboard_service import get_dashboard_stats
from motor.motor_asyncio import AsyncIOMotorDatabase


async def generate_roadmap(
    user_id: str,
    db: AsyncIOMotorDatabase,
    duration_days: int = 7,
    focus_categories: Optional[List[str]] = None,
) -> dict:
    """Generate a personalized study roadmap."""

    stats = await get_dashboard_stats(user_id=user_id, db=db)

    # Weak topics
    if focus_categories:
        weak_topics = focus_categories
    else:
        weak_topics = [w["category"] for w in stats.get("weak_topics", [])]

    if not weak_topics:
        weak_topics = ["dsa", "behavioral"]

    # Resources
    resource_map = {
        "dsa": [
            {
                "title": "NeetCode",
                "url": "https://neetcode.io",
                "type": "practice",
            },
            {
                "title": "LeetCode",
                "url": "https://leetcode.com",
                "type": "practice",
            },
        ],
        "behavioral": [
            {
                "title": "Google STAR Method",
                "url": "https://careers.google.com/how-we-hire/interview/",
                "type": "article",
            },
            {
                "title": "freeCodeCamp Interview Tips",
                "url": "https://www.freecodecamp.org",
                "type": "article",
            },
        ],
        "system_design": [
            {
                "title": "System Design Primer",
                "url": "https://github.com/donnemartin/system-design-primer",
                "type": "article",
            },
            {
                "title": "Gaurav Sen",
                "url": "https://www.youtube.com/@gkcs",
                "type": "video",
            },
        ],
        "hr": [
            {
                "title": "Indeed Interview Guide",
                "url": "https://www.indeed.com/career-advice",
                "type": "article",
            }
        ],
    }

    # 15 unique study templates
    roadmap_templates = [
        {
            "title": "DSA Fundamentals",
            "topic": "dsa",
            "tasks": [
                "Learn Arrays & Strings",
                "Solve 5 Easy LeetCode Problems",
                "Revise Time Complexity",
                "Write notes",
            ],
        },
        {
            "title": "Behavioral Interview",
            "topic": "behavioral",
            "tasks": [
                "Learn STAR Method",
                "Prepare Self Introduction",
                "Answer 5 HR Questions",
                "Practice Speaking",
            ],
        },
        {
            "title": "HashMap & Two Pointers",
            "topic": "dsa",
            "tasks": [
                "Study HashMap",
                "Solve Two Pointer Problems",
                "Sliding Window",
                "Revision",
            ],
        },
        {
            "title": "System Design Basics",
            "topic": "system_design",
            "tasks": [
                "Learn Load Balancer",
                "Caching",
                "URL Shortener",
                "Draw Architecture",
            ],
        },
        {
            "title": "Trees & Graphs",
            "topic": "dsa",
            "tasks": [
                "Binary Trees",
                "BST",
                "DFS",
                "BFS",
            ],
        },
        {
            "title": "Resume & HR",
            "topic": "hr",
            "tasks": [
                "Improve Resume",
                "Strengths",
                "Weaknesses",
                "Communication",
            ],
        },
        {
            "title": "Mock Interview",
            "topic": "behavioral",
            "tasks": [
                "Complete Mock Interview",
                "Review Mistakes",
                "Record Yourself",
                "Improve Body Language",
            ],
        },
        {
            "title": "Dynamic Programming",
            "topic": "dsa",
            "tasks": [
                "Learn DP Basics",
                "Solve Fibonacci",
                "Knapsack",
                "Revision",
            ],
        },
        {
            "title": "Scalable System Design",
            "topic": "system_design",
            "tasks": [
                "Database Scaling",
                "Sharding",
                "Replication",
                "Caching",
            ],
        },
        {
            "title": "Linked Lists",
            "topic": "dsa",
            "tasks": [
                "Reverse List",
                "Cycle Detection",
                "Merge Lists",
                "Practice",
            ],
        },
        {
            "title": "Advanced HR",
            "topic": "hr",
            "tasks": [
                "Leadership Questions",
                "Conflict Resolution",
                "Career Goals",
                "Company Research",
            ],
        },
        {
            "title": "Graphs Advanced",
            "topic": "dsa",
            "tasks": [
                "Topological Sort",
                "Dijkstra",
                "Union Find",
                "Revision",
            ],
        },
        {
            "title": "Behavioral Stories",
            "topic": "behavioral",
            "tasks": [
                "Prepare STAR Stories",
                "Achievements",
                "Failures",
                "Leadership",
            ],
        },
        {
            "title": "High Level Design",
            "topic": "system_design",
            "tasks": [
                "Design Instagram",
                "Design Chat App",
                "Scaling",
                "Caching",
            ],
        },
        {
            "title": "Final Mock Interview",
            "topic": "behavioral",
            "tasks": [
                "Complete Full Mock",
                "Analyze Weak Areas",
                "Revision",
                "Confidence Practice",
            ],
        },
    ]

    plan = []

    for day in range(duration_days):

        template = roadmap_templates[day % len(roadmap_templates)]
        topic = template["topic"]

        display_name = {
            "dsa": "DSA",
            "behavioral": "Behavioral",
            "system_design": "System Design",
            "hr": "HR",
        }.get(topic, topic.title())

        plan.append(
            {
                "day": day + 1,
                "title": template["title"],
                "topics": [display_name],
                "tasks": template["tasks"],
                "resources": resource_map.get(topic, []),
                "estimated_hours": 2,
            }
        )

    return {
        "duration_days": duration_days,
        "weak_topics": weak_topics,
        "plan": plan,
        "total_estimated_hours": duration_days * 2,
    }