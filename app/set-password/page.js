"use client";
import { useForm } from "react-hook-form";

export default function SetPassword() {
  const supabase = createClient();
  const { register, handleSubmit, watch } = useForm();
  const password = watch("password");

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-[#32373C] mb-4">Set Password</h1>
        <p className="text-[#32373C] mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[#32373C] mb-2">Password</label>
            <input
              {...register("password", { required: true, minLength: 8 })}
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3742D1]"
              placeholder="*********************"
            />
          </div>

          <div>
            <label className="block text-[#32373C] mb-2">
              Confirm Password
            </label>
            <input
              {...register("confirmPassword", {
                required: true,
                validate: (value) =>
                  value === password || "Passwords don't match",
              })}
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3742D1]"
              placeholder="*********************"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#3742D1] text-white py-2 rounded-lg hover:bg-[#2a35b8] transition"
          >
            Create New Password
          </button>
        </form>
      </div>
    </div>
  );
}


