// Cafeteria 90s Theme - Reusable Style Classes

export const styles = {
  // Layout containers
  page: "min-h-screen bg-gradient-to-br from-tile-beige via-tray-tan to-mustard-yellow p-2 sm:p-4 font-body",
  container: "max-w-6xl mx-auto",
  
  // Header
  header: "bg-gradient-to-r from-ketchup-red to-neon-orange rounded-cafeteria shadow-tray p-4 sm:p-6 mb-4 border-4 border-chalkboard",
  title: "text-3xl sm:text-5xl font-display text-center text-milk-carton drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)] mb-3",
  statsBar: "flex flex-wrap justify-between items-center gap-3 text-sm sm:text-base font-semibold",
  statBadge: "bg-milk-carton px-3 py-2 rounded-xl border-3 border-chalkboard shadow-card",
  messageBox: "text-milk-carton text-center font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]",
  
  // Player areas
  playerArea: "rounded-cafeteria shadow-tray p-4 sm:p-6 border-4 transition-all duration-300",
  playerAreaActive: "rounded-2xl p-4 sm:p-6 border-4 bg-gradient-to-br from-teal-400 to-green-400 border-gray-800 shadow-lg transition-all duration-300",
  playerAreaInactive: "rounded-2xl p-4 sm:p-6 border-4 bg-gray-300 border-gray-500 opacity-80 transition-all duration-300",
  opponentArea: "rounded-cafeteria shadow-tray p-4 sm:p-6 border-4 transition-all duration-300",
  opponentAreaActive: "bg-gradient-to-br from-ketchup-red to-bubblegum-pink border-chalkboard",
  opponentAreaInactive: "bg-gradient-to-br from-gray-200 to-gray-300 border-gray-500 opacity-80",
  
  playerHeader: "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2",
  playerName: "text-xl sm:text-2xl font-display text-chalkboard drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]",
  playerStats: "flex gap-3 items-center text-sm sm:text-base font-bold",
  
  // Cards
  cardContainer: "flex flex-wrap gap-2 mb-3",
  card: "relative group transition-transform hover:scale-105 hover:-translate-y-1",
  cardInner: "bg-milk-carton border-4 border-chalkboard rounded-xl p-3 shadow-card cursor-default min-w-[80px] text-center",
  cardName: "font-display text-sm sm:text-base text-chalkboard",
  cardStar: "text-pickle-green text-xl",
  
  // Tooltip
  tooltip: "absolute z-20 bg-chalkboard text-milk-carton text-xs rounded-xl p-3 -top-32 left-0 w-64 shadow-tray opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-3 border-milk-carton",
  tooltipTitle: "font-display text-base mb-2 text-mustard-yellow",
  tooltipCategory: "text-bubblegum-pink text-xs mb-1",
  tooltipAbility: "text-mustard-yellow mt-2 italic",
  
  // Buttons
  buttonPrimary: "bg-gradient-to-b from-pickle-green to-teal-600 text-milk-carton font-display text-base sm:text-lg px-4 sm:px-6 py-3 rounded-xl border-4 border-chalkboard shadow-tray hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
  buttonSecondary: "bg-gradient-to-b from-mustard-yellow to-orange-400 text-chalkboard font-display text-base sm:text-lg px-4 sm:px-6 py-3 rounded-xl border-4 border-chalkboard shadow-tray hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed",
  buttonDanger: "bg-gradient-to-b from-ketchup-red to-red-700 text-milk-carton font-display text-base sm:text-lg px-4 sm:px-6 py-3 rounded-xl border-4 border-chalkboard shadow-tray hover:scale-105 active:scale-95 transition-transform",
  buttonSmall: "bg-gradient-to-b from-metal-gray to-gray-600 text-milk-carton font-bold text-xs sm:text-sm px-3 py-2 rounded-lg border-3 border-chalkboard shadow-card hover:scale-105 transition-transform",
  buttonIcon: "inline-block mr-1",
  
  // Modals
  modalOverlay: "fixed inset-0 bg-chalkboard bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm",
  modalContainer: "bg-gradient-to-br from-milk-carton to-tile-beige rounded-cafeteria max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-chalkboard shadow-tray",
  modalHeader: "sticky top-0 bg-gradient-to-r from-ketchup-red to-neon-orange border-b-4 border-chalkboard p-4 flex justify-between items-center",
  modalTitle: "font-display text-xl text-milk-carton",
  modalContent: "p-4 sm:p-6",
  modalClose: "text-milk-carton hover:text-mustard-yellow transition-colors",
  
  // Shop
  shopCard: "border-4 border-chalkboard rounded-cafeteria p-3 relative bg-milk-carton shadow-card hover:shadow-tray hover:scale-105 transition-all",
  shopCardDisabled: "border-4 border-gray-400 rounded-cafeteria p-3 relative bg-gray-200 opacity-60",
  shopBadge: "absolute -top-2 -right-2 bg-pickle-green text-milk-carton rounded-full w-7 h-7 flex items-center justify-center text-sm font-display border-3 border-chalkboard",
  shopCardTitle: "font-display text-sm sm:text-base text-chalkboard mb-2",
  shopCardCategory: "text-grape-juice text-xs font-bold",
  shopCardStats: "text-xs sm:text-sm my-1",
  shopCardAbility: "text-gray-700 italic text-xs my-2 min-h-[2em]",
  
  // Victory screen
  victoryContainer: "bg-gradient-to-br from-milk-carton to-tile-beige rounded-cafeteria shadow-tray p-4 sm:p-6 space-y-4 border-4 border-chalkboard",
  victoryTitle: "text-3xl sm:text-4xl font-display text-center",
  victoryWin: "text-pickle-green drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]",
  victoryLoss: "text-ketchup-red drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]",
  victoryTie: "text-mustard-yellow drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]",
  victorySubtitle: "text-center text-lg font-display text-chalkboard",
  
  cashEarnedBox: "bg-gradient-to-r from-pickle-green to-teal-500 border-4 border-chalkboard rounded-cafeteria p-4 text-center shadow-tray",
  cashEarnedTitle: "text-2xl font-display text-milk-carton drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]",
  cashEarnedDetails: "text-sm text-milk-carton mt-2 font-semibold",
  
  coldestCutBox: "bg-gradient-to-r from-blue-400 to-cyan-500 border-4 border-chalkboard rounded-cafeteria p-4 text-center shadow-tray",
  coldestCutTitle: "text-2xl font-display text-milk-carton drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]",
  coldestCutText: "text-sm text-milk-carton mt-1",
  
  // Username entry
  usernameContainer: "bg-gradient-to-br from-milk-carton to-tile-beige rounded-cafeteria shadow-tray p-8 border-4 border-chalkboard",
  usernameTitle: "text-3xl sm:text-4xl font-display text-center mb-4 text-ketchup-red drop-shadow-[0_3px_3px_rgba(0,0,0,0.2)]",
  usernameSubtitle: "text-center text-chalkboard mb-6 text-lg",
  usernameInput: "w-full border-4 border-chalkboard rounded-xl px-4 py-3 text-lg font-bold text-chalkboard bg-milk-carton focus:outline-none focus:border-pickle-green focus:ring-4 focus:ring-pickle-green/30 transition-all",
  
  // Matchmaking
  matchmakingContainer: "bg-gradient-to-br from-milk-carton to-tile-beige rounded-cafeteria shadow-tray p-12 text-center border-4 border-chalkboard",
  matchmakingText: "animate-pulse text-3xl font-display text-chalkboard drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]",
  
  // Indicators
  checkIcon: "text-pickle-green",
  clockIcon: "text-neon-orange animate-pulse",
  
  // Deck view
  deckGrid: "grid grid-cols-2 sm:grid-cols-3 gap-3",
  deckCardPlayed: "opacity-60",
  deckSection: "mb-6",
  deckSectionTitle: "font-display text-base sm:text-lg mb-3 text-chalkboard",
  
  // Special messages
  previewBox: "mb-3 p-3 bg-mustard-yellow border-4 border-chalkboard rounded-xl text-sm font-bold text-chalkboard shadow-card",
  finishedBox: "bg-pickle-green/20 border-4 border-pickle-green rounded-xl p-4 text-center shadow-card",
  finishedText: "font-display text-chalkboard",
};

export default styles;