import React, { useState, useReducer, useEffect } from 'react';
import { Eye, X, Clock, CheckCircle } from 'lucide-react';
import styles from './styles';

// Supabase configuration
const SUPABASE_URL = 'https://tlycunaumisczhvhvmjd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRseWN1bmF1bWlzY3podmh2bWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTE4ODksImV4cCI6MjA3NjM4Nzg4OX0.NUISxj2iDHXv0EpEC6TkYExv6gHualEmVctg1v_zMLk';

// Supabase REST API helpers
const supabaseRequest = async (endpoint, options = {}) => {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Card data
const CARD_DATABASE = {
  'Bread': { name: 'Bread', flavor: 0, yuck: 0, cash: 0, cost: null, ability: 'Always first, and last.' },
  'Cream Cheese': { name: 'Cream Cheese', flavor: 2, yuck: 1, cash: 0, cost: null, category: 'Cheese' },
  'Jelly': { name: 'Jelly', flavor: 1, yuck: 0, cash: 0, cost: 3 },
  'Bananas': { name: 'Bananas', flavor: 0, yuck: 0, cash: 2, cost: 2 },
  'Cold Turkey': { name: 'Cold Turkey', flavor: 2, yuck: 0, cash: 0, cost: 7, category: 'Meat', ability: 'Cancels 1 yuck' },
  'Beefy Balogna': { name: 'Beefy Balogna', flavor: 2, yuck: 0, cash: 1, cost: 9, category: 'Meat', ability: '+1 flavor per other baloney' },
  'Ham': { name: 'Ham', flavor: 2, yuck: 0, cash: 0, cost: 9, category: 'Meat', ability: '+2 flavor per cheese' },
  'Spiced Ham': { name: 'Spiced Ham', flavor: -1, yuck: 0, cash: 0, cost: 11, category: 'Meat', ability: 'Next card +1 flavor (permanent)' },
  'Chicken Liver Patee': { name: 'Chicken Liver Patee', flavor: 3, yuck: 1, cash: 7, cost: 7, category: 'Meat' },
  'American Cheeze': { name: 'American Cheeze', flavor: 4, yuck: 1, cash: 0, cost: 5, category: 'Cheese' },
  'Lettuce': { name: 'Lettuce', flavor: 0, yuck: 0, cash: 4, cost: 5 },
  'Mayonaise': { name: 'Mayonaise', flavor: 1, yuck: 1, cash: 0, cost: 3, ability: '+20 flavor next to bread' },
  'Peanut Butter': { name: 'Peanut Butter', flavor: 1, yuck: 0, cash: 0, cost: 12, ability: '+1 flavor permanently if next to Jelly' },
  'Lean Beef': { name: 'Lean Beef', flavor: 1, yuck: 0, cash: 0, cost: 12, category: 'Meat', ability: 'Flavor doubles per beef' },
  'Tar tar sauce': { name: 'Tar tar sauce', flavor: 0, yuck: 0, cash: 0, cost: 4, ability: 'Cancels 1 yuck, +1 per fish' },
  'Tomato': { name: 'Tomato', flavor: 1, yuck: 0, cash: 2, cost: 6, ability: 'Shows next card' },
  'Sticky Onions': { name: 'Sticky Onions', flavor: 3, yuck: 0, cash: 2, cost: 7, ability: 'Never last (auto-draw)' },
  'Pickles': { name: 'Pickles', flavor: 2, yuck: 0, cash: 0, cost: 10, ability: 'x2 flavor per yuck' },
  'Cheddar Slices': { name: 'Cheddar Slices', flavor: 1, yuck: 0, cash: 1, cost: 4, category: 'Cheese' },
  'Salty Sardines': { name: 'Salty Sardines', flavor: 0, yuck: 1, cash: 0, cost: 8, category: 'Fish', ability: 'Bread +1 flavor permanently' }
};

let cardIdCounter = 0;

const createCard = (cardName, permanentFlavorBonus = 0) => ({
  id: cardIdCounter++,
  name: cardName,
  permanentFlavorBonus
});

const createStarterDeck = () => {
  const names = ['Bread', 'Bread', 'Cream Cheese', 'Cream Cheese', 'Cream Cheese', 'Cream Cheese', 'Jelly', 'Jelly', 'Jelly', 'Jelly', 'Bananas', 'Bananas'];
  return names.map(name => createCard(name));
};

const BOT_NAMES = [
  "Lunchbox Larry", "Sandwich Sally", "Breadly Cooper", "Mayo Mike", "Pickle Pete",
  "Jelly Jeff", "Burger Bob", "Cheese Chad", "Lettuce Lucy", "Tomato Tom",
  "Bacon Barry", "Mustard Mary", "Ketchup Kevin", "Onion Oscar", "Peanut Patty"
];

const getOpponentName = (matchNumber) => {
  if (matchNumber === 11) return "Fat Jared";
  return BOT_NAMES[(matchNumber - 1) % BOT_NAMES.length];
};

const shuffle = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const calculateScores = (sandwich, permanentBreadBonus = 0) => {
  let flavor = 0;
  let yuck = 0;
  let cash = 0;
  let yuckCancelers = 0;
  let breadBonus = permanentBreadBonus;

  sandwich.forEach(card => {
    if (card.name === 'Cold Turkey' || card.name === 'Tar tar sauce') {
      yuckCancelers++;
    }
    if (card.name === 'Salty Sardines') {
      breadBonus++;
    }
  });

  sandwich.forEach((card, index) => {
    const cardData = CARD_DATABASE[card.name];
    let cardFlavor = cardData.flavor + (card.permanentFlavorBonus || 0);
    let cardYuck = cardData.yuck;
    
    if (card.name === 'Bread') {
      cardFlavor += breadBonus;
    }
    
    switch (card.name) {
      case 'Tar tar sauce':
        const fishCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Fish').length;
        cardFlavor += fishCount;
        break;
      case 'Beefy Balogna':
        const otherBaloneys = sandwich.filter((c, i) => c.name === 'Beefy Balogna' && i !== index).length;
        cardFlavor += otherBaloneys;
        break;
      case 'Ham':
        const cheeseCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Cheese').length;
        cardFlavor += cheeseCount * 2;
        break;
      case 'Mayonaise':
        const prevCard = index > 0 ? sandwich[index - 1] : null;
        const nextCard = index < sandwich.length - 1 ? sandwich[index + 1] : null;
        if ((prevCard && prevCard.name === 'Bread') || (nextCard && nextCard.name === 'Bread')) {
          cardFlavor += 20;
        }
        break;
      case 'Lean Beef':
        const leanBeefCount = sandwich.filter((c, i) => c.name === 'Lean Beef' && i <= index).length;
        cardFlavor = cardFlavor * Math.pow(2, leanBeefCount - 1);
        break;
      case 'Jelly':
        const prevCardJelly = index > 0 ? sandwich[index - 1] : null;
        const nextCardJelly = index < sandwich.length - 1 ? sandwich[index + 1] : null;
        if ((prevCardJelly && prevCardJelly.name === 'Peanut Butter') || (nextCardJelly && nextCardJelly.name === 'Peanut Butter')) {
          cardFlavor += 2;
        }
        break;
    }
    
    flavor += cardFlavor;
    yuck += cardYuck;
    cash += cardData.cash;
  });

  yuck = Math.max(0, yuck - yuckCancelers);
  
  sandwich.forEach(card => {
    if (card.name === 'Pickles') {
      const picklesBonus = 2 * yuck * 2;
      flavor += picklesBonus;
    }
  });

  return { flavor, yuck, cash, breadBonus };
};

const playOpponentCard = (deck, sandwich, permanentBreadBonus, targetScore = 0, playerFinished = false) => {
  if (deck.length === 0) {
    return { action: 'finish', card: null };
  }
  
  const currentScores = calculateScores(sandwich, 0);
  
  let shouldStop = false;
  if (playerFinished) {
    if (targetScore === 0) {
      shouldStop = currentScores.flavor > 0;
    } else {
      shouldStop = currentScores.flavor > targetScore || (currentScores.yuck >= 2 && currentScores.flavor >= targetScore - 2);
    }
  } else {
    shouldStop = currentScores.flavor >= 8 || (currentScores.yuck >= 1 && Math.random() > 0.5);
  }
  
  if (shouldStop) {
    return { action: 'finish', card: null };
  }
  
  return { action: 'draw', card: deck[0] };
};

const CardDisplay = ({ card, className = "", sandwich = [], position = -1, permanentBreadBonus = 0 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const cardData = CARD_DATABASE[card.name];
  
  let displayFlavor = cardData.flavor + (card.permanentFlavorBonus || 0);
  let displayYuck = cardData.yuck;
  let flavorExplanation = "";
  
  if (sandwich.length > 0 && position >= 0) {
    let breadBonus = permanentBreadBonus + sandwich.filter(c => c.name === 'Salty Sardines').length;
    
    if (card.permanentFlavorBonus > 0) {
      flavorExplanation = ` (base ${cardData.flavor} + ${card.permanentFlavorBonus} permanent)`;
    }
    
    if (card.name === 'Bread') {
      displayFlavor += breadBonus;
      if (breadBonus > 0) {
        flavorExplanation = flavorExplanation ? 
          flavorExplanation.replace(')', ` + ${breadBonus} Sardines)`) : 
          ` (base ${cardData.flavor} + ${breadBonus} Sardines)`;
      }
    }
    
    if (card.name === 'Tar tar sauce') {
      const fishCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Fish').length;
      if (fishCount > 0) {
        displayFlavor += fishCount;
        flavorExplanation = flavorExplanation ? 
          flavorExplanation.replace(')', ` + ${fishCount} Fish)`) : 
          ` (base ${cardData.flavor} + ${fishCount} Fish)`;
      }
    }
    
    if (card.name === 'Beefy Balogna') {
      const otherBaloneys = sandwich.filter((c, i) => c.name === 'Beefy Balogna' && i !== position).length;
      if (otherBaloneys > 0) {
        displayFlavor += otherBaloneys;
        flavorExplanation = flavorExplanation ? 
          flavorExplanation.replace(')', ` + ${otherBaloneys} Baloneys)`) : 
          ` (base ${cardData.flavor} + ${otherBaloneys} Baloneys)`;
      }
    }
    
    if (card.name === 'Ham') {
      const cheeseCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Cheese').length;
      const bonus = cheeseCount * 2;
      if (bonus > 0) {
        displayFlavor += bonus;
        flavorExplanation = flavorExplanation ? 
          flavorExplanation.replace(')', ` + ${bonus} Cheese)`) : 
          ` (base ${cardData.flavor} + ${bonus} Cheese)`;
      }
    }
    
    if (card.name === 'Mayonaise') {
      const prevCard = position > 0 ? sandwich[position - 1] : null;
      const nextCard = position < sandwich.length - 1 ? sandwich[position + 1] : null;
      if ((prevCard && prevCard.name === 'Bread') || (nextCard && nextCard.name === 'Bread')) {
        displayFlavor += 20;
        flavorExplanation = ` (base ${cardData.flavor} + 20 Bread)`;
      }
    }
    
    if (card.name === 'Lean Beef') {
      const leanBeefCount = sandwich.filter((c, i) => c.name === 'Lean Beef' && i <= position).length;
      const multiplier = Math.pow(2, leanBeefCount - 1);
      displayFlavor = displayFlavor * multiplier;
      if (leanBeefCount > 1) {
        flavorExplanation = ` (${cardData.flavor} × 2^${leanBeefCount - 1})`;
      }
    }
    
    if (card.name === 'Pickles') {
      const scores = calculateScores(sandwich, permanentBreadBonus);
      const finalYuck = scores.yuck;
      const picklesBonus = 2 * finalYuck * 2;
      if (picklesBonus > 0) {
        displayFlavor += picklesBonus;
        flavorExplanation = ` (base ${cardData.flavor} + ${picklesBonus} from ${finalYuck} Yuck)`;
      }
    }
    
    if (card.name === 'Jelly') {
      const prevCard = position > 0 ? sandwich[position - 1] : null;
      const nextCard = position < sandwich.length - 1 ? sandwich[position + 1] : null;
      if ((prevCard && prevCard.name === 'Peanut Butter') || (nextCard && nextCard.name === 'Peanut Butter')) {
        displayFlavor += 2;
        flavorExplanation = flavorExplanation ?
          flavorExplanation.replace(')', ` + 2 from Peanut Butter)`) :
          ` (base ${cardData.flavor} + 2 from Peanut Butter)`;
      }
    }
  }
  
  return (
    <div 
      className={styles.card}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardName}>
          {card.name}{card.permanentFlavorBonus > 0 && <span className={styles.cardStar}>★</span>}
        </div>
      </div>
      {showTooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipTitle}>{card.name}</div>
          {cardData.category && <div className={styles.tooltipCategory}>Category: {cardData.category}</div>}
          <div>🍽️ Flavor: {displayFlavor}{flavorExplanation}</div>
          <div>🤢 Yuck: {displayYuck}</div>
          <div>💵 Cash: {cardData.cash}</div>
          {cardData.ability && <div className={styles.tooltipAbility}>{cardData.ability}</div>}
        </div>
      )}
    </div>
  );
};

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

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USERNAME': {
      localStorage.setItem('sammich_username', action.username);
      return {
        ...state,
        username: action.username,
        playerName: `You (${action.username})`,
        phase: 'matchmaking',
        message: 'Finding opponent...'
      };
    }
    
    case 'LOAD_DECK': {
      return {
        ...state,
        playerCollection: action.deck
      };
    }
    
    case 'SHOW_MANUAL_SAVE': {
      return {
        ...state,
        showManualSave: true,
        manualSaveData: action.deckData,
        manualSaveJson: action.jsonString
      };
    }
    
    case 'CLOSE_MANUAL_SAVE': {
      return {
        ...state,
        showManualSave: false,
        manualSaveData: null,
        manualSaveJson: null
      };
    }
    
    case 'INIT_ROUND': {
      const playerCardsNoBread = action.playerCards.filter(c => c.name !== 'Bread');
      const breadCards = action.playerCards.filter(c => c.name === 'Bread');
      
      const opponentCards = action.opponentDeck || [];
      const opponentCardsNoBread = opponentCards.filter(c => c.name !== 'Bread');
      const opponentBreadCards = opponentCards.filter(c => c.name === 'Bread');
      
      return {
        ...state,
        phase: 'playing',
        playerDeck: shuffle(playerCardsNoBread),
        playerSandwich: [breadCards[0]],
        playerBreadCard: breadCards[1],
        playerFinished: false,
        playerFinalScore: null,
        nextCardPreview: null,
        opponentName: action.opponentName || getOpponentName(state.matchNumber),
        opponentDeckId: action.opponentDeckId || null,
        opponentDeck: shuffle(opponentCardsNoBread),
        opponentSandwich: [opponentBreadCards[0]],
        opponentBreadCard: opponentBreadCards[1],
        opponentFinished: false,
        opponentFinalScore: null,
        currentTurn: 'player',
        roundResult: null,
        loading: false,
        message: "Your turn! Build your sandwich."
      };
    }
    
    case 'FLIP_CARD': {
      if (state.playerDeck.length === 0) {
        return { ...state, message: "No cards left!" };
      }
      
      const newCard = state.playerDeck[0];
      
      let cardToAdd = { ...newCard };
      const lastCard = state.playerSandwich[state.playerSandwich.length - 1];
      
      if (lastCard && lastCard.name === 'Spiced Ham') {
        cardToAdd = { ...cardToAdd, permanentFlavorBonus: (cardToAdd.permanentFlavorBonus || 0) + 1 };
        const collectionIndex = state.playerCollection.findIndex(c => c.id === cardToAdd.id);
        if (collectionIndex !== -1) {
          const newCollection = [...state.playerCollection];
          newCollection[collectionIndex] = cardToAdd;
          state = { ...state, playerCollection: newCollection };
        }
      }
      
      if (cardToAdd.name === 'Peanut Butter' && lastCard && lastCard.name === 'Jelly') {
        cardToAdd = { ...cardToAdd, permanentFlavorBonus: (cardToAdd.permanentFlavorBonus || 0) + 1 };
        const collectionIndex = state.playerCollection.findIndex(c => c.id === cardToAdd.id);
        if (collectionIndex !== -1) {
          const newCollection = [...state.playerCollection];
          newCollection[collectionIndex] = cardToAdd;
          state = { ...state, playerCollection: newCollection };
        }
      }
      
      if (cardToAdd.name === 'Jelly' && lastCard && lastCard.name === 'Peanut Butter') {
        const pbIndex = state.playerSandwich.length - 1;
        const pbCard = state.playerSandwich[pbIndex];
        const buffedPB = { ...pbCard, permanentFlavorBonus: (pbCard.permanentFlavorBonus || 0) + 1 };
        
        const newSandwich = [...state.playerSandwich];
        newSandwich[pbIndex] = buffedPB;
        
        const collectionIndex = state.playerCollection.findIndex(c => c.id === pbCard.id);
        if (collectionIndex !== -1) {
          const newCollection = [...state.playerCollection];
          newCollection[collectionIndex] = buffedPB;
          state = { ...state, playerCollection: newCollection, playerSandwich: newSandwich };
        }
      }
      
      const newSandwich = [...state.playerSandwich, cardToAdd];
      const scores = calculateScores(newSandwich, state.permanentBreadBonus);
      
      if (scores.yuck >= 3) {
        return {
          ...state,
          playerSandwich: newSandwich,
          playerFinished: true,
          playerFinalScore: 0,
          playerDeck: state.playerDeck.slice(1),
          nextCardPreview: null,
          currentTurn: state.opponentFinished ? 'done' : 'opponent',
          message: `Busted! Yuck: ${scores.yuck}. ${state.opponentFinished ? 'Match over!' : 'Waiting for opponent...'}`
        };
      }
      
      let preview = null;
      if (newCard.name === 'Tomato' && state.playerDeck.length > 1) {
        preview = state.playerDeck[1];
      }
      
      let updatedDeck = state.playerDeck.slice(1);
      let updatedSandwich = newSandwich;
      let autoDrawMessage = "";
      
      if (newCard.name === 'Sticky Onions' && updatedDeck.length > 0) {
        let autoDrawCard = updatedDeck[0];
        
        if (cardToAdd.name === 'Spiced Ham') {
          autoDrawCard = { ...autoDrawCard, permanentFlavorBonus: (autoDrawCard.permanentFlavorBonus || 0) + 1 };
          const collectionIndex = state.playerCollection.findIndex(c => c.id === autoDrawCard.id);
          if (collectionIndex !== -1) {
            const newCollection = [...state.playerCollection];
            newCollection[collectionIndex] = autoDrawCard;
            state = { ...state, playerCollection: newCollection };
          }
        }
        
        updatedSandwich = [...updatedSandwich, autoDrawCard];
        updatedDeck = updatedDeck.slice(1);
        autoDrawMessage = ` Sticky Onions drew ${autoDrawCard.name}!`;
        
        const newScores = calculateScores(updatedSandwich, state.permanentBreadBonus);
        if (newScores.yuck >= 3) {
          return {
            ...state,
            playerSandwich: updatedSandwich,
            playerFinished: true,
            playerFinalScore: 0,
            playerDeck: updatedDeck,
            nextCardPreview: null,
            currentTurn: state.opponentFinished ? 'done' : 'opponent',
            message: `Sticky Onions busted you! ${state.opponentFinished ? 'Match over!' : 'Waiting for opponent...'}`
          };
        }
      }
      
      return {
        ...state,
        playerDeck: updatedDeck,
        playerSandwich: updatedSandwich,
        nextCardPreview: preview,
        currentTurn: state.opponentFinished ? 'player' : 'opponent',
        message: state.opponentFinished ? `Your turn!${autoDrawMessage}` : `Opponent's turn...${autoDrawMessage}`
      };
    }
    
    case 'OPPONENT_TURN': {
      if (state.opponentFinished) {
        return { ...state, currentTurn: 'player' };
      }
      
      const decision = playOpponentCard(
        state.opponentDeck, 
        state.opponentSandwich, 
        0, 
        state.playerFinalScore || 0,
        state.playerFinished
      );
      
      if (decision.action === 'finish') {
        const finalSandwich = [...state.opponentSandwich, state.opponentBreadCard];
        const scores = calculateScores(finalSandwich, 0);
        
        if (state.playerFinished) {
          const playerScore = state.playerFinalScore;
          const opponentScore = scores.flavor;
          
          let result = 'loss';
          let msg = `Match Over! You: ${playerScore} | ${state.opponentName}: ${opponentScore}. `;
          
          if (playerScore > opponentScore) {
            result = 'win';
            msg += "You win!";
          } else if (playerScore === opponentScore) {
            result = 'tie';
            msg += "Tie!";
          } else {
            msg += "You lose!";
          }
          
          return {
            ...state,
            opponentSandwich: finalSandwich,
            opponentFinalScore: scores.flavor,
            opponentFinished: true,
            phase: 'round_end',
            roundResult: result,
            currentTurn: 'done',
            message: msg
          };
        }
        
        return {
          ...state,
          opponentSandwich: finalSandwich,
          opponentFinalScore: scores.flavor,
          opponentFinished: true,
          currentTurn: 'player',
          message: `${state.opponentName} finished with ${scores.flavor} flavor! Your turn
};
      }
      
      const newCard = decision.card;
      const newSandwich = [...state.opponentSandwich, newCard];
      const scores = calculateScores(newSandwich, 0);
      
      if (scores.yuck >= 3) {
        if (state.playerFinished) {
          return {
            ...state,
            opponentSandwich: newSandwich,
            opponentDeck: state.opponentDeck.slice(1),
            opponentFinished: true,
            opponentFinalScore: 0,
            phase: 'round_end',
            roundResult: state.playerFinalScore > 0 ? 'win' : 'tie',
            currentTurn: 'done',
            message: `${state.opponentName} busted! You win!`
          };
        }
        
        return {
          ...state,
          opponentSandwich: newSandwich,
          opponentDeck: state.opponentDeck.slice(1),
          opponentFinished: true,
          opponentFinalScore: 0,
          currentTurn: 'player',
          message: `${state.opponentName} busted! Your turn.`
        };
      }
      
      return {
        ...state,
        opponentDeck: state.opponentDeck.slice(1),
        opponentSandwich: newSandwich,
        currentTurn: state.playerFinished ? 'opponent' : 'player',
        message: `${state.opponentName} played ${newCard.name}. ${state.playerFinished ? "Opponent continues..." : 'Your turn!'}`
      };
    }
    
    case 'PLAY_BREAD': {
      const finalSandwich = [...state.playerSandwich, state.playerBreadCard];
      const scores = calculateScores(finalSandwich, state.permanentBreadBonus);
      const coldestCut = state.playerDeck.length === 0;
      
      const newState = {
        ...state,
        playerSandwich: finalSandwich,
        playerFinalScore: scores.flavor,
        playerFinished: true,
        playerColdestCut: coldestCut,
        nextCardPreview: null,
        currentTurn: state.opponentFinished ? 'done' : 'opponent',
        message: `You finished: ${scores.flavor} flavor!${coldestCut ? ' COLDEST CUT!' : ''} ${state.opponentFinished ? 'Match over!' : "Opponent's turn..."}`
      };
      
      if (newState.opponentFinished) {
        const playerScore = scores.flavor;
        const opponentScore = newState.opponentFinalScore;
        
        let result = 'loss';
        let msg = `Match Over! You: ${playerScore} | ${state.opponentName}: ${opponentScore}. `;
        
        if (playerScore > opponentScore) {
          result = 'win';
          msg += "You win!";
        } else if (playerScore === opponentScore) {
          result = 'tie';
          msg += "Tie!";
        } else {
          msg += "You lose!";
        }
        
        return { ...newState, phase: 'round_end', roundResult: result, message: msg };
      }
      
      return newState;
    }
    
    case 'CLAIM_REWARD': {
      if (state.roundResult === 'loss') {
        localStorage.setItem('sammich_cash', '0');
        localStorage.setItem('sammich_wins', '0');
        localStorage.setItem('sammich_match', '1');
        localStorage.setItem('sammich_bread_bonus', '0');
        
        return {
          ...state,
          phase: 'matchmaking',
          playerCollection: createStarterDeck(),
          cash: 0,
          wins: 0,
          matchNumber: 1,
          losses: state.losses + 1,
          permanentBreadBonus: 0,
          message: "Starting over..."
        };
      }
      
      const playerScores = calculateScores(state.playerSandwich, state.permanentBreadBonus);
      const cashFromCards = playerScores.cash;
      const winBonus = state.roundResult === 'win' ? 5 : 3;
      const coldestCutBonus = state.playerColdestCut ? 5 : 0;
      const totalCash = cashFromCards + winBonus + coldestCutBonus;
      
      const newCash = state.cash + totalCash;
      const newWins = state.wins + 1;
      
      localStorage.setItem('sammich_cash', newCash.toString());
      localStorage.setItem('sammich_wins', newWins.toString());
      localStorage.setItem('sammich_bread_bonus', playerScores.breadBonus.toString());
      
      return {
        ...state,
        phase: 'shop',
        cash: newCash,
        wins: newWins,
        permanentBreadBonus: playerScores.breadBonus,
        message: `Earned $${totalCash}!`
      };
    }
    
    case 'BUY_CARD': {
      const card = CARD_DATABASE[action.cardName];
      if (state.cash < card.cost) {
        return { ...state, message: "Not enough cash!" };
      }
      
      return {
        ...state,
        playerCollection: [...state.playerCollection, createCard(action.cardName)],
        cash: state.cash - card.cost,
        message: `Bought ${action.cardName}!`
      };
    }
    
    case 'REMOVE_CARD': {
      if (state.cash < 30) return { ...state, message: "Need $30!" };
      if (action.cardName === 'Bread') return { ...state, message: "Can't remove Bread!" };
      
      const cardIndex = state.playerCollection.findIndex(c => c.name === action.cardName);
      if (cardIndex === -1) return { ...state, message: "Not found!" };
      
      const newCollection = [...state.playerCollection];
      newCollection.splice(cardIndex, 1);
      
      return {
        ...state,
        playerCollection: newCollection,
        cash: state.cash - 30,
        message: `Removed ${action.cardName}!`
      };
    }
    
    case 'NEXT_MATCH': {
      const newMatchNumber = state.matchNumber + 1;
      localStorage.setItem('sammich_match', newMatchNumber.toString());
      
      return { 
        ...state, 
        phase: 'matchmaking',
        matchNumber: newMatchNumber,
        message: "Finding opponent..." 
      };
    }
    
    default:
      return state;
  }
};

export default function SammichStackers() {
  const [state, dispatch] = useReducer(gameReducer, null, getInitialState);
  const [showDeck, setShowDeck] = useState(false);
  const [showOpponentDeck, setShowOpponentDeck] = useState(false);
  const [showRemoveCard, setShowRemoveCard] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  
  useEffect(() => {
    const savedDeck = localStorage.getItem('sammich_deck');
    const savedUsername = localStorage.getItem('sammich_username');
    
    if (savedDeck) {
      try {
        const parsed = JSON.parse(savedDeck);
        const reconstructed = parsed.map(card => createCard(card.name, card.permanentFlavorBonus));
        dispatch({ type: 'LOAD_DECK', deck: reconstructed });
      } catch (e) {
        console.error('Failed to load deck:', e);
      }
    }
    
    if (savedUsername) {
      dispatch({ type: 'SET_USERNAME', username: savedUsername });
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
  
  const fetchOpponentDeck = async (matchNumber) => {
    console.log('Fetching opponent deck for match:', matchNumber);
    
    try {
      const data = await supabaseRequest(
        `winning_decks?match_number=eq.${matchNumber}&order=won_at.desc&limit=100`
      );
      
      console.log('Supabase returned:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        const randomDeck = data[Math.floor(Math.random() * data.length)];
        console.log('Using real player deck from:', randomDeck.username);
        
        let deckComposition = randomDeck.deck_composition;
        
        if (typeof deckComposition === 'string') {
          try {
            const parsed = JSON.parse(deckComposition);
            deckComposition = parsed.deck_composition || parsed;
          } catch (e) {
            console.error('Failed to parse deck_composition string:', e);
            throw new Error('Invalid deck format');
          }
        }
        
        if (!Array.isArray(deckComposition)) {
          console.error('deck_composition is not an array:', deckComposition);
          throw new Error('Invalid deck format');
        }
        
        const deckCards = deckComposition.map(card => 
          createCard(card.name, card.permanentFlavorBonus || 0)
        );
        
        return {
          deck: deckCards,
          opponentName: randomDeck.username,
          deckId: randomDeck.id
        };
      } else {
        console.log('No decks found in database, using bot');
      }
    } catch (error) {
      console.error('Error fetching opponent deck:', error);
    }
    
    console.log('Generating bot deck for match:', matchNumber);
    let opponentDeckNames = ['Bread', 'Bread', 'Cream Cheese', 'Cream Cheese', 'Cream Cheese', 'Cream Cheese', 'Jelly', 'Jelly', 'Jelly', 'Jelly', 'Bananas', 'Bananas'];
    if (matchNumber >= 2) opponentDeckNames.push('Jelly', 'Cold Turkey');
    if (matchNumber >= 3) opponentDeckNames.push('Bananas', 'American Cheeze');
    if (matchNumber >= 4) opponentDeckNames.push('Cheddar Slices', 'Ham');
    if (matchNumber >= 6) opponentDeckNames.push('Pickles', 'Lean Beef');
    
    return {
      deck: opponentDeckNames.map(name => createCard(name)),
      opponentName: getOpponentName(matchNumber),
      deckId: null
    };
  };
  
  const saveWinningDeck = async () => {
    if (!state.username || state.roundResult !== 'win') {
      console.log('Not saving - username:', state.username, 'result:', state.roundResult);
      return;
    }
    
    const deckComposition = state.playerCollection.map(card => ({
      name: card.name,
      permanentFlavorBonus: card.permanentFlavorBonus || 0
    }));
    
    const deckData = {
      username: state.username,
      match_number: state.matchNumber,
      deck_composition: deckComposition,
      final_score: state.playerFinalScore,
      permanent_bread_bonus: state.permanentBreadBonus
    };
    
    console.log('Deck to save:', deckData);
    
    try {
      const result = await supabaseRequest('winning_decks', {
        method: 'POST',
        body: JSON.stringify(deckData)
      });
      
      console.log('Deck saved successfully!', result);
    } catch (error) {
      console.error('Error saving deck:', error);
      
      const jsonString = JSON.stringify(deckData, null, 2);
      
      dispatch({ 
        type: 'SHOW_MANUAL_SAVE', 
        deckData: deckData,
        jsonString: jsonString 
      });
    }
  };
  
  useEffect(() => {
    if (state.phase === 'matchmaking' && state.username) {
      const loadMatch = async () => {
        const opponentData = await fetchOpponentDeck(state.matchNumber);
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
      saveWinningDeck();
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
                        <Eye size={12} className={styles.buttonIcon} /> Deck
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
                    <Eye size={14} className={styles.buttonIcon} /> View Deck
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
                <button
                  onClick={() => setShowRemoveCard(true)}
                  disabled={state.cash < 30}
                  className={styles.buttonSmall}
                >
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
                    {ownedCount > 0 && (
                      <div className={styles.shopBadge}>
                        {ownedCount}
                      </div>
                    )}
                    <div className={styles.shopCardTitle}>{card.name}</div>
                    <div className={styles.shopCardStats}>
                      {card.category && <div className={styles.shopCardCategory}>{card.category}</div>}
                      <div>🍽️ {card.flavor} | 🤢 {card.yuck}</div>
                      <div>💵 {card.cash}</div>
                    </div>
                    {card.ability && <div className={styles.shopCardAbility}>{card.ability}</div>}
                    <button
                      onClick={() => dispatch({ type: 'BUY_CARD', cardName: card.name })}
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
                            <div
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
                <h3 className="font-display text-xl">⚠️ Auto-Save Failed - Manual Save Required</h3>
                <p className="text-sm mt-1">Copy this data and paste it into Supabase</p>
              </div>
              <div className={styles.modalContent}>
                <p className="text-sm text-chalkboard mb-3">
                  <strong>Instructions:</strong><br/>
                  1. Copy the JSON below (click "Copy" button)<br/>
                  2. Go to Supabase → Table Editor → winning_decks<br/>
                  3. Click "Insert" → "Insert row"<br/>
                  4. Paste each field into the corresponding column
                </p>
                
                <div className="bg-linoleum p-3 rounded-cafeteria mb-3 max-h-64 overflow-y-auto">
                  <div className="text-xs mb-2 font-bold text-chalkboard">Deck Data:</div>
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
                  <button
                    onClick={() => dispatch({ type: 'CLOSE_MANUAL_SAVE' })}
                    className={styles.buttonSmall}
                  >
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