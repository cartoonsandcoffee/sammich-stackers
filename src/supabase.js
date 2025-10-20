// Supabase API service
const SUPABASE_URL = 'https://tlycunaumisczhvhvmjd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRseWN1bmF1bWlzY3podmh2bWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTE4ODksImV4cCI6MjA3NjM4Nzg4OX0.NUISxj2iDHXv0EpEC6TkYExv6gHualEmVctg1v_zMLk';

export const supabaseRequest = async (endpoint, options = {}) => {
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

export const fetchOpponentDeck = async (matchNumber, createCard, generateBotDeck, getOpponentName) => {
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
  
  // Fallback to bot
  console.log('Generating bot deck for match:', matchNumber);
  const botDeckNames = generateBotDeck(matchNumber);
  
  return {
    deck: botDeckNames.map(name => createCard(name)),
    opponentName: getOpponentName(matchNumber),
    deckId: null
  };
};

export const saveWinningDeck = async (username, matchNumber, playerCollection, playerFinalScore, permanentBreadBonus) => {
  if (!username) {
    console.log('Not saving - no username');
    return { success: false };
  }
  
  const deckComposition = playerCollection.map(card => ({
    name: card.name,
    permanentFlavorBonus: card.permanentFlavorBonus || 0
  }));
  
  const deckData = {
    username: username,
    match_number: matchNumber,
    deck_composition: deckComposition,
    final_score: playerFinalScore,
    permanent_bread_bonus: permanentBreadBonus
  };
  
  console.log('Deck to save:', deckData);
  
  try {
    const result = await supabaseRequest('winning_decks', {
      method: 'POST',
      body: JSON.stringify(deckData)
    });
    
    console.log('Deck saved successfully!', result);
    return { success: true };
  } catch (error) {
    console.error('Error saving deck:', error);
    const jsonString = JSON.stringify(deckData, null, 2);
    return { success: false, deckData, jsonString };
  }
};