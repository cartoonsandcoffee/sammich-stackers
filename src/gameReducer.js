// Game state reducer - all state transitions
import { createCard, createStarterDeck, getOpponentName } from './cardData';
import { shuffle, calculateScores, playOpponentCard } from './gameLogic';

export const gameReducer = (state, action) => {
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
    
    case 'CHANGE_USERNAME': {
      localStorage.setItem('sammich_username', action.username);
      return {
        ...state,
        username: action.username,
        playerName: `You (${action.username})`,
        message: 'Username updated!'
      };
    }
    
    case 'ABANDON_RUN': {
      // Clear all localStorage
      localStorage.removeItem('sammich_deck');
      localStorage.removeItem('sammich_cash');
      localStorage.removeItem('sammich_wins');
      localStorage.removeItem('sammich_losses');
      localStorage.removeItem('sammich_match');
      localStorage.removeItem('sammich_bread_bonus');
      
      // Reset to initial state but keep username
      return {
        ...state,
        playerCollection: createStarterDeck(),
        cash: 0,
        wins: 0,
        losses: 0,
        matchNumber: 1,
        permanentBreadBonus: 0,
        phase: 'matchmaking',
        message: 'Starting fresh run...'
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
      const newDeck = state.playerDeck.slice(1);
      const newSandwich = [...state.playerSandwich, newCard];
      
      // Check for Tomato preview
      let nextPreview = null;
      if (newCard.name === 'Tomato' && newDeck.length > 0) {
        nextPreview = newDeck[0].name;
      }
      
      // Check for Spiced Ham buff
      const prevCard = state.playerSandwich[state.playerSandwich.length - 1];
      if (prevCard && prevCard.name === 'Spiced Ham' && newCard.permanentFlavorBonus < 9) {
        newCard.permanentFlavorBonus = (newCard.permanentFlavorBonus || 0) + 1;
      }
      
      // Check for Peanut Butter + Jelly buff
      if (newCard.name === 'Jelly' && prevCard && prevCard.name === 'Peanut Butter') {
        prevCard.permanentFlavorBonus = (prevCard.permanentFlavorBonus || 0) + 1;
      }
      if (newCard.name === 'Peanut Butter' && prevCard && prevCard.name === 'Jelly') {
        newCard.permanentFlavorBonus = (newCard.permanentFlavorBonus || 0) + 1;
      }
      
      const scores = calculateScores(newSandwich, state.permanentBreadBonus);
      
      if (scores.yuck >= 3) {
        return {
          ...state,
          playerDeck: newDeck,
          playerSandwich: newSandwich,
          playerFinished: true,
          playerFinalScore: 0,
          nextCardPreview: null,
          currentTurn: state.opponentFinished ? 'done' : 'opponent',
          message: "You busted! Too much yuck!"
        };
      }
      
      // Check for Sticky Onions auto-draw
      if (newCard.name === 'Sticky Onions' && newDeck.length > 0) {
        const forcedCard = newDeck[0];
        const forcedDeck = newDeck.slice(1);
        const forcedSandwich = [...newSandwich, forcedCard];
        
        if (forcedCard.name === 'Spiced Ham' && forcedSandwich.length > 0) {
          const lastCard = forcedSandwich[forcedSandwich.length - 2];
          if (lastCard && lastCard.permanentFlavorBonus < 9) {
            lastCard.permanentFlavorBonus = (lastCard.permanentFlavorBonus || 0) + 1;
          }
        }
        
        const forcedScores = calculateScores(forcedSandwich, state.permanentBreadBonus);
        
        if (forcedScores.yuck >= 3) {
          return {
            ...state,
            playerDeck: forcedDeck,
            playerSandwich: forcedSandwich,
            playerFinished: true,
            playerFinalScore: 0,
            nextCardPreview: null,
            currentTurn: state.opponentFinished ? 'done' : 'opponent',
            message: "Sticky Onions made you bust!"
          };
        }
        
        return {
          ...state,
          playerDeck: forcedDeck,
          playerSandwich: forcedSandwich,
          nextCardPreview: null,
          currentTurn: state.opponentFinished ? 'player' : 'opponent',
          message: "Sticky Onions forced another card!"
        };
      }
      
      return {
        ...state,
        playerDeck: newDeck,
        playerSandwich: newSandwich,
        nextCardPreview: nextPreview,
        currentTurn: state.opponentFinished ? 'player' : 'opponent',
        message: "Opponent's turn..."
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
        const finalScores = calculateScores(state.opponentSandwich, 0);
        return {
          ...state,
          opponentFinished: true,
          opponentFinalScore: finalScores.flavor,
          currentTurn: 'done',
          message: "Opponent finished!"
        };
      }
      
      const newCard = decision.card;
      const newDeck = state.opponentDeck.slice(1);
      const newSandwich = [...state.opponentSandwich, newCard];
      
      const scores = calculateScores(newSandwich, 0);
      
      if (scores.yuck >= 3) {
        return {
          ...state,
          opponentDeck: newDeck,
          opponentSandwich: newSandwich,
          opponentFinished: true,
          opponentFinalScore: 0,
          currentTurn: state.playerFinished ? 'done' : 'player',
          message: "Opponent busted!"
        };
      }
      
      if (newCard.name === 'Sticky Onions' && newDeck.length > 0) {
        const forcedCard = newDeck[0];
        const forcedDeck = newDeck.slice(1);
        const forcedSandwich = [...newSandwich, forcedCard];
        const forcedScores = calculateScores(forcedSandwich, 0);
        
        if (forcedScores.yuck >= 3) {
          return {
            ...state,
            opponentDeck: forcedDeck,
            opponentSandwich: forcedSandwich,
            opponentFinished: true,
            opponentFinalScore: 0,
            currentTurn: state.playerFinished ? 'done' : 'player',
            message: "Opponent busted from Sticky Onions!"
          };
        }
        
        return {
          ...state,
          opponentDeck: forcedDeck,
          opponentSandwich: forcedSandwich,
          currentTurn: state.playerFinished ? 'opponent' : 'player',
          message: "Your turn!"
        };
      }
      
      return {
        ...state,
        opponentDeck: newDeck,
        opponentSandwich: newSandwich,
        currentTurn: state.playerFinished ? 'opponent' : 'player',
        message: "Your turn!"
      };
    }
    
    case 'PLAY_BREAD': {
      const finalSandwich = [...state.playerSandwich, state.playerBreadCard];
      const finalScores = calculateScores(finalSandwich, state.permanentBreadBonus);
      
      const playerColdestCut = state.playerDeck.length === 0;
      
      let newPermanentBreadBonus = state.permanentBreadBonus;
      if (finalSandwich.some(c => c.name === 'Salty Sardines')) {
        newPermanentBreadBonus++;
        localStorage.setItem('sammich_bread_bonus', newPermanentBreadBonus.toString());
      }
      
      return {
        ...state,
        playerSandwich: finalSandwich,
        playerBreadCard: null,
        playerFinished: true,
        playerFinalScore: finalScores.flavor,
        playerColdestCut,
        permanentBreadBonus: newPermanentBreadBonus,
        nextCardPreview: null,
        currentTurn: state.opponentFinished ? 'done' : 'opponent',
        message: state.opponentFinished ? "Round complete!" : "Opponent's turn..."
      };
    }
    
    case 'END_ROUND': {
      const playerScore = state.playerFinalScore;
      const opponentScore = state.opponentFinalScore;
      
      let result;
      if (playerScore > opponentScore) {
        result = 'win';
      } else if (playerScore < opponentScore) {
        result = 'loss';
      } else {
        result = 'tie';
      }
      
      if (result === 'loss') {
        localStorage.removeItem('sammich_deck');
        localStorage.removeItem('sammich_cash');
        localStorage.removeItem('sammich_wins');
        localStorage.removeItem('sammich_losses');
        localStorage.removeItem('sammich_match');
        localStorage.removeItem('sammich_bread_bonus');
        
        return {
          ...state,
          phase: 'round_end',
          roundResult: result,
          playerCollection: createStarterDeck(),
          cash: 0,
          wins: 0,
          losses: state.losses + 1,
          matchNumber: 1,
          permanentBreadBonus: 0,
          message: "Game over! Starting fresh."
        };
      }
      
      const newWins = result === 'win' ? state.wins + 1 : state.wins;
      localStorage.setItem('sammich_wins', newWins.toString());
      if (result === 'tie') {
        const newLosses = state.losses + 1;
        localStorage.setItem('sammich_losses', newLosses.toString());
      }
      
      return {
        ...state,
        phase: 'round_end',
        roundResult: result,
        wins: newWins,
        losses: result === 'tie' ? state.losses + 1 : state.losses,
        message: result === 'win' ? 'Victory!' : result === 'tie' ? 'Tie game!' : 'Defeat!'
      };
    }
    
    case 'CLAIM_REWARD': {
      const playerScores = calculateScores(state.playerSandwich, state.permanentBreadBonus);
      const cashFromCards = playerScores.cash;
      const winBonus = state.roundResult === 'win' ? 5 : 3;
      const coldestCutBonus = state.playerColdestCut ? 5 : 0;
      const totalCash = state.cash + cashFromCards + winBonus + coldestCutBonus;
      
      localStorage.setItem('sammich_cash', totalCash.toString());
      
      return {
        ...state,
        phase: 'shop',
        cash: totalCash,
        message: "Shop time!"
      };
    }
    
    case 'BUY_CARD': {
      const cardData = action.cardData;
      if (state.cash < cardData.cost) {
        return { ...state, message: "Not enough cash!" };
      }
      
      return {
        ...state,
        playerCollection: [...state.playerCollection, createCard(action.cardName)],
        cash: state.cash - cardData.cost,
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