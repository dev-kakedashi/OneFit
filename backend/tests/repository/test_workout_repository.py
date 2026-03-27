from datetime import datetime

from models.workout import Workout
from repository.workout_repository import WorkoutRepository


def test_create_workout_persists_record(db_session):
    # create がトレーニング記録を永続化することを確認する。
    workout = Workout(
        id=1,
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )

    result = WorkoutRepository.create(db_session, workout)
    fetched = WorkoutRepository.find_by_id(db_session, 1)

    assert result.id == 1
    assert fetched is not None
    assert fetched.workout_name == "Running"


def test_update_workout_updates_record(db_session):
    # update が既存のトレーニング記録を更新することを確認する。
    workout = Workout(
        id=1,
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )
    WorkoutRepository.create(db_session, workout)

    updated = WorkoutRepository.update(
        db_session,
        workout,
        {
            "workout_name": "Cycling",
            "burned_calories": 450,
            "worked_out_at": datetime(2026, 3, 27, 20, 0, 0),
            "memo": "45 min",
        },
    )

    assert updated.workout_name == "Cycling"
    assert updated.burned_calories == 450
    assert updated.memo == "45 min"


def test_delete_workout_removes_record(db_session):
    # delete がトレーニング記録を削除することを確認する。
    workout = Workout(
        id=1,
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )
    WorkoutRepository.create(db_session, workout)

    WorkoutRepository.delete(db_session, workout)

    assert WorkoutRepository.find_by_id(db_session, 1) is None
