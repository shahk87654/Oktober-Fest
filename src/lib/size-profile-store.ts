"use client";

import { create } from "zustand";
import type { SizeProfile, UnitSystem } from "./size-types";

export const SIZE_PROFILE_KEY = "alpine-size-profile";
export const UNIT_KEY = "alpine-size-unit";

interface SizeProfileState {
  profile: SizeProfile | null;
  unit: UnitSystem;
  hydrate: () => void;
  saveProfile: (profile: SizeProfile) => void;
  setUnit: (unit: UnitSystem) => void;
  deleteProfile: () => void;
}

export const useSizeProfileStore = create<SizeProfileState>((set) => ({
  profile: null,
  unit: "metric",
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const unit = window.localStorage.getItem(UNIT_KEY);
      const raw = window.localStorage.getItem(SIZE_PROFILE_KEY);
      set({
        unit: unit === "imperial" ? "imperial" : "metric",
        profile: raw ? JSON.parse(raw) as SizeProfile : null,
      });
    } catch {
      set({ profile: null, unit: "metric" });
    }
  },
  saveProfile: (profile) => {
    set({ profile });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIZE_PROFILE_KEY, JSON.stringify(profile));
    }
  },
  setUnit: (unit) => {
    set({ unit });
    if (typeof window !== "undefined") window.localStorage.setItem(UNIT_KEY, unit);
  },
  deleteProfile: () => {
    set({ profile: null });
    if (typeof window !== "undefined") window.localStorage.removeItem(SIZE_PROFILE_KEY);
  },
}));
