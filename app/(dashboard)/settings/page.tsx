"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { User, Lock, Save, Loader2, Mail, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner"; // Import toast

export default function SettingsPage() {
  const { data: session, update } = useSession();
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Profile Form State
  const [name, setName] = useState(session?.user?.name || "");
  
  // Password Form State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // 1. Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);

    // Optimistic check: Don't call API if name hasn't changed
    if (name === session?.user?.name) {
        toast.info("No changes detected.");
        setLoadingProfile(false);
        return;
    }

    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`,
        { name },
        { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
      );

      // Update NextAuth Session with new name without reloading
      await update({ ...session, user: { ...session?.user, name: res.data.data.name } });
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoadingProfile(false);
    }
  };

  // 2. Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.warning("New passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 6) {
        toast.warning("Password must be at least 6 characters long.");
        return;
    }

    setLoadingPassword(true);

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/password`,
        { 
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        },
        { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
      );
      
      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      // Backend likely returns 401 if current password is wrong
      const msg = error.response?.data?.message || "Failed to update password.";
      toast.error(msg);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <DashboardLayout title="Account Settings">
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        
        {/* SECTION 1: GENERAL PROFILE */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <User size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">General Information</h3>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Email Field (READ ONLY) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={session?.user?.email || ""}
                      disabled
                      className="w-full pl-10 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={10} /> Email cannot be changed for security reasons.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SECTION 2: SECURITY */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
             <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Security</h3>
          </div>

          <div className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}