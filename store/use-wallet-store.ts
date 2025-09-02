"use client"

import { create } from "zustand"

type State = {
  address: string | null
}
type Actions = {
  connect: () => void
  disconnect: () => void
}

export const useWalletStore = create<State & Actions>((set) => ({
  address: null,
  connect: () =>
    set({
      // Mocked deterministic address
      address: "0xA11CE5A11CE5a11Ce5a11CE5A11cE5A11Ce5A11c",
    }),
  disconnect: () => set({ address: null }),
}))
