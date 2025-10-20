import React, { useState, useReducer, useEffect } from 'react';
import { Eye, X, Clock, CheckCircle } from 'lucide-react';
import { CARD_DATABASE, createCard, createStarterDeck, getOpponentName } from './cardData';
import { calculateScores, generateBotDeck } from './gameLogic';
import { fetchOpponentDeck, saveWinningDeck } from './supabase';
import { gameReducer } from './gameReducer';
import { CardDisplay } from './components/CardDisplay';
import styles from './styles';

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {
      phase: 'username_entry',
      username: '',
      playerCollection: createStarterDeck(),
      playerName: "You",
      cash: 0,
      wins: 0,
      losses: 0,
      matchNumber: 1,
      permanentBreadBonus: 0,
      playerDeck: [],
      playerSandwich: [],
      playerBreadCard: null,
      playerFinalScore: null,
      playerFinished: false,
      playerColdestCut: false,
      nextCardPreview: null,
      opponentDeck: [],
      opponentSandwich: [],
      opponentBreadCard: null,
      opponentFinalScore: null,
      opponentFinished: false,
      opponentName: "Opponent",
      opponentDeckId: null,
      currentTurn: 'player',
      roundResult: null,
      message: "Welcome!",
      loading: false,
      showManualSave: false,
      manualSaveData: null
    };
  }
  
  const savedUsername = localStorage.getItem('sammich_username');
  const savedCash = localStorage.getItem('sammich_cash');
  const savedWins = localStorage.getItem('sammich_wins');
  const savedLosses = localStorage.getItem('sammich_losses');
  const savedMatch = localStorage.getItem('sammich_match');
  const savedBreadBonus = localStorage.getItem('sammich_bread_bonus');
  
  return {
    phase: savedUsername ? 'matchmaking' : 'username_entry',
    username: savedUsername || '',
    playerCollection: createStarterDeck(),
    playerName: savedUsername ? `You (${savedUsername})` : "You",
    cash: savedCash ? parseInt(savedCash) : 0,
    wins: savedWins ? parseInt(savedWins) : 0,
    losses: savedLosses ? parseInt(savedLosses) : 0,
    matchNumber: savedMatch ? parseInt(savedMatch) : 1,
    permanentBreadBonus: savedBreadBonus ? parseInt(savedBreadBonus) : 0,
    playerDeck: [],
    playerSandwich: [],
    playerBreadCard: null,
    playerFinalScore: null,
    playerFinished: false,
    playerColdestCut: false,
    nextCardPreview: null,
    opponentDeck: [],
    opponentSandwich: [],
    opponentBreadCard: null,
    opponentFinalScore: null,
    opponentFinished: false,
    opponentName: "Opponent",
    opponentDeckId: null,
    currentTurn: 'player',
    roundResult: null,
    message: "Welcome!",
    loading: false,
    showManualSave: false,
    manualSaveData: null
  };
};

export default function SammichStackers() {
  const [state, dispatch] = useReducer(gameReducer, null, getInitialState);
  const [showDeck, setShowDeck] = useState(false);
  const [showOpponentDeck, setShowOpponentDeck] = useState(false);
  const [showRemoveCard, setShowRemoveCard] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  
  useEffect(() => {
    const savedDeck = localStorage.getItem('sammich_deck');
    if (savedDeck) {
      try {
        const parsed = JSON.parse(savedDeck);
        const reconstructed = parsed.map(card => createCard(card.name, card.permanentFlavorBonus));
        dispatch({ type: 'LOAD_DECK', deck: reconstructed });
      } catch (e) {
        console.error('Failed to load deck:', e);
      }
    }
  }, []);
  
  useEffect(() => {
    if (state.playerCollection.length > 0) {
      const deckToSave = state.playerCollection.map(card => ({
        name: card.name,
        permanentFlavorBonus: card.permanentFlavorBonus || 0
      }));
      localStorage.setItem('sammich_deck', JSON.stringify(deckToSave));
    }
  }, [state.playerCollection]);
  
  useEffect(() => {
    if (state.phase === 'matchmaking' && state.username) {
      const loadMatch = async () => {
        const opponentData = await fetchOpponentDeck(state.matchNumber, createCard, generateBotDeck, getOpponentName);
        dispatch({ 
          type: 'INIT_ROUND', 
          playerCards: state.playerCollection,
          opponentDeck: opponentData.deck,
          opponentName: opponentData.opponentName,
          opponentDeckId: opponentData.deckId
        });
      };
      loadMatch();
    }
  }, [state.phase, state.matchNumber]);
  
  useEffect(() => {
    if (state.phase === 'round_end' && state.roundResult === 'win') {
      const save = async () => {
        const result = await saveWinningDeck(state.username, state.matchNumber, state.playerCollection, state.playerFinalScore, state.permanentBreadBonus);
        if (!result.success && result.deckData) {
          dispatch({ type: 'SHOW_MANUAL_SAVE', deckData: result.deckData, jsonString: result.jsonString });
        }
      };
      save();
    }
  }, [state.phase, state.roundResult]);
  
  useEffect(() => {
    if (state.phase === 'playing' && state.currentTurn === 'opponent' && !state.opponentFinished) {
      const timer = setTimeout(() => {
        dispatch({ type: 'OPPONENT_TURN' });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state.currentTurn, state.phase, state.opponentFinished, state.opponentSandwich.length]);
  
  const playerScores = calculateScores(state.playerSandwich, state.permanentBreadBonus);
  const opponentScores = state.opponentSandwich.length > 0 ? calculateScores(state.opponentSandwich, 0) : { flavor: 0, yuck: 0, cash: 0 };
  const shopCards = Object.values(CARD_DATABASE).filter(c => c.cost !== null).sort((a, b) => a.cost - b.cost);
  const opponentName = state.opponentName || getOpponentName(state.matchNumber);
  
  const calculateCashEarned = () => {
    const playerScores = calculateScores(state.playerSandwich, state.permanentBreadBonus);
    const cashFromCards = playerScores.cash;
    const winBonus = state.roundResult === 'win' ? 5 : 3;
    const coldestCutBonus = state.playerColdestCut ? 5 : 0;
    return { total: cashFromCards + winBonus + coldestCutBonus, cashFromCards, winBonus, coldestCutBonus };
  };
  
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🥪 Sammich Stackers 🥪</h1>
          <div className={styles.statsBar}>
            <div className="flex gap-2 flex-wrap">
              <span className={styles.statBadge}>💰 ${state.cash}</span>
              <span className={styles.statBadge}>🏆 {state.wins}</span>
              <span className={styles.statBadge}>💔 {state.losses}</span>
              <span className={styles.statBadge}>🎯 Match {state.matchNumber}</span>
            </div>
            <div className={styles.messageBox}>{state.message}</div>
          </div>
        </div>
        
        {state.phase === 'username_entry' && (
          <div className={styles.usernameContainer}>
            <h2 className={styles.usernameTitle}>Welcome to Sammich Stackers!</h2>
            <p className={styles.usernameSubtitle}>Enter your username to start playing</p>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Username"
                maxLength={20}
                className={styles.usernameInput}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && usernameInput.trim()) {
                    dispatch({ type: 'SET_USERNAME', username: usernameInput.trim() });
                  }
                }}
              />
              <button
                onClick={() => usernameInput.trim() && dispatch({ type: 'SET_USERNAME', username: usernameInput.trim() })}
                disabled={!usernameInput.trim()}
                className={`${styles.buttonPrimary} w-full mt-4`}
              >
                Start Playing
              </button>
            </div>
          </div>
        )}
        
        {state.phase === 'matchmaking' && (
          <div className={styles.matchmakingContainer}>
            <div className={styles.matchmakingText}>Finding opponent...</div>
          </div>
        )}
        
        {state.phase === 'playing' && (
          <div className="space-y-4">
            <div className={state.opponentFinished ? styles.opponentAreaInactive : styles.opponentAreaActive}>
              <div className={styles.playerHeader}>
                <h2 className={styles.playerName}>
                  {opponentName}
                  {state.opponentFinished && <CheckCircle size={20} className={`${styles.checkIcon} inline ml-2`} />}
                  {state.currentTurn === 'opponent' && !state.opponentFinished && <Clock size={20} className={`${styles.clockIcon} inline ml-2`} />}
                </h2>
                <div className={styles.playerStats}>
                  {state.opponentFinished ? (
                    <span className="font-bold">Final: {state.opponentFinalScore} flavor</span>
                  ) : (
                    <>
                      <span title="Flavor">🍽️ {opponentScores.flavor}</span>
                      <span title="Yuck" className={opponentScores.yuck >= 3 ? 'text-red-600' : ''}>🤢 {opponentScores.yuck}</span>
                      <span title="Cash">💵 {opponentScores.cash}</span>
                      <button onClick={() => setShowOpponentDeck(true)} className={styles.buttonSmall}>
                        <Eye size={12} className="inline mr-1" /> Deck
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.cardContainer}>
                {state.opponentSandwich.map((card, i) => (
                  <CardDisplay key={card.id} card={card} sandwich={state.opponentSandwich} position={i} permanentBreadBonus={0} />
                ))}
              </div>
            </div>
            
            <div className={state.playerFinished ? styles.playerAreaInactive : styles.playerAreaActive}>
              <div className={styles.playerHeader}>
                <h2 className={styles.playerName}>
                  {state.playerName}
                  {state.playerFinished && <CheckCircle size={20} className={`${styles.checkIcon} inline ml-2`} />}
                </h2>
                <div className={styles.playerStats}>
                  {state.playerFinished ? (
                    <span className="font-bold">Score: {state.playerFinalScore}</span>
                  ) : (
                    <>
                      <span title="Flavor">🍽️ {playerScores.flavor}</span>
                      <span title="Yuck" className={playerScores.yuck >= 3 ? 'text-red-600' : ''}>🤢 {playerScores.yuck}</span>
                      <span title="Cash">💵 {playerScores.cash}</span>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.cardContainer}>
                {state.playerSandwich.map((card, i) => (
                  <CardDisplay key={card.id} card={card} sandwich={state.playerSandwich} position={i} permanentBreadBonus={state.permanentBreadBonus} />
                ))}
              </div>
              
              {state.nextCardPreview && (
                <div className={styles.previewBox}>
                  🍅 Next: <strong>{state.nextCardPreview.name}</strong>
                </div>
              )}
              
              {!state.playerFinished && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => dispatch({ type: 'FLIP_CARD' })}
                    disabled={state.playerDeck.length === 0 || state.currentTurn !== 'player'}
                    className={styles.buttonPrimary}
                  >
                    {state.currentTurn === 'player' ? `Flip Card (${state.playerDeck.length})` : 'Opponent\'s Turn...'}
                  </button>
                  <button 
                    onClick={() => dispatch({ type: 'PLAY_BREAD' })} 
                    disabled={state.currentTurn !== 'player'}
                    className={styles.buttonSecondary}
                  >
                    Play Bread & Finish
                  </button>
                  <button onClick={() => setShowDeck(true)} className={styles.buttonSmall}>
                    <Eye size={14} className="inline mr-1" /> View Deck
                  </button>
                </div>
              )}
              
              {state.playerFinished && !state.opponentFinished && (
                <div className={styles.finishedBox}>
                  <span className={styles.finishedText}>You finished! Watching opponent...</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {state.phase === 'round_end' && (
          <div className={styles.victoryContainer}>
            <h2 className={`${styles.victoryTitle} ${
              state.roundResult === 'win' ? styles.victoryWin :
              state.roundResult === 'loss' ? styles.victoryLoss :
              styles.victoryTie
            }`}>
              {state.roundResult === 'win' && '🎉 Win! 🎉'}
              {state.roundResult === 'loss' && '😞 Loss 😞'}
              {state.roundResult === 'tie' && '🤝 Tie! 🤝'}
            </h2>
            <p className={styles.victorySubtitle}>Match {state.matchNumber}</p>
            
            {state.roundResult !== 'loss' && (
              <div className={styles.cashEarnedBox}>
                <div className={styles.cashEarnedTitle}>
                  💰 Cash Earned: ${calculateCashEarned().total}
                </div>
                <div className={styles.cashEarnedDetails}>
                  Cards: ${calculateCashEarned().cashFromCards} | {state.roundResult === 'win' ? 'Win' : 'Tie'}: ${calculateCashEarned().winBonus}{calculateCashEarned().coldestCutBonus > 0 ? ` | Coldest Cut: $${calculateCashEarned().coldestCutBonus}` : ''}
                </div>
              </div>
            )}
            
            {state.playerColdestCut && (
              <div className={styles.coldestCutBox}>
                <div className={styles.coldestCutTitle}>❄️ COLDEST CUT! ❄️</div>
                <div className={styles.coldestCutText}>Played every card in your deck! +$5 Bonus</div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${styles.playerAreaActive} text-center`}>
                <h3 className={styles.playerName}>{state.playerName}</h3>
                <div className="my-3">
                  <span className="text-4xl font-display">{state.playerFinalScore}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {state.playerSandwich.map((card, i) => (
                    <CardDisplay key={card.id} card={card} sandwich={state.playerSandwich} position={i} permanentBreadBonus={state.permanentBreadBonus} />
                  ))}
                </div>
              </div>
              
              <div className={`${styles.opponentAreaActive} text-center`}>
                <h3 className={styles.playerName}>{opponentName}</h3>
                <div className="my-3">
                  <span className="text-4xl font-display">{state.opponentFinalScore}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {state.opponentSandwich.map((card, i) => (
                    <CardDisplay key={card.id} card={card} sandwich={state.opponentSandwich} position={i} permanentBreadBonus={0} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => dispatch({ type: 'CLAIM_REWARD' })} className={styles.buttonPrimary}>
                {state.roundResult === 'loss' ? 'Start Over' : 'Shop'}
              </button>
              <button onClick={() => alert('Share coming soon!')} className={styles.buttonSecondary}>
                📤 Share
              </button>
            </div>
          </div>
        )}
        
        {state.phase === 'shop' && (
          <div className={styles.victoryContainer}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`${styles.victoryTitle} text-2xl`}>🛒 Shop</h2>
              <div className="flex gap-3 items-center">
                <span className={`${styles.statBadge} text-xl`}>💰 ${state.cash}</span>
                <button onClick={() => setShowRemoveCard(true)} disabled={state.cash < 30} className={styles.buttonSmall}>
                  Remove ($30)
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {shopCards.map(card => {
                const ownedCount = state.playerCollection.filter(c => c.name === card.name).length;
                const canAfford = state.cash >= card.cost;
                return (
                  <div key={card.name} className={canAfford ? styles.shopCard : styles.shopCardDisabled}>
                    {ownedCount > 0 && <div className={styles.shopBadge}>{ownedCount}</div>}
                    <div className={styles.shopCardTitle}>{card.name}</div>
                    <div className={styles.shopCardStats}>
                      {card.category && <div className={styles.shopCardCategory}>{card.category}</div>}
                      <div>🍽️ {card.flavor} | 🤢 {card.yuck}</div>
                      <div>💵 {card.cash}</div>
                    </div>
                    {card.ability && <div className={styles.shopCardAbility}>{card.ability}</div>}
                    <button
                      onClick={() => dispatch({ type: 'BUY_CARD', cardName: card.name, cardData: card })}
                      disabled={!canAfford}
                      className={`${canAfford ? styles.buttonPrimary : styles.buttonSmall} w-full text-sm py-2 mt-2`}
                    >
                      {canAfford ? `$${card.cost}` : `Need $${card.cost - state.cash}`}
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => dispatch({ type: 'NEXT_MATCH' })} className={`${styles.buttonPrimary} w-full`}>
              Next Match
            </button>
          </div>
        )}
        
        {showDeck && (
          <div className={styles.modalOverlay} onClick={() => setShowDeck(false)}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Your Deck</h3>
                <button onClick={() => setShowDeck(false)} className={styles.modalClose}><X size={20} /></button>
              </div>
              <div className={styles.modalContent}>
                <div className={styles.deckSection}>
                  <h4 className={styles.deckSectionTitle}>Remaining Cards ({state.playerDeck.length})</h4>
                  <div className={styles.deckGrid}>
                    {[...state.playerDeck].sort((a, b) => a.name.localeCompare(b.name)).map((card) => {
                      const cardData = CARD_DATABASE[card.name];
                      return (
                        <div key={card.id} className={styles.shopCard}>
                          <div className={styles.shopCardTitle}>{card.name}{card.permanentFlavorBonus > 0 && <span className={styles.cardStar}>★</span>}</div>
                          <div className={styles.shopCardStats}>
                            {cardData.category && <div className={styles.shopCardCategory}>{cardData.category}</div>}
                            <div>🍽️ {cardData.flavor + (card.permanentFlavorBonus || 0)}{card.permanentFlavorBonus > 0 && <span className="text-pickle-green"> (+{card.permanentFlavorBonus})</span>}</div>
                            <div>🤢 {cardData.yuck}</div>
                            <div>💵 {cardData.cash}</div>
                          </div>
                          {cardData.ability && <div className={styles.shopCardAbility}>{cardData.ability}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.deckSection}>
                  <h4 className={styles.deckSectionTitle}>Already Played ({state.playerSandwich.length})</h4>
                  <div className={styles.deckGrid}>
                    {state.playerSandwich.map((card) => {
                      const cardData = CARD_DATABASE[card.name];
                      return (
                        <div key={card.id} className={`${styles.shopCard} ${styles.deckCardPlayed}`}>
                          <div className={styles.shopCardTitle}>{card.name}{card.permanentFlavorBonus > 0 && <span className={styles.cardStar}>★</span>}</div>
                          <div className={styles.shopCardStats}>
                            {cardData.category && <div className={styles.shopCardCategory}>{cardData.category}</div>}
                            <div>🍽️ {cardData.flavor + (card.permanentFlavorBonus || 0)}{card.permanentFlavorBonus > 0 && <span className="text-pickle-green"> (+{card.permanentFlavorBonus})</span>}</div>
                            <div>🤢 {cardData.yuck}</div>
                            <div>💵 {cardData.cash}</div>
                          </div>
                          {cardData.ability && <div className={styles.shopCardAbility}>{cardData.ability}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showOpponentDeck && (
          <div className={styles.modalOverlay} onClick={() => setShowOpponentDeck(false)}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Opponent Deck</h3>
                <button onClick={() => setShowOpponentDeck(false)} className={styles.modalClose}><X size={20} /></button>
              </div>
              <div className={styles.modalContent}>
                <div className={styles.deckSection}>
                  <h4 className={styles.deckSectionTitle}>Remaining Cards ({state.opponentDeck.length})</h4>
                  <div className={styles.deckGrid}>
                    {[...state.opponentDeck].sort((a, b) => a.name.localeCompare(b.name)).map((card) => {
                      const cardData = CARD_DATABASE[card.name];
                      return (
                        <div key={card.id} className={styles.shopCard}>
                          <div className={styles.shopCardTitle}>{card.name}</div>
                          <div className={styles.shopCardStats}>
                            {cardData.category && <div className={styles.shopCardCategory}>{cardData.category}</div>}
                            <div>🍽️ {cardData.flavor}</div>
                            <div>🤢 {cardData.yuck}</div>
                            <div>💵 {cardData.cash}</div>
                          </div>
                          {cardData.ability && <div className={styles.shopCardAbility}>{cardData.ability}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.deckSection}>
                  <h4 className={styles.deckSectionTitle}>Already Played ({state.opponentSandwich.length})</h4>
                  <div className={styles.deckGrid}>
                    {state.opponentSandwich.map((card) => {
                      const cardData = CARD_DATABASE[card.name];
                      return (
                        <div key={card.id} className={`${styles.shopCard} ${styles.deckCardPlayed}`}>
                          <div className={styles.shopCardTitle}>{card.name}</div>
                          <div className={styles.shopCardStats}>
                            {cardData.category && <div className={styles.shopCardCategory}>{cardData.category}</div>}
                            <div>🍽️ {cardData.flavor}</div>
                            <div>🤢 {cardData.yuck}</div>
                            <div>💵 {cardData.cash}</div>
                          </div>
                          {cardData.ability && <div className={styles.shopCardAbility}>{cardData.ability}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showRemoveCard && (
          <div className={styles.modalOverlay} onClick={() => setShowRemoveCard(false)}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Remove Card ($30)</h3>
                <button onClick={() => setShowRemoveCard(false)} className={styles.modalClose}><X size={20} /></button>
              </div>
              <div className={styles.modalContent}>
                <p className="text-sm text-chalkboard mb-4">Click a card to remove it. Cannot remove Bread.</p>
                <div className={styles.deckGrid}>
                  {state.playerCollection.map(card => {
                    const cardData = CARD_DATABASE[card.name];
                    const canRemove = card.name !== 'Bread';
                    return (
                      <button
                        key={card.id}
                        onClick={() => {
                          if (canRemove) {
                            dispatch({ type: 'REMOVE_CARD', cardName: card.name });
                            setShowRemoveCard(false);
                          }
                        }}
                        disabled={!canRemove}
                        className={canRemove ? `${styles.shopCard} hover:border-ketchup-red cursor-pointer` : styles.shopCardDisabled}
                      >
                        <div className={styles.shopCardTitle}>{card.name}{card.permanentFlavorBonus > 0 && <span className={styles.cardStar}>★</span>}</div>
                        <div className={styles.shopCardStats}>
                          {cardData.category && <div className={styles.shopCardCategory}>{cardData.category}</div>}
                          <div>🍽️ {cardData.flavor + (card.permanentFlavorBonus || 0)}{card.permanentFlavorBonus > 0 && <span className="text-pickle-green"> (+{card.permanentFlavorBonus})</span>} | 🤢 {cardData.yuck}</div>
                          <div>💵 {cardData.cash}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {state.showManualSave && (
          <div className={styles.modalOverlay} onClick={() => dispatch({ type: 'CLOSE_MANUAL_SAVE' })}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
              <div className="bg-ketchup-red text-milk-carton p-4 rounded-t-cafeteria">
                <h3 className="font-display text-xl">⚠️ Auto-Save Failed</h3>
                <p className="text-sm mt-1">Copy this data and paste it into Supabase</p>
              </div>
              <div className={styles.modalContent}>
                <p className="text-sm text-chalkboard mb-3">
                  <strong>Instructions:</strong><br/>
                  1. Copy JSON below<br/>
                  2. Go to Supabase → winning_decks → Insert row<br/>
                  3. Paste fields
                </p>
                <div className="bg-linoleum p-3 rounded-cafeteria mb-3 max-h-64 overflow-y-auto">
                  <div className="text-xs text-chalkboard">
                    <div><strong>username:</strong> {state.manualSaveData?.username}</div>
					<div><strong>match_number:</strong> {state.manualSaveData?.match_number}</div>
                    <div><strong>final_score:</strong> {state.manualSaveData?.final_score}</div>
                    <div><strong>permanent_bread_bonus:</strong> {state.manualSaveData?.permanent_bread_bonus}</div>
                    <div className="mt-2"><strong>deck_composition:</strong></div>
                    <pre className="text-xs bg-milk-carton p-2 rounded-cafeteria mt-1 overflow-x-auto border-2 border-chalkboard">{JSON.stringify(state.manualSaveData?.deck_composition, null, 2)}</pre>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(state.manualSaveJson || '');
                      alert('Copied to clipboard!');
                    }}
                    className={styles.buttonPrimary}
                  >
                    📋 Copy JSON
                  </button>
                  <button onClick={() => dispatch({ type: 'CLOSE_MANUAL_SAVE' })} className={styles.buttonSmall}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}