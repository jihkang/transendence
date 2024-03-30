import { create, SetState } from "zustand";
import { Socket } from "socket.io-client";
import { customAxios } from "./customAxios";
import { NavigateFunction } from "react-router-dom";
interface Token {
  id: string;
  nick: string;
  state: string;
}
interface UserStore {
  chatSocket: Socket | null;
  setChatSocket: (value: Socket | null) => void;
  gameSocket: Socket | null;
  setGameSocket: (value: Socket | null) => void;
  roomId: string | null;
  setRoomId: (value: string | null) => void;
  userId: string | null | undefined;
  setUserId: (value: string | null) => void;
  nick: string | undefined;
  setNick: (value: string | undefined) => void;
  img: File | undefined;
  setImg: (value: File | undefined) => void;
  twoFactor: boolean | undefined;
  setTwoFactor: (value: boolean | undefined) => void;
  cookies: Token | null | undefined;
  setCookies: (value: Token | undefined) => void;
  cookie: any | null | undefined;
  setCookie: (value: any | undefined) => void;
  toId: string | null | undefined;
  setToId: (value: string | null) => void;
  logOut: (value: NavigateFunction) => void;
}

export const useUserStore = create<UserStore>((set: SetState<UserStore>) => ({
  chatSocket: null,
  setChatSocket: (value) => set((state) => ({ chatSocket: value })),
  gameSocket: null,
  setGameSocket: (value) => set((state) => ({ gameSocket: value })),
  roomId: "",
  setRoomId: (value) => set((state) => ({ roomId: value })),
  userId: "",
  setUserId: (value) => set((state) => ({ userId: value })),
  nick: "",
  setNick: (value) => set((state) => ({ nick: value })),
  img: undefined,
  setImg: (value) => set((state) => ({ img: value })),
  twoFactor: false,
  setTwoFactor: (value) => set((state) => ({ twoFactor: value })),
  cookies: undefined,
  setCookies: (value) => set((state) => ({ cookies: value })),
  cookie: "",
  setCookie: (value) => set((state) => ({ cookie: value })),
  toId: "",
  setToId: (value) => set((state) => ({ toId: value })),
  logOut: async (move) => {
    localStorage.removeItem("login");
    localStorage.removeItem("id");
    try {
      const response = await customAxios.get("auth/logout");
      move("/login");
    } catch (error) {
      alert("error");
      move("/login");
    }
  },
}));
