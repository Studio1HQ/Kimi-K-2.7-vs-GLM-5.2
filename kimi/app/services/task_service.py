from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.repositories import task_repository
from app.schemas.task import TaskCreate, TaskUpdate


def list_user_tasks(db: Session, current_user: User) -> list[Task]:
    return task_repository.get_tasks_by_owner(db, current_user.id)


def create_user_task(
    db: Session, current_user: User, task_data: TaskCreate
) -> Task:
    return task_repository.create_task(db, task_data, current_user.id)


def get_user_task(
    db: Session, current_user: User, task_id: int
) -> Task:
    task = task_repository.get_task_by_id(db, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


def update_user_task(
    db: Session, current_user: User, task_id: int, task_data: TaskUpdate
) -> Task:
    task = get_user_task(db, current_user, task_id)
    return task_repository.update_task(db, task, task_data)


def delete_user_task(
    db: Session, current_user: User, task_id: int
) -> None:
    task = get_user_task(db, current_user, task_id)
    task_repository.delete_task(db, task)
