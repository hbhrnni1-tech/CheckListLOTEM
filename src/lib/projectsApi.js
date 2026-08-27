import { supabase } from "./supabase";

function rowToProject(row) {
  return {
    id: row.id,
    clientName: row.client_name,
    consultant: row.consultant || "",
    pmoOwner: row.pmo_owner || "",
    launchDate: row.launch_date,
    type: row.type,
    color: row.color,
    createdDate: row.created_date,
    categoryOrder: row.category_order || [],
    tasks: row.tasks || [],
  };
}

function projectToRow(project, userId) {
  const row = {
    id: project.id,
    client_name: project.clientName,
    consultant: project.consultant || "",
    pmo_owner: project.pmoOwner || "",
    launch_date: project.launchDate || null,
    type: project.type,
    color: project.color,
    created_date: project.createdDate,
    category_order: project.categoryOrder || [],
    tasks: project.tasks || [],
  };
  if (userId) row.user_id = userId;
  return row;
}

export async function fetchProjects() {
  // Row Level Security on the `projects` table already restricts this to
  // the signed-in user's own rows, so no explicit user filter is needed here.
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_date", { ascending: false });
  if (error) throw error;
  return data.map(rowToProject);
}

export async function insertProject(project) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("projects")
    .insert(projectToRow(project, user?.id))
    .select()
    .single();
  if (error) throw error;
  return rowToProject(data);
}

export async function updateProjectRow(project) {
  const { error } = await supabase
    .from("projects")
    .update(projectToRow(project))
    .eq("id", project.id);
  if (error) throw error;
}

export async function deleteProjectRow(id) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
