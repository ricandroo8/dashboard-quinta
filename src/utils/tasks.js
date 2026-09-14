function getTimeOrNull(dateString) {
  if (!dateString) {
    return null;
  }

  const time = new Date(dateString).getTime();

  return Number.isNaN(time) ? null : time;
}

function getPriorityScore(task) {
  return Number(Boolean(task.isUrgent)) + Number(Boolean(task.isImportant));
}

export function sortTasksByPriority(tasks) {
  return [...tasks].sort((firstTask, secondTask) => {
    if (firstTask.completed !== secondTask.completed) {
      return Number(firstTask.completed) - Number(secondTask.completed);
    }

    const priorityDifference =
      getPriorityScore(secondTask) - getPriorityScore(firstTask);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    const firstDueDate = getTimeOrNull(firstTask.dueDate);
    const secondDueDate = getTimeOrNull(secondTask.dueDate);

    if (firstDueDate !== null && secondDueDate !== null) {
      return firstDueDate - secondDueDate;
    }

    if (firstDueDate !== null) {
      return -1;
    }

    if (secondDueDate !== null) {
      return 1;
    }

    const firstCreatedAt = getTimeOrNull(firstTask.createdAt) ?? 0;
    const secondCreatedAt = getTimeOrNull(secondTask.createdAt) ?? 0;

    return firstCreatedAt - secondCreatedAt;
  });
}

export function getDashboardTasks(tasks, limit = 3) {
  return sortTasksByPriority(
    tasks.filter((task) => !task.completed)
  ).slice(0, limit);
}