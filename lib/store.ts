'use client';

import { create } from 'zustand';

interface User {
  userId: string;
  username: string;
  isLoggedIn: boolean;
}

interface Space {
  id: string;
  name: string;
  userId1: string;
  userId2: string | null;
}

interface AppState {
  user: User | null;
  currentSpace: Space | null;
  spaces: Space[];
  unreadNotifications: number;
  
  setUser: (user: User | null) => void;
  setCurrentSpace: (space: Space | null) => void;
  setSpaces: (spaces: Space[]) => void;
  setUnreadNotifications: (count: number) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentSpace: null,
  spaces: [],
  unreadNotifications: 0,
  
  setUser: (user) => set({ user }),
  setCurrentSpace: (space) => set({ currentSpace: space }),
  setSpaces: (spaces) => set({ spaces }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  logout: () => set({ user: null, currentSpace: null, spaces: [], unreadNotifications: 0 }),
}));
