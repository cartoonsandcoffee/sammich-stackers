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
      
      // Spiced Ham buff
      if (lastCard && lastCard.name === 'Spiced Ham') {
        cardToAdd = { ...cardToAdd, permanentFlavorBonus: (cardToAdd.permanentFlavorBonus || 0) + 1 };
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
      
      const newSandwich = [...state.playerSandwich, cardToAdd];
      const scores = calculateScores(newSandwich, state.permanentBreadBonus);
      
      // Check for bust
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
      
      // Tomato preview
      let preview = null;
      if (newCard.name === 'Tomato' && state.playerDeck.length > 1) {
        preview = state.playerDeck[1];
      }
      
      // Sticky Onions auto-draw
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
          message: `${state.opponentName} finished with ${scores.flavor} flavor! Your turn.`
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