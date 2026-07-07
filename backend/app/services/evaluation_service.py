import json
from typing import Optional

from app.services.watsonx_service import (
    generate_response,
    GRANITE_3_8B,
)


def evaluate_answer(
    question: str,
    user_answer: str,
    category: str,
    difficulty: str = "Medium",
    expected_context: Optional[str] = None,
) -> dict:
    """
    Evaluate interview answer using IBM Granite.
    """

    ###########################################################
    # Prompt
    ###########################################################

    context = ""

    if expected_context:
        context = f"""

Reference Material

{expected_context}

"""

    prompt = f"""
You are a Senior Technical Interviewer.

Evaluate the candidate's answer.

Question

{question}

Candidate Answer

{user_answer}

Category

{category}

Difficulty

{difficulty}

{context}

Return ONLY valid JSON.

Format

{{
    "scores": {{
        "accuracy": 85,
        "clarity": 80,
        "completeness": 78,
        "confidence": 82
    }},
    "overall_score": 81,
    "feedback": "2-3 sentence constructive feedback.",
    "improved_answer": "A better answer."
}}
"""

    ###########################################################
    # Debug Prompt
    ###########################################################

    print("=" * 80)
    print("EVALUATION PROMPT")
    print("=" * 80)
    print(prompt)
    print("=" * 80)

    ###########################################################
    # Granite
    ###########################################################

    response_text = generate_response(
        prompt=prompt,
        model_id=GRANITE_3_8B,
        max_tokens=800,
        temperature=0.2,
    )

    print("=" * 80)
    print("RAW EVALUATION RESPONSE")
    print("=" * 80)
    print(repr(response_text))
    print("=" * 80)

    ###########################################################
    # Parse
    ###########################################################

    parsed = None

    try:

        cleaned = response_text.strip()

        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]

        if cleaned.startswith("```"):
            cleaned = cleaned[3:]

        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        cleaned = cleaned.strip()

        if not cleaned:
            raise ValueError("Empty Granite response")

        parsed = json.loads(cleaned)

    except Exception as e:

        print("JSON PARSE ERROR:", e)

        try:

            start = response_text.find("{")
            end = response_text.rfind("}") + 1

            if start != -1 and end > start:

                parsed = json.loads(
                    response_text[start:end]
                )

        except Exception:
            parsed = None

    ###########################################################
    # Smart Fallback
    ###########################################################

    if parsed is None:

        print("Using evaluation fallback...")

        parsed = {
            "scores": {
                "accuracy": 60,
                "clarity": 60,
                "completeness": 60,
                "confidence": 60,
            },
            "overall_score": 60,
            "feedback": (
                "AI could not fully evaluate the answer. "
                "Please review it manually."
            ),
            "improved_answer": (
                "Provide a structured answer using the STAR method "
                "or explain your algorithm step-by-step with "
                "time and space complexity."
            ),
        }

    ###########################################################
    # Validation
    ###########################################################

    scores = parsed.get("scores", {})

    for key in [
        "accuracy",
        "clarity",
        "completeness",
        "confidence",
    ]:

        value = scores.get(key, 60)

        try:
            value = int(value)
        except Exception:
            value = 60

        value = max(0, min(100, value))

        scores[key] = value

    try:
        overall = int(parsed.get("overall_score", 60))
    except Exception:
        overall = 60

    overall = max(0, min(100, overall))

    ###########################################################
    # Return
    ###########################################################

    return {
        "question": question,
        "user_answer": user_answer,
        "scores": scores,
        "overall_score": overall,
        "feedback": parsed.get(
            "feedback",
            "No feedback generated.",
        ),
        "improved_answer": parsed.get(
            "improved_answer",
            "",
        ),
    }