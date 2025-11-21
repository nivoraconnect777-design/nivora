import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isCreatePostModalOpen: boolean;
  isCreateReelModalOpen: boolean;
  isCreateStoryModalOpen: boolean;
  toggleMobileMenu: () => void;
  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;
  openCreateReelModal: () => void;
  closeCreateReelModal: () => void;
  openCreateStoryModal: () => void;
  closeCreateStoryModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isCreatePostModalOpen: false,
  isCreateReelModalOpen: false,
  isCreateStoryModalOpen: false,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  openCreatePostModal: () => set({ isCreatePostModalOpen: true }),
  closeCreatePostModal: () => set({ isCreatePostModalOpen: false }),

  openCreateReelModal: () => set({ isCreateReelModalOpen: true }),
  closeCreateReelModal: () => set({ isCreateReelModalOpen: false }),

  openCreateStoryModal: () => set({ isCreateStoryModalOpen: true }),
  closeCreateStoryModal: () => set({ isCreateStoryModalOpen: false }),
}));
