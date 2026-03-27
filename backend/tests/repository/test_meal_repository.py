from datetime import datetime

from models.meal import Meal
from repository.meal_repository import MealRepository


def test_create_meal_persists_record(db_session):
    # create が食事記録を永続化することを確認する。
    meal = Meal(
        id=1,
        meal_name="Breakfast",
        calories=500,
        eaten_at=datetime(2026, 3, 27, 8, 0, 0),
        memo="Eggs",
    )

    result = MealRepository.create(db_session, meal)
    fetched = MealRepository.find_by_id(db_session, 1)

    assert result.id == 1
    assert fetched is not None
    assert fetched.meal_name == "Breakfast"


def test_update_meal_updates_record(db_session):
    # update が既存の食事記録を更新することを確認する。
    meal = Meal(
        id=1,
        meal_name="Breakfast",
        calories=500,
        eaten_at=datetime(2026, 3, 27, 8, 0, 0),
        memo="Eggs",
    )
    MealRepository.create(db_session, meal)

    updated = MealRepository.update(
        db_session,
        meal,
        {
            "meal_name": "Lunch",
            "calories": 700,
            "eaten_at": datetime(2026, 3, 27, 12, 0, 0),
            "memo": "Rice bowl",
        },
    )

    assert updated.meal_name == "Lunch"
    assert updated.calories == 700
    assert updated.memo == "Rice bowl"


def test_delete_meal_removes_record(db_session):
    # delete が食事記録を削除することを確認する。
    meal = Meal(
        id=1,
        meal_name="Breakfast",
        calories=500,
        eaten_at=datetime(2026, 3, 27, 8, 0, 0),
        memo="Eggs",
    )
    MealRepository.create(db_session, meal)

    MealRepository.delete(db_session, meal)

    assert MealRepository.find_by_id(db_session, 1) is None
