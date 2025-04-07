// Reexport all atoms from various store files
export {
  // UI atoms
  loadingAtom,
  detailsModalAtom,
} from './uiAtoms';

export {
  // User atoms
  isLoggedInAtom,
} from './userAtoms';

export {
  // Anime atoms
  watchlistedIdsAtom,
  watchlistedAnimesAtom,
  currentCalendarAtom,
  animeModelAtom,
  selectedAnimeAtom,
} from './animeAtoms';

export {
  // Watchlist store and atoms
  watchlistItemsAtom,
  addToWatchlistAction,
  removeFromWatchlistAction,
  updateWatchlistStatusAction,
  useWatchlistStore,
  addWatchlistChangeListener,
  emitWatchlistChange,
} from './watchlistStore';
