export const getChildProfiles = async () => {
  const { data, error } = await supabase.from("child_profiles").select("*");

  if (error) throw error;
  return data || [];
};
