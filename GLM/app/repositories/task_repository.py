"""Task repository."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task]):
    model = Task

    def __init__(self, db: Session) -> None:
        super().__init__(db)

    def list_by_owner(
        self, owner_id: int, skip: int = 0, limit: int = 100
    ) -> list[Task]:
        stmt = (
            select(Task)
            .where(Task.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get_by_id_and_owner(self, task_id: int, owner_id: int) -> Task | None:
        stmt = select(Task).where(Task.id == task_id, Task.owner_id == owner_id)
        return self.db.scalars(stmt).first()