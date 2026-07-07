import json
from typing import List, Optional

from app.services.rag_service import retrieve_context
from app.services.watsonx_service import (
    generate_response,
    GRANITE_3_8B,
)

DIFFICULTY_MAP = {
    "junior": ["Easy", "Medium"],
    "mid": ["Medium", "Hard"],
    "senior": ["Medium", "Hard", "Hard"],
    "lead": ["Hard", "Hard"],
}

EXPERIENCE_CONTEXT = {
    "junior": "0-2 years experience. Ask fundamental coding and basic interview questions.",
    "mid": "3-5 years experience. Ask practical coding, OOP, DBMS, System Design and behavioral questions.",
    "senior": "6-10 years experience. Ask architecture, scalability, leadership and optimization questions.",
    "lead": "10+ years experience. Focus on leadership, decision making and large scale systems.",
}


def generate_interview_questions(
    role: str,
    experience_level: str,
    company: Optional[str] = None,
    categories: List[str] = None,
    num_questions: int = 10,
    focus_topics: List[str] = None,
):

    if categories is None:
        categories = ["all"]

    ##############################################
    # Retrieve Relevant Context
    ##############################################

    contexts = []

    for category in categories:

        retrieval_query = f"{role} interview"

        if company:
            retrieval_query += f" {company}"

        retrieval = retrieve_context(
            query=retrieval_query,
            categories=None if category == "all" else [category],
            n_results=2,
        )

        if retrieval.get("context"):

            text = retrieval["context"]

            # Keep only useful information
            lines = []

            for line in text.split("\n"):

                if line.startswith("Category:"):
                    lines.append(line)

                elif line.startswith("Topic:"):
                    lines.append(line)

                elif line.startswith("Concept:"):
                    lines.append(line)

                # Ignore Sample Answer
                # Ignore Key Points
                # Ignore long explanations

            contexts.append("\n".join(lines))

    ##############################################
    # Company Context
    ##############################################

    if company:

        retrieval = retrieve_context(
            query=f"{company} interview culture",
            categories=None,
            n_results=2,
        )

        if retrieval.get("context"):

            company_lines = []

            for line in retrieval["context"].split("\n"):

                if line.startswith("Category:"):
                    company_lines.append(line)

                elif line.startswith("Topic:"):
                    company_lines.append(line)

                elif line.startswith("Concept:"):
                    company_lines.append(line)

            contexts.insert(
                0,
                "\n".join(company_lines)
            )

    context = "\n\n".join(contexts)

    exp_context = EXPERIENCE_CONTEXT.get(
        experience_level,
        ""
    )

    difficulty = DIFFICULTY_MAP.get(
        experience_level,
        ["Medium"]
    )

    company_name = company if company else "General"

    prompt = f"""
You are a Senior Technical Interviewer.

Generate EXACTLY {num_questions} interview questions.

Candidate

Role:
{role}

Experience:
{exp_context}

Company:
{company_name}

Reference Knowledge

{context[:800]}

Rules

1. Generate exactly {num_questions} questions.

2. Use categories:
- dsa
- hr
- behavioral
- system_design

3. Difficulty should match:
{difficulty}

4. Return ONLY JSON.

Expected Format

{{
    "questions":[
        {{
            "question":"...",
            "category":"dsa",
            "difficulty":"Medium",
            "topic":"Arrays",
            "hint":"Think step by step",
            "evaluation_criteria":[
                "Correctness",
                "Communication",
                "Problem Solving"
            ]
        }}
    ]
}}
"""

    ############################################################
    # Generate Response
    ############################################################

    print("=" * 80)
    print("PROMPT SENT TO GRANITE")
    print("=" * 80)
    print(prompt)
    print("=" * 80)

    response_text = generate_response(
        prompt=prompt,
        model_id=GRANITE_3_8B,
        max_tokens=1200,
        temperature=0.3,
    )

    print("=" * 80)
    print("QUESTION GENERATOR RAW RESPONSE")
    print("=" * 80)
    print(repr(response_text))
    print("=" * 80)

    ############################################################
    # Parse Response
    ############################################################

    questions = []

    try:

        cleaned = response_text.strip()

        # Remove markdown if Granite returns it
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]

        if cleaned.startswith("```"):
            cleaned = cleaned[3:]

        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        cleaned = cleaned.strip()

        if not cleaned:
            raise ValueError("Empty response")

        parsed = json.loads(cleaned)

        questions = parsed.get("questions", [])

    except Exception as e:

        print("JSON PARSE ERROR:", e)

        # Try extracting JSON from mixed text
        try:

            start = response_text.find("{")
            end = response_text.rfind("}") + 1

            if start != -1 and end > start:

                parsed = json.loads(response_text[start:end])

                questions = parsed.get("questions", [])

        except Exception:
            pass

    ############################################################
    # Smart Fallback
    ############################################################

    if not questions:

        print("Using fallback interview questions...")

        fallback_category = (
            categories[0]
            if categories and categories[0] != "all"
            else "dsa"
        )

        difficulty = DIFFICULTY_MAP.get(
            experience_level,
            ["Medium"]
        )

        questions = []

        for i in range(num_questions):

            questions.append(
                {
                    "question": f"Interview Question {i + 1} for {role}",
                    "category": fallback_category,
                    "difficulty": difficulty[
                        min(i, len(difficulty) - 1)
                    ],
                    "topic": role,
                    "hint": "Explain your approach step by step.",
                    "evaluation_criteria": [
                        "Technical Accuracy",
                        "Problem Solving",
                        "Communication",
                    ],
                }
            )

    ############################################################
    # Clean Questions
    ############################################################

    for q in questions:

        q.setdefault("category", "dsa")
        q.setdefault("difficulty", "Medium")
        q.setdefault("topic", role)
        q.setdefault("hint", "")
        q.setdefault(
            "evaluation_criteria",
            [
                "Technical Accuracy",
                "Communication"
            ],
        )

    ############################################################
    # Return Result
    ############################################################

    categories_covered = sorted(
        list(
            {
                q.get("category", "dsa")
                for q in questions
            }
        )
    )

    return {
        "role": role,
        "experience_level": experience_level,
        "company": company,
        "questions": questions[:num_questions],
        "total_questions": min(
            len(questions),
            num_questions,
        ),
        "categories_covered": categories_covered,
    }