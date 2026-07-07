"""Task service: business logic for task CRUD."""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.task import Task
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate


class TaskService:
    """Handles task business logic and ownership enforcement."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.task_repo = TaskRepository(db)

    def create_task(self, owner_id: int, payload: TaskCreate) -> TaskOut:
        task = self.task_repo.create(
            title=payload.title,
            description=payload.description,
            status=payload.status.value,
            owner_id=owner_id,
        )
        return TaskOut.model_validate(task)

    def list_tasks(
        self, owner_id: int, skip: int = 0, limit: int = 100
    ) -> list[TaskOut]:
        tasks = self.task_repo.list_by_owner(owner_id, skip=skip, limit=limit)
        return [TaskOut.model_validate(t) for t in tasks]

    def get_task(self, owner_id: int, task_id: int) -> TaskOut:
        task = self._get_owned_task(owner_id, task_id)
        return TaskOut.model_validate(task)

    def update_task(
        self, owner_id: int, task_id: int, payload: TaskUpdate
    ) -> TaskOut:
        task = self._get_owned_task(owner_id, task_id)
        update_data = payload.model_dump(exclude_unset=True)
        if "status" in update_data and update_data["status"] is not None:
            update_data["status"] = update_data["status"].value
        task = self.task_repo.update(task, **update_data)
        return TaskOut.model_validate(task)

    def delete_task(self, owner_id: int, task_id: int) -> None:
        task = self._get_owned_task(owner_id, task_id)
        self.task_repo.delete(task)

    def _get_owned_task(self, owner_id: int, task_id: int) -> Task:
        task = self.task_repo.get_by_id_and_owner(task_id, owner_id)
        if not task:
            raise NotFoundError("Task not found")
        return task