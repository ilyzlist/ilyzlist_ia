"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import Head from "next/head";
import { Home, Upload, AccountCircle, ArrowBack, Delete } from "@mui/icons-material";
import { toast } from "react-hot-toast";

export default function EditChildPage() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birth_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        setLoading(true);
        if (!id) {
          throw new Error("No child ID provided");
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error("Not authenticated");
        }

        const { data: child, error } = await supabase
          .from("children")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("[SUPABASE ERROR]", error);
          throw new Error("Database error");
        }

        if (!child) {
          throw new Error("Child profile not found");
        }

        setFormData({
          name: child.name || child.full_name || "",
          gender: child.gender || "",
          birth_date: child.birth_date || child.date_of_birth || "",
        });

      } catch (err) {
        console.error("[FETCH ERROR]", err);
        toast.error(err.message || "Failed to load");
        router.push("/children-profiles");
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, [id]); // keep same deps as before for consistency

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      if (!formData.name.trim()) throw new Error("Name is required");

      const { error } = await supabase
        .from("children")
        .update({
          name: formData.name,
          gender: formData.gender,
          birth_date: formData.birth_date,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      router.push("/children-profiles");
    } catch (err) {
      console.error("[UPDATE ERROR]", err);
      toast.error(err.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this profile? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile deleted successfully");
      router.push("/children-profiles");
    } catch (err) {
      console.error("[DELETE ERROR]", err);
      toast.error(err.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3742D1]"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Profile | Ilyzlist</title>
      </Head>

      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-24">
        <header className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-[#ECF1FF] transition-colors"
            aria-label="Back"
          >
            <ArrowBack className="text-[#3742D1]" />
          </button>
          <h1 className="text-2xl font-bold text-[#3742D1]">Edit Profile</h1>
          <div className="w-10"></div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-lg font-medium">Full Name</label>
            <div className="bg-[#ECF1FF] rounded-xl p-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent text-[#809CFF] focus:outline-none border-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-medium">Gender</label>
            <div className="bg-[#ECF1FF] rounded-xl p-4">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-transparent text-[#809CFF] focus:outline-none border-none appearance-none"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-medium">Date of Birth</label>
            <div className="bg-[#ECF1FF] rounded-xl p-4">
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full bg-transparent text-[#809CFF] focus:outline-none border-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`py-3 rounded-[30px] font-medium text-lg ${
                isSubmitting
                  ? "bg-gray-300 text-gray-500"
                  : "bg-[#3742D1] text-white hover:bg-[#2a35b8]"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`py-3 rounded-[30px] font-medium text-lg flex items-center justify-center gap-2 ${
                isDeleting
                  ? "bg-gray-300 text-gray-500"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              <Delete />
              {isDeleting ? "Deleting..." : "Delete Profile"}
            </button>
          </div>
        </form>

        <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
          <button onClick={() => router.push("/")} className="p-2 flex flex-col items-center">
            <Home className="w-6 h-6 text-white" />
            <span className="text-white text-xs">Home</span>
          </button>
          <button onClick={() => router.push("/drawings/upload")} className="p-2 flex flex-col items-center">
            <Upload className="w-6 h-6 text-white" />
            <span className="text-white text-xs">Upload</span>
          </button>
          <button onClick={() => router.push("/account")} className="p-2 flex flex-col items-center">
            <AccountCircle className="w-6 h-6 text-white" />
            <span className="text-white text-xs">Account</span>
          </button>
        </nav>
      </div>
    </>
  );
}
