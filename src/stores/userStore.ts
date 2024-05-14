import { User } from "@auth0/auth0-react";
import { create } from "zustand";
import zukeeper from "zukeeper";

type UserStore = {
  user: User;
  setUser: (user: User) => void;
};

const useUserStore = create<UserStore>(
  zukeeper((set: any) => ({
    user: {} as User,
    setUser: (user: User) => set(() => ({ user })),
  }))
);

export default useUserStore;