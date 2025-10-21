// Card database - all card stats and abilities
export const CARD_DATABASE = {
  'Bread': { name: 'Bread', flavor: 0, yuck: 0, cash: 0, cost: null, ability: 'Always first, and last.', imageFile: 'bread.png' },
  'Cream Cheese': { name: 'Cream Cheese', flavor: 2, yuck: 1, cash: 0, cost: null, category: 'Cheese', imageFile: 'cream-cheese.png' },
  'Jelly': { name: 'Jelly', flavor: 1, yuck: 0, cash: 0, cost: 3, imageFile: 'jelly.png' },
  'Bananas': { name: 'Bananas', flavor: 0, yuck: 0, cash: 2, cost: 2, imageFile: 'bananas.png' },
  'Cold Turkey': { name: 'Cold Turkey', flavor: 2, yuck: 0, cash: 0, cost: 7, category: 'Meat', ability: 'Cancels 1 yuck', imageFile: 'cold-turkey.png' },
  'Beefy Balogna': { name: 'Beefy Balogna', flavor: 2, yuck: 0, cash: 1, cost: 9, category: 'Meat', ability: '+1 flavor per other baloney', imageFile: 'beefy-balogna.png' },
  'Ham': { name: 'Ham', flavor: 2, yuck: 0, cash: 0, cost: 9, category: 'Meat', ability: '+2 flavor per cheese', imageFile: 'ham.png' },
  'Spiced Ham': { name: 'Spiced Ham', flavor: -1, yuck: 0, cash: 0, cost: 10, category: 'Meat', ability: 'Next card +1 flavor (permanent)', imageFile: 'spiced-ham.png' },
  'Chicken Liver Patee': { name: 'Chicken Liver Patee', flavor: 3, yuck: 1, cash: 7, cost: 7, category: 'Meat', imageFile: 'chicken-liver-patee.png' },
  'American Cheeze': { name: 'American Cheeze', flavor: 4, yuck: 1, cash: 0, cost: 5, category: 'Cheese', imageFile: 'american-cheeze.png' },
  'Lettuce': { name: 'Lettuce', flavor: 0, yuck: 0, cash: 4, cost: 5, imageFile: 'lettuce.png' },
  'Mayonaise': { name: 'Mayonaise', flavor: 1, yuck: 1, cash: 0, cost: 3, ability: '+20 flavor next to bread', imageFile: 'mayonaise.png' },
  'Peanut Butter': { name: 'Peanut Butter', flavor: 1, yuck: 0, cash: 0, cost: 8, ability: '+1 flavor permanently if next to Jelly', imageFile: 'peanut-butter.png' },
  'Lean Beef': { name: 'Lean Beef', flavor: 1, yuck: 0, cash: 0, cost: 10, category: 'Meat', ability: 'Flavor doubles per beef', imageFile: 'lean-beef.png' },
  'Tar tar sauce': { name: 'Tar tar sauce', flavor: 0, yuck: 0, cash: 0, cost: 4, ability: 'Cancels 1 yuck, +1 per fish', imageFile: 'tar-tar-sauce.png' },
  'Tomato': { name: 'Tomato', flavor: 1, yuck: 0, cash: 2, cost: 6, ability: 'Shows next card', imageFile: 'tomato.png' },
  'Sticky Onions': { name: 'Sticky Onions', flavor: 3, yuck: 0, cash: 2, cost: 7, ability: 'Never last (auto-draw)', imageFile: 'sticky-onions.png' },
  'Pickles': { name: 'Pickles', flavor: 2, yuck: 0, cash: 0, cost: 16, ability: 'Flavor increases quadratically for each yuck', imageFile: 'pickles.png' },
  'Cheddar Slices': { name: 'Cheddar Slices', flavor: 1, yuck: 0, cash: 1, cost: 4, category: 'Cheese', imageFile: 'cheddar-slices.png' },
  'Salty Sardines': { name: 'Salty Sardines', flavor: 0, yuck: 1, cash: 0, cost: 8, category: 'Fish', ability: 'Bread +1 flavor permanently', imageFile: 'salty-sardines.png' }
};

// Bot names for opponent generation
export const BOT_NAMES = [
  "Lunchbox Larry", "Sandwich Sally", "Breadly Cooper", "Mayo Mike", "Pickle Pete",
  "Jelly Jeff", "Burger Bob", "Cheese Chad", "Lettuce Lucy", "Tomato Tom",
  "Bacon Barry", "Mustard Mary", "Ketchup Kevin", "Onion Oscar", "Peanut Patty"
];

// Card ID counter for unique card instances
let cardIdCounter = 0;

export const createCard = (cardName, permanentFlavorBonus = 0) => ({
  id: cardIdCounter++,
  name: cardName,
  permanentFlavorBonus
});

export const createStarterDeck = () => {
  const names = [
    'Bread', 'Bread', 
    'Cream Cheese', 'Cream Cheese', 'Cream Cheese', 'Cream Cheese',
    'Jelly', 'Jelly', 'Jelly', 'Jelly',
    'Bananas', 'Bananas'
  ];
  return names.map(name => createCard(name));
};

export const getOpponentName = (matchNumber) => {
  if (matchNumber === 11) return "Fat Jared";
  return BOT_NAMES[(matchNumber - 1) % BOT_NAMES.length];
};