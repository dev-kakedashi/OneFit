from models.user import User
from sqlalchemy.orm import Session


class UserRepository:
    @staticmethod
    def get_first(db: Session) -> User | None:
        return db.query(User).first()

    @staticmethod
    def create(db: Session, user: User) -> User:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update(db: Session, existing_user: User, update_data: dict) -> User:
        for key, value in update_data.items():
            setattr(existing_user, key, value)

        db.commit()
        db.refresh(existing_user)
        return existing_user
