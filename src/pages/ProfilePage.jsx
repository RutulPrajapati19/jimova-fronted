import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: "", email: "", mobile: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setProfile(data);
      setForm({ name: data.name, mobile: data.mobile || "" });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }
      const updated = await res.json();
      setProfile(updated);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <div className="profile-card">
        <div className="profile-field">
          <label>Name</label>
          {editing ? (
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          ) : (
            <p>{profile.name}</p>
          )}
        </div>

        <div className="profile-field">
          <label>Email</label>
          <p>{profile.email}</p>
          <small>Email cannot be changed</small>
        </div>

        <div className="profile-field">
          <label>Mobile</label>
          {editing ? (
            <input
              type="tel"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              placeholder="+91XXXXXXXXXX"
            />
          ) : (
            <p>{profile.mobile || "Not set"}</p>
          )}
        </div>

        <div className="profile-actions">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-primary">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;