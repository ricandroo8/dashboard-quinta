import { supabase } from "../lib/supabase";

function assertClient() {
  if (!supabase) {
    throw new Error("Supabase non è configurato.");
  }
}

function toTaskRow(userId, task) {
  return {
    client_id: task.id,
    completed: Boolean(task.completed),
    completed_at: task.completedAt ?? null,
    created_at: task.createdAt,
    deleted_at: null,
    description: task.description ?? "",
    due_date: task.dueDate ?? null,
    external_task_id: task.externalTaskId ?? null,
    is_important: Boolean(task.isImportant),
    is_urgent: Boolean(task.isUrgent),
    subject_id: task.subjectId ?? "",
    title: task.title,
    type: task.type ?? "OTHER",
    updated_at: task.updatedAt,
    user_id: userId,
  };
}

function toTaskRecord(row) {
  return {
    deletedAt: row.deleted_at,
    task: {
      clientId: row.client_id,
      completed: row.completed,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      description: row.description ?? "",
      dueDate: row.due_date,
      externalTaskId: row.external_task_id,
      id: row.client_id,
      isImportant: row.is_important,
      isUrgent: row.is_urgent,
      subjectId: row.subject_id ?? "",
      title: row.title,
      type: row.type,
      updatedAt: row.updated_at,
    },
  };
}

export async function fetchTaskRecords(userId) {
  assertClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toTaskRecord);
}

export async function upsertTasks(userId, tasks) {
  assertClient();

  if (tasks.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("tasks")
    .upsert(tasks.map((task) => toTaskRow(userId, task)), {
      onConflict: "user_id,client_id",
    });

  if (error) {
    throw error;
  }
}

export async function softDeleteTasks(userId, tombstones) {
  assertClient();

  await Promise.all(
    tombstones.map(async ({ id, deletedAt }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ deleted_at: deletedAt, updated_at: deletedAt })
        .eq("user_id", userId)
        .eq("client_id", id);

      if (error) {
        throw error;
      }
    }),
  );
}
