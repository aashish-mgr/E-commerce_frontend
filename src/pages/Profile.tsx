import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera } from "lucide-react";
import type { User } from "../types";
import { getImageUrl } from "../api/index";
import { updateUserProfile, changeUserPassword } from "../store/authSlice";
import { toast, showErrorToast } from "../lib/toast";
import { humanize } from "../lib/format";
import { Container } from "../Components/ui/Container";
import { Button } from "../Components/ui/Button";
import { Field } from "../Components/ui/Field";
import { Input } from "../Components/ui/Input";
import { PageHeader } from "../Components/ui/PageHeader";
import { SkeletonText } from "../Components/ui/Skeleton";

export default function Profile() {
  const dispatch = useDispatch<any>();
  const authState = useSelector((state: any) => state.auth);
  const user = authState.user as User | null;

  const [userName, setUserName] = useState(user?.userName ?? "");
  const [userEmail, setUserEmail] = useState(user?.userEmail ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const isGoogleAccount = user?.provider === "google";
  const avatarSrc = avatarPreview || (user?.avatar ? getImageUrl(user.avatar) : "");
  const avatarInitial = user?.userName?.[0]?.toUpperCase() ?? "?";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    const formData = new FormData();
    formData.append("userName", userName.trim());
    formData.append("userEmail", userEmail.trim());
    if (avatarFile) formData.append("avatar", avatarFile);

    setSavingProfile(true);
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      toast.success("Profile updated successfully!");
      setAvatarFile(null);
      setAvatarPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      showErrorToast(error, "Unable to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await dispatch(changeUserPassword({ currentPassword, newPassword })).unwrap();
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showErrorToast(error, "Unable to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-paper">
        <Container className="max-w-3xl py-10">
          <SkeletonText lines={6} />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Container className="max-w-3xl">
        <PageHeader
          className="mt-8"
          title="Your profile"
          description="How sellers and couriers see you when an order is on its way."
        />

        <div className="py-8">
          <section aria-labelledby="details-heading">
            <h2
              id="details-heading"
              className="border-b border-line pb-3 font-display text-base font-semibold text-ink"
            >
              Personal details
            </h2>

            <div className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-start">
              <div className="flex flex-col items-center gap-3">
                <span className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-pine-soft font-display text-3xl font-semibold text-pine">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={user.userName} className="size-full object-cover" />
                  ) : (
                    avatarInitial
                  )}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="sr-only"
                  id="avatar-upload"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera aria-hidden className="size-4" />
                  Change photo
                </Button>
              </div>

              <form onSubmit={handleProfileSubmit} className="flex min-w-0 flex-1 flex-col gap-5">
                <Field label="Full name" required>
                  <Input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your name"
                  />
                </Field>

                <Field label="Email" required>
                  <Input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </Field>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-paper-2 px-3 py-1 text-xs font-medium text-ink-2">
                    {humanize(user.userRole)}
                  </span>
                  <span className="text-xs text-muted">
                    {isGoogleAccount ? "Signed in with Google" : "Email account"}
                  </span>
                </div>

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={savingProfile}
                    loadingLabel="Saving"
                  >
                    Save changes
                  </Button>
                </div>
              </form>
            </div>
          </section>

          <section aria-labelledby="password-heading" className="mt-10">
            <h2
              id="password-heading"
              className="border-b border-line pb-3 font-display text-base font-semibold text-ink"
            >
              Password
            </h2>

            {isGoogleAccount ? (
              <p className="pt-4 max-w-prose text-sm text-muted">
                Your account uses Google sign-in, so password management is handled by
                Google.
              </p>
            ) : (
              <form
                onSubmit={handlePasswordSubmit}
                className="flex max-w-md flex-col gap-5 pt-6"
              >
                <Field label="Current password" required>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </Field>

                <Field label="New password" hint="At least 6 characters" required>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Field>

                <Field label="Confirm new password" required>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Field>

                <div>
                  <Button
                    type="submit"
                    variant="solid"
                    loading={savingPassword}
                    loadingLabel="Updating"
                  >
                    Update password
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}