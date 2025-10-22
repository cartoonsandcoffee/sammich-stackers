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
    
	case 'START_GAME': {
	  return {
		...state,
		phase: 'username_entry',
		message: 'Enter your name!'
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

	case 'SET_GAME_RECORD': {
	  return {
		...state,
		gameRecord: action.record
	  };
	}

	case 'SET_OPPONENT': {
	  return {
		...state,
		opponentDeck: action.deck,
		opponentName: action.name,
		opponentDeckId: action.deckId,
		isFinalMatch: action.isFinalMatch,
		phase: 'playing'
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
        playerColdestCut: false,
        nextCardPreview: null,
        opponentName: action.opponentName || getOpponentName(state.matchNumber),
        opponentDeckId: action.opponentDeckId || null,
        opponentDeck: shuffle(opponentCardsNoBread),
        opponentSandwich: [opponentBreadCards[0]],
        opponentBreadCard: opponentBreadCards[1],
        opponentFinished: false,
        opponentFinalScore: null,
		isFinalMatch: action.isFinalMatch || false,
		gameRecord: action.gameRecord || state.gameRecord,		
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
      
      // Spiced Ham buff
      if (lastCard && lastCard.name === 'Spiced Ham') {
        cardToAdd = { ...cardToAdd, permanentFlavorBonus: Math.min((cardToAdd.permanentFlavorBonus || 0) + 1, 9) };
        const collectionIndex = state.playerCollection.findIndex(c => c.id === cardToAdd.id);
        if (collectionIndex !== -1) {
          const newCollection = [...state.playerCollection];
          newCollection[collectionIndex] = cardToAdd;
          state = { ...state, playerCollection: newCollection };
        }
      }
      
      // Peanut Butter after Jelly
      if (cardToAdd.name === 'Peanut Butter' && lastCard && lastCard.name === 'Jelly') {
        cardToAdd = { ...cardToAdd, permanentFlavorBonus: (cardToAdd.permanentFlavorBonus || 0) + 1 };
        const collectionIndex = state.playerCollection.findIndex(c => c.id === cardToAdd.id);
        if (collectionIndex !== -1) {
          const newCollection = [...state.playerCollection];
          newCollection[collectionIndex] = cardToAdd;
          state = { ...state, playerCollection: newCollection };
        }
      }
      
      // Jelly after Peanut Butter
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
      
      const newDeck = state.playerDeck.slice(1);
      const newSandwich = [...state.playerSandwich, cardToAdd];
      
      // Check for Tomato preview
      let nextPreview = null;
      if (cardToAdd.name === 'Tomato' && newDeck.length > 0) {
        nextPreview = newDeck[0].name;
      }
      
      const scores = calculateScores(newSandwich, state.permanentBreadBonus);
      
      // Check for bust
      if (scores.yuck >= 3) {
        return {
          ...state,
          playerSandwich: newSandwich,
          playerFinished: true,
          playerFinalScore: 0,
          playerDeck: newDeck,
          nextCardPreview: null,
          currentTurn: state.opponentFinished ? 'done' : 'opponent',
          message: "You busted! Too much yuck!"
        };
      }
      
      // Check for Sticky Onions auto-draw
      if (cardToAdd.name === 'Sticky Onions' && newDeck.length > 0) {
        const forcedCard = newDeck[0];
        const forcedDeck = newDeck.slice(1);
        const forcedSandwich = [...newSandwich, forcedCard];
        
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
        
        let newPreview = null;
        if (forcedCard.name === 'Tomato' && forcedDeck.length > 0) {
          newPreview = forcedDeck[0].name;
        }
        
        return {
          ...state,
          playerDeck: forcedDeck,
          playerSandwich: forcedSandwich,
          nextCardPreview: newPreview,
          currentTurn: state.opponentFinished ? 'player' : 'opponent',
          message: `Sticky Onions forced ${forcedCard.name}!`
        };
      }
      
      return {
        ...state,
        playerDeck: newDeck,
        playerSandwich: newSandwich,
        nextCardPreview: nextPreview,
        currentTurn: state.opponentFinished ? 'player' : 'opponent',
        message: state.opponentFinished ? "Your turn!" : "Opponent's turn..."
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
        const finalScores = calculateScores(finalSandwich, 0);
        
        return {
          ...state,
          opponentSandwich: finalSandwich,
          opponentFinished: true,
          opponentFinalScore: finalScores.flavor,
          currentTurn: state.playerFinished ? 'done' : 'player',
          message: state.playerFinished 
            ? "Both finished! Calculating results..." 
            : `${state.opponentName} finished with ${finalScores.flavor} flavor! Your turn.`
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
          message: `${state.opponentName} busted!`
        };
      }
      
      // Sticky Onions auto-draw for opponent
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
            message: `${state.opponentName} busted from Sticky Onions!`
          };
        }
        
        return {
          ...state,
          opponentDeck: forcedDeck,
          opponentSandwich: forcedSandwich,
          currentTurn: state.playerFinished ? 'opponent' : 'player',
          message: state.playerFinished 
            ? `${state.opponentName} continues...` 
            : "Your turn!"
        };
      }
      
      return {
        ...state,
        opponentDeck: newDeck,
        opponentSandwich: newSandwich,
        currentTurn: state.playerFinished ? 'opponent' : 'player',
        message: state.playerFinished 
          ? `${state.opponentName} continues...` 
          : "Your turn!"
      };
    }
    
    case 'PLAY_BREAD': {
      const finalSandwich = [...state.playerSandwich, state.playerBreadCard];
      const finalScores = calculateScores(finalSandwich, state.permanentBreadBonus);
      
      const playerColdestCut = state.playerDeck.length === 0;
      
      // Update permanent bread bonus if Salty Sardines in sandwich
      let newPermanentBreadBonus = state.permanentBreadBonus;
      const sardineCount = finalSandwich.filter(c => c.name === 'Salty Sardines').length;
      if (sardineCount > 0) {
        newPermanentBreadBonus = state.permanentBreadBonus + sardineCount;
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
        message: state.opponentFinished 
          ? "Both finished! Calculating results..." 
          : `You finished with ${finalScores.flavor} flavor! ${playerColdestCut ? 'COLDEST CUT! ' : ''}Opponent's turn...`
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
      
      // LOSS: Complete reset
      if (result === 'loss') {
        localStorage.removeItem('sammich_deck');
        localStorage.removeItem('sammich_cash');
        localStorage.removeItem('sammich_wins');
        localStorage.removeItem('sammich_match');
        localStorage.removeItem('sammich_bread_bonus');
        const newLosses = state.losses + 1;
        localStorage.setItem('sammich_losses', newLosses.toString());
        
        return {
          ...state,
          phase: 'round_end',
          roundResult: result,
          playerCollection: createStarterDeck(),
          cash: 0,
          wins: 0,
          losses: newLosses,
          matchNumber: 1,
          permanentBreadBonus: 0,
          message: "Game over! Starting fresh."
        };
      }
      
      // WIN or TIE
      const newWins = result === 'win' ? state.wins + 1 : state.wins;
      const newLosses = result === 'tie' ? state.losses + 1 : state.losses;
      
      localStorage.setItem('sammich_wins', newWins.toString());
      if (result === 'tie') {
        localStorage.setItem('sammich_losses', newLosses.toString());
      }
      
      return {
        ...state,
        phase: 'round_end',
        roundResult: result,
        wins: newWins,
        losses: newLosses,
        message: result === 'win' ? 'Victory!' : 'Tie game!'
      };
    }
    
    case 'CLAIM_REWARD': {
      if (state.roundResult === 'loss') {
        // Already reset in END_ROUND, just go to matchmaking
        return {
          ...state,
          phase: 'matchmaking',
          message: "Starting over..."
        };
		
		// JDM: are these 2 lines unnecessary?
		localStorage.clear();
		return getInitialState();		
      }

	  // Check if player beat the final boss
	  if (state.isFinalMatch && state.roundResult === 'win') {
		return {
		  ...state,
		  phase: 'final_victory'
		};
	  }
      
      // WIN or TIE: Calculate cash and go to shop
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