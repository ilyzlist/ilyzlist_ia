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
          throw new Error("Aucun ID d'enfant fourni");
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error("Non authentifié");
        }

        const { data: child, error } = await supabase
          .from("children")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("[SUPABASE ERROR]", error);
          throw new Error("Erreur de base de données");
        }

        if (!child) {
          throw new Error("Profil enfant non trouvé");
        }

        setFormData({
          name: child.name || child.full_name || "",
          gender: child.gender || "",
          birth_date: child.birth_date || child.date_of_birth || "",
        });

      } catch (err) {
        console.error("[FETCH ERROR]", err);
        toast.error(err.message || "Échec du chargement");
        router.push("/children-profiles");
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Non authentifié");

      if (!formData.name.trim()) throw new Error("Le nom est requis");

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

      toast.success("Profil mis à jour avec succès");
      router.push("/children-profiles");
    } catch (err) {
      console.error("[UPDATE ERROR]", err);
      toast.error(err.message || "Échec de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce profil ? Cette action est irréversible.")) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Profil supprimé avec succès");
      router.push("/children-profiles");
    } catch (err) {
      console.error("[DELETE ERROR]", err);
      toast.error(err.message || "Échec de la suppression");
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
        <title>Modifier le profil | Ilyzlist</title>
      </Head>

      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-24">
        <header className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-[#ECF1FF] transition-colors"
            aria-label="Retour"
          >
            <ArrowBack className="text-[#3742D1]" />
          </button>
          <h1 className="text-2xl font-bold text-[#3742D1]">Modifier le profil</h1>
          <div className="w-10"></div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-lg font-medium">Nom complet</label>
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
            <label className="block text-lg font-medium">Sexe</label>
            <div className="bg-[#ECF1FF] rounded-xl p-4">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-transparent text-[#809CFF] focus:outline-none border-none appearance-none"
              >
                <option value="">Sélectionner</option>
                <option value="male">Masculin</option>
                <option value="female">Féminin</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-medium">Date de naissance</label>
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
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
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
              {isDeleting ? "Suppression..." : "Supprimer le profil"}
            </button>
          </div>
        </form>

        <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
          <button onClick={() => router.push("/")} className="p-2 flex flex-col items-center">
            <Home className="w-6 h-6 text-white" />
            <span className="text-white text-xs">Accueil</span>
          </button>
          <button onClick={() => router.push("/drawings/upload")} className="p-2 flex flex-col items-center">
            <Upload className="w-6 h-6 text-white" />
            <span className="text-white text-xs">Upload</span>
          </button>
          <button onClick={() => router.push("/account")} className="p-2 flex flex-col items-center">
            <AccountCircle className="w-6 h-6 text-white" />
            <span className="text-white text-xs">Compte</span>
          </button>
        </nav>
      </div>
    </>
  );
}
