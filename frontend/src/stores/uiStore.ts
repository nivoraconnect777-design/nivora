import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isCreatePostModalOpen: boolean;
  isCreateReelModalOpen: boolean;
  isCreateStoryModalOpen: boolean;
  isCreateMenuOpen: boolean;
  toggleMobileMenu: () => void;
  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;
  openCreateReelModal: () => void;
  closeCreateReelModal: () => void;
  openCreateStoryModal: () => void;
  closeCreateStoryModal: () => void;
  openCreateMenu: () => void;
  closeCreateMenu: () => void;
  feedRefreshTrigger: number;
  triggerFeedRefresh: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isCreatePostModalOpen: false,
  isCreateReelModalOpen: false,
  isCreateStoryModalOpen: false,
  isCreateMenuOpen: false,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  openCreatePostModal: () => set({ isCreatePostModalOpen: true }),
  closeCreatePostModal: () => set({ isCreatePostModalOpen: false }),

  openCreateReelModal: () => set({ isCreateReelModalOpen: true }),
  closeCreateReelModal: () => set({ isCreateReelModalOpen: false }),

  openCreateStoryModal: () => set({ isCreateStoryModalOpen: true }),
  closeCreateStoryModal: () => set({ isCreateStoryModalOpen: false }),

  openCreateMenu: () => set({ isCreateMenuOpen: true }),
  closeCreateMenu: () => set({ isCreateMenuOpen: false }),

  feedRefreshTrigger: 0,
  triggerFeedRefresh: () => set((state) => ({ feedRefreshTrigger: state.feedRefreshTrigger + 1 })),
}));
