"use client";

import { useUserInitialization } from "@providers/user-provider";
import SettingsDialog from "./dialogs/settings-dialog";

interface UserSettingsProps {}

const UserSettings = ({}: UserSettingsProps) => {
  const { isInitialized } = useUserInitialization();

  return (
    <div className="flex flex-col gap-5 dark:border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-neutral-700 dark:text-neutral-400">User</p>
        </div>
        <SettingsDialog />
      </div>
    </div>
  );
};

export default UserSettings;
