"use client";
import { useState } from "react";
import { X } from "lucide-react";
import EditProfileForm from "./EditProfileForm";

export default function ProfileManager({
  selectedProfile,
  editProfileData,
  setEditProfileData,
  handleSaveProfile,
  savingProfile,
  handleDeleteProfile,
  deletingProfile,
  editingProfile,
  setEditingProfile,
}) {
  const handleCancelEdit = () => {
    setEditingProfile(false);
  };

  const onSave = (e) => {
    handleSaveProfile(e).then((success) => {
      if (success) {
        setEditingProfile(false);
      }
    });
  };

  if (!selectedProfile) return null;

  return (
    <>
      {editingProfile && (
        <EditProfileForm
          editProfileData={editProfileData}
          setEditProfileData={setEditProfileData}
          handleSaveProfile={onSave}
          handleCancelEdit={handleCancelEdit}
          savingProfile={savingProfile}
        />
      )}
    </>
  );
}
