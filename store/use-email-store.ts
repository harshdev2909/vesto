"use client"

import { create } from "zustand"

type State = {
  email: string
}
type Actions = {
  setEmail: (email: string) => void
}

const KEY = "vesto:email"

export const useEmailStore = create<State & Actions>((set) => ({
  email: typeof window !== "undefined" ? localStorage.getItem(KEY) || "" : "",
  setEmail: (email: string) => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, email)
    set({ email })
  },
}))
