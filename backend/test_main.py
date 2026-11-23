from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_list_lessons_filters_by_level():
    response = client.get("/api/lessons", params={"level": "beginner"})

    assert response.status_code == 200
    assert response.json()
    assert {lesson["level"] for lesson in response.json()} == {"beginner"}


def test_lesson_catalog_has_varied_topics_for_every_level():
    response = client.get("/api/lessons")

    assert response.status_code == 200
    lessons = response.json()
    assert len(lessons) >= 18
    assert {
        level: sum(lesson["level"] == level for lesson in lessons)
        for level in ("beginner", "intermediate", "advanced")
    } == {"beginner": 6, "intermediate": 6, "advanced": 6}
    assert len({lesson["category"] for lesson in lessons}) >= 12


def test_evaluate_returns_vocabulary_feedback():
    response = client.post(
        "/api/evaluate",
        json={
            "lesson_id": "introduce-yourself",
            "transcript": "I usually enjoy reading and I am interested in music.",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["word_count"] == 10
    assert result["vocabulary_used"] == ["usually", "enjoy", "interested in"]
    assert result["score"] == 73


def test_evaluate_rejects_unknown_lesson():
    response = client.post(
        "/api/evaluate", json={"lesson_id": "missing", "transcript": "Hello there"}
    )

    assert response.status_code == 404


def test_evaluate_rejects_blank_transcript():
    response = client.post(
        "/api/evaluate", json={"lesson_id": "introduce-yourself", "transcript": " "}
    )

    assert response.status_code == 422


def test_start_conversation_returns_a_natural_opening():
    response = client.post("/api/conversations/coffee-shop/start")

    assert response.status_code == 200
    assert "What can I get started for you?" in response.json()["partner_message"]


def test_conversation_catalog_covers_everyday_and_workplace_situations_at_each_level():
    response = client.get("/api/conversations")

    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) == 60
    assert len({scenario["id"] for scenario in scenarios}) == 60
    assert all(scenario["turn_questions"] for scenario in scenarios)
    assert {
        level: sum(scenario["level"] == level for scenario in scenarios)
        for level in ("beginner", "intermediate", "advanced")
    } == {"beginner": 20, "intermediate": 20, "advanced": 20}
    assert {scenario["id"] for scenario in scenarios} >= {
        "taking-the-bus",
        "doctor-appointment",
        "making-weekend-plans",
        "talking-to-a-landlord",
        "picking-up-a-package",
        "giving-a-project-update",
        "leading-a-project-kickoff",
        "handling-a-meeting-disagreement",
        "checking-into-a-hotel",
        "organizing-a-community-event",
        "managing-a-meeting-agenda",
        "negotiating-with-a-vendor",
    }
    advanced_response = client.get("/api/conversations?level=advanced")
    assert advanced_response.status_code == 200
    assert len(advanced_response.json()) == 20
    assert all(item["level"] == "advanced" for item in advanced_response.json())


def test_conversation_reply_advances_and_suggests_a_phrase():
    response = client.post(
        "/api/conversations/coffee-shop/reply",
        json={"turn_index": 0, "message": "I'd like a coffee, please."},
    )

    assert response.status_code == 200
    result = response.json()
    assert result["next_question"] == "Nice choice! Would you like that hot or iced, and what size?"
    assert result["phrases_used"] == ["I'd like..."]
    assert result["finished"] is False


def test_conversation_rejects_replies_after_the_last_turn():
    response = client.post(
        "/api/conversations/coffee-shop/reply",
        json={"turn_index": 4, "message": "My day is going well, thanks!"},
    )

    assert response.status_code == 200
    assert response.json()["finished"] is True
    assert response.json()["next_question"] is None

    ended_response = client.post(
        "/api/conversations/coffee-shop/reply",
        json={"turn_index": 5, "message": "Thank you!"},
    )
    assert ended_response.status_code == 409
