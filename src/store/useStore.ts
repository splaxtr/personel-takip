import { create } from 'zustand';

type Store = {
  refreshAt: number;
  refresh: () => void;
  varsayilanGunlukUcret: number;
  setVarsayilanGunlukUcret: (v: number) => void;
};

export const useStore = create<Store>((set) => ({
  refreshAt: 0,
  refresh: () => set({ refreshAt: Date.now() }),
  varsayilanGunlukUcret: 0,
  setVarsayilanGunlukUcret: (v) => set({ varsayilanGunlukUcret: v }),
}));
