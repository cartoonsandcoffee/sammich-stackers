// Tailwind CSS class strings - 90s cafeteria aesthetic
const styles = {
  // Layout
  page: "min-h-screen bg-gradient-to-br from-linoleum via-tile-beige to-mustard-yellow/30",
  container: "max-w-7xl mx-auto p-4 sm:p-6",
  
  // Header
  header: "bg-gradient-to-r from-ketchup-red via-mustard-yellow to-pickle-green p-4 sm:p-6 rounded-cafeteria shadow-tray mb-6 border-4 border-chalkboard",
  title: "font-display text-3xl sm:text-5xl text-center text-chalkboard mb-4",
  statsBar: "flex flex-col sm:flex-row justify-between items-center gap-3",
  statBadge: "bg-milk-carton text-chalkboard font-bold px-4 py-2 rounded-cafeteria shadow-card border-3 border-chalkboard",
  messageBox: "bg-chalkboard text-milk-carton font-body px-4 py-2 rounded-cafeteria shadow-inner text-sm sm:text-base text-center w-full sm:w-auto",
  
  // Username Entry
  usernameContainer: "bg-gradient-to-br from-milk-carton to-tile-beige p-8 rounded-cafeteria shadow-tray border-4 border-chalkboard max-w-2xl mx-auto",
  usernameTitle: "font-display text-2xl sm:text-3xl text-chalkboard mb-3 text-center",
  usernameSubtitle: "font-body text-metal-gray mb-6 text-center",
  usernameInput: "w-full px-4 py-3 border-4 border-chalkboard rounded-cafeteria font-body text-lg focus:outline-none focus:border-pickle-green bg-linoleum",
  
  // Matchmaking
  matchmakingContainer: "text-center py-12",
  matchmakingText: "font-display text-3xl text-chalkboard animate-pulse",
  
  // Game Areas
  opponentAreaActive: "bg-gradient-to-br from-ketchup-red/20 to-ketchup-red/10 p-4 rounded-cafeteria shadow-tray border-4 border-ketchup-red/50",
  opponentAreaInactive: "bg-gradient-to-br from-metal-gray/20 to-metal-gray/10 p-4 rounded-cafeteria shadow-tray border-4 border-metal-gray/50",
  playerAreaActive: "bg-gradient-to-br from-pickle-green/20 to-pickle-green/10 p-4 rounded-cafeteria shadow-tray border-4 border-pickle-green/50",
  playerAreaInactive: "bg-gradient-to-br from-metal-gray/20 to-metal-gray/10 p-4 rounded-cafeteria shadow-tray border-4 border-metal-gray/50",
  
  playerHeader: "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2",
  playerName: "font-display text-xl sm:text-2xl text-chalkboard",
  playerStats: "flex gap-3 text-sm sm:text-base items-center flex-wrap",
  
  checkIcon: "text-pickle-green",
  clockIcon: "text-mustard-yellow animate-pulse",
  
  // Cards
  cardContainer: "flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start",
  card: "relative group cursor-default",
  cardInner: "bg-milk-carton border-4 border-chalkboard rounded-xl p-3 shadow-card cursor-default min-w-[80px] text-center transition-transform hover:scale-105 hover:-translate-y-1",
  cardImage: "w-24 h-24 mx-auto mb-2 object-contain",
  cardName: "font-display text-sm sm:text-base text-chalkboard",
  cardStar: "text-pickle-green text-xl",
  
  // Tooltip - FIXED z-index and position
  tooltip: "absolute z-[9999] bg-chalkboard text-milk-carton text-xs rounded-xl p-3 -top-36 left-0 w-64 shadow-tray opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-3 border-milk-carton",
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
  modalContainer: "bg-gradient-to-br from-milk-carton to-tile-beige rounded-cafeteria shadow-tray border-4 border-chalkboard max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col",
  modalHeader: "flex justify-between items-center p-4 sm:p-6 border-b-4 border-chalkboard bg-gradient-to-r from-pickle-green to-mustard-yellow",
  modalTitle: "font-display text-xl sm:text-2xl text-chalkboard",
  modalClose: "bg-ketchup-red text-milk-carton p-2 rounded-cafeteria hover:scale-110 transition-transform border-3 border-chalkboard",
  modalContent: "p-4 sm:p-6 overflow-y-auto flex-1",
  
  // Deck Modal
  deckSection: "mb-6",
  deckSectionTitle: "font-display text-lg sm:text-xl text-chalkboard mb-3",
  deckGrid: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3",
  deckCardPlayed: "opacity-60",
  
  // Preview/Finish boxes
  previewBox: "bg-mustard-yellow text-chalkboard font-body px-4 py-2 rounded-cafeteria shadow-card border-3 border-chalkboard text-center mt-3",
  finishedBox: "bg-pickle-green text-milk-carton font-body px-4 py-3 rounded-cafeteria shadow-card border-3 border-chalkboard text-center mt-3",
  finishedText: "font-display text-lg",
  
  // Victory Screen
  victoryContainer: "bg-gradient-to-br from-milk-carton to-tile-beige p-6 sm:p-8 rounded-cafeteria shadow-tray border-4 border-chalkboard",
  victoryTitle: "font-display text-3xl sm:text-5xl text-center mb-2",
  victoryWin: "text-pickle-green",
  victoryLoss: "text-ketchup-red",
  victoryTie: "text-mustard-yellow",
  victorySubtitle: "font-body text-metal-gray text-center mb-6 text-lg",
  victoryScores: "grid grid-cols-1 md:grid-cols-2 gap-6 my-6",
  victoryPlayer: "text-center",
  victoryScore: "text-4xl sm:text-6xl font-display text-chalkboard my-4",
  
  cashEarnedBox: "bg-gradient-to-r from-pickle-green to-teal-600 text-milk-carton p-4 rounded-cafeteria shadow-card border-3 border-chalkboard mb-4",
  cashEarnedTitle: "font-display text-xl sm:text-2xl mb-2",
  cashEarnedDetails: "font-body text-sm sm:text-base",
  
  coldestCutBox: "bg-gradient-to-r from-blue-400 to-cyan-400 text-chalkboard p-4 rounded-cafeteria shadow-card border-3 border-chalkboard mb-4",
  coldestCutTitle: "font-display text-xl sm:text-2xl mb-1",
  coldestCutText: "font-body text-sm sm:text-base",
  
  // Shop
  shopCard: "bg-linoleum p-4 rounded-cafeteria shadow-card border-3 border-chalkboard hover:border-pickle-green transition-colors cursor-pointer flex flex-col relative",
  shopCardDisabled: "bg-metal-gray/20 p-4 rounded-cafeteria shadow-card border-3 border-metal-gray opacity-60 cursor-not-allowed flex flex-col relative",
  shopCardTitle: "font-display text-base sm:text-lg text-chalkboard mb-2",
  shopCardStats: "font-body text-xs sm:text-sm text-chalkboard mb-2 flex-1",
  shopCardCategory: "text-bubblegum-pink font-bold text-xs mb-1",
  shopCardAbility: "text-pickle-green italic text-xs mb-3 min-h-[2.5rem]",
  shopBadge: "absolute -top-2 -right-2 bg-blue-500 text-milk-carton font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-chalkboard shadow-card"
};

export default styles;