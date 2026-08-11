import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

// ---------------------------------------------------------------------------
// Centralized game numbers. Tune the whole game's balance from right here.
// ---------------------------------------------------------------------------

export const STARTING_CASH = 100;
export const OBJECTIVE_TARGET = 10000;

export const RESOURCES = {
  labor: { id: 'labor', name: 'Labor', price: 3, startingStock: 20 },
  wood: { id: 'wood', name: 'Wood', price: 5, startingStock: 10 },
  metal: { id: 'metal', name: 'Metal', price: 6, startingStock: 12 },
  cloth: { id: 'cloth', name: 'Cloth', price: 2, startingStock: 9 },
};

// Recipe id doubles as the good id — each recipe produces exactly one good type.
// craftTimeMs: how long a single batch takes to manufacture (bigger/rarer goods take longer).
// maxHeld: inventory ceiling for that good — crafting is blocked once owning this many.
export const RECIPES = {
  cars: {
    id: 'cars',
    name: 'Cars',
    inputs: { labor: 8, metal: 7, cloth: 3 },
    yield: 3,
    sellPrice: 200,
    craftTimeMs: 30000,
    maxHeld: 6,
  },
  furniture: {
    id: 'furniture',
    name: 'Furniture',
    inputs: { labor: 6, wood: 5, cloth: 4 },
    yield: 10,
    sellPrice: 300,
    craftTimeMs: 15000,
    maxHeld: 15,
  },
  clothes: {
    id: 'clothes',
    name: 'Clothes',
    inputs: { labor: 5, cloth: 4 },
    yield: 20,
    sellPrice: 300,
    craftTimeMs: 10000,
    maxHeld: 30,
  },
  houses: {
    id: 'houses',
    name: 'Houses',
    inputs: { labor: 10, wood: 8, metal: 4 },
    yield: 1,
    sellPrice: 400,
    craftTimeMs: 60000,
    maxHeld: 2,
  },
};

export const RESOURCE_IDS = Object.keys(RESOURCES);
export const RECIPE_IDS = Object.keys(RECIPES);

function buildInitialState() {
  const resources = {};
  RESOURCE_IDS.forEach((id) => {
    resources[id] = { owned: 0, remainingStock: RESOURCES[id].startingStock };
  });
  const goods = {};
  RECIPE_IDS.forEach((id) => {
    goods[id] = 0;
  });
  return {
    cash: STARTING_CASH,
    resources,
    goods,
    manufacturing: null, // { recipeId, startedAt, endsAt } while a batch is in progress
    hasWon: false,
  };
}

function withWinCheck(state) {
  return state.cash >= OBJECTIVE_TARGET ? { ...state, hasWon: true } : state;
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'BUY': {
      const { cart, totalCost } = action.payload;
      const resources = { ...state.resources };
      Object.entries(cart).forEach(([id, qty]) => {
        if (qty <= 0) return;
        resources[id] = {
          owned: resources[id].owned + qty,
          remainingStock: resources[id].remainingStock - qty,
        };
      });
      return withWinCheck({ ...state, cash: state.cash - totalCost, resources });
    }
    case 'CRAFT_START': {
      const { recipeId, startedAt, endsAt } = action.payload;
      const recipe = RECIPES[recipeId];
      const resources = { ...state.resources };
      Object.entries(recipe.inputs).forEach(([id, amount]) => {
        resources[id] = { ...resources[id], owned: resources[id].owned - amount };
      });
      return { ...state, resources, manufacturing: { recipeId, startedAt, endsAt } };
    }
    case 'CRAFT_COMPLETE': {
      if (!state.manufacturing) return state;
      const { recipeId } = state.manufacturing;
      const recipe = RECIPES[recipeId];
      const goods = { ...state.goods, [recipeId]: state.goods[recipeId] + recipe.yield };
      return { ...state, goods, manufacturing: null };
    }
    case 'SELL': {
      const { goodId } = action.payload;
      const recipe = RECIPES[goodId];
      const goods = { ...state.goods, [goodId]: state.goods[goodId] - 1 };
      return withWinCheck({ ...state, cash: state.cash + recipe.sellPrice, goods });
    }
    case 'RESET':
      return buildInitialState();
    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, buildInitialState);

  // Drives manufacturing to completion in real time, independent of which
  // screen is focused — mirrors the CashDisplay approach of using a plain
  // timer rather than requestAnimationFrame so it keeps running on hidden tabs.
  useEffect(() => {
    if (!state.manufacturing) return undefined;
    const remaining = Math.max(0, state.manufacturing.endsAt - Date.now());
    const timeoutId = setTimeout(() => dispatch({ type: 'CRAFT_COMPLETE' }), remaining);
    return () => clearTimeout(timeoutId);
  }, [state.manufacturing]);

  const isManufacturing = state.manufacturing !== null;

  const cartSubtotal = useCallback((cart) => {
    return Object.entries(cart).reduce((sum, [id, qty]) => sum + RESOURCES[id].price * qty, 0);
  }, []);

  const buyResources = useCallback(
    (cart) => {
      if (isManufacturing) {
        return { success: false, message: 'Manufacturing in progress — please wait' };
      }
      const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
      if (entries.length === 0) {
        return { success: false, message: 'Add at least one item to your cart' };
      }
      for (const [id, qty] of entries) {
        if (qty > state.resources[id].remainingStock) {
          return { success: false, message: `Not enough ${RESOURCES[id].name} in stock` };
        }
      }
      const totalCost = cartSubtotal(cart);
      if (totalCost > state.cash) {
        return { success: false, message: 'Not enough cash' };
      }
      dispatch({ type: 'BUY', payload: { cart, totalCost } });
      const summary = entries.map(([id, qty]) => `${qty} ${RESOURCES[id].name}`).join(', ');
      return { success: true, message: `Bought ${summary}` };
    },
    [isManufacturing, state.resources, state.cash, cartSubtotal]
  );

  const missingInputs = useCallback(
    (recipeId) => {
      const recipe = RECIPES[recipeId];
      return Object.entries(recipe.inputs)
        .filter(([id, amount]) => state.resources[id].owned < amount)
        .map(([id]) => id);
    },
    [state.resources]
  );

  // null | 'busy' | 'missing' | 'full' — why a recipe currently can't be crafted.
  const craftBlockReason = useCallback(
    (recipeId) => {
      if (isManufacturing) return 'busy';
      if (missingInputs(recipeId).length > 0) return 'missing';
      const recipe = RECIPES[recipeId];
      if (state.goods[recipeId] + recipe.yield > recipe.maxHeld) return 'full';
      return null;
    },
    [isManufacturing, missingInputs, state.goods]
  );

  const canCraft = useCallback((recipeId) => craftBlockReason(recipeId) === null, [craftBlockReason]);

  const craftGood = useCallback(
    (recipeId) => {
      const reason = craftBlockReason(recipeId);
      const recipe = RECIPES[recipeId];
      if (reason === 'busy') {
        return { success: false, message: 'Manufacturing in progress — please wait' };
      }
      if (reason === 'missing') {
        const names = missingInputs(recipeId)
          .map((id) => RESOURCES[id].name)
          .join(', ');
        return { success: false, message: `Missing ${names}`, missing: missingInputs(recipeId) };
      }
      if (reason === 'full') {
        return { success: false, message: `You can only hold ${recipe.maxHeld} ${recipe.name} at once` };
      }
      const startedAt = Date.now();
      const endsAt = startedAt + recipe.craftTimeMs;
      dispatch({ type: 'CRAFT_START', payload: { recipeId, startedAt, endsAt } });
      return { success: true, message: `Started crafting ${recipe.name}` };
    },
    [craftBlockReason, missingInputs]
  );

  const sellGood = useCallback(
    (goodId) => {
      if (isManufacturing) {
        return { success: false, message: 'Manufacturing in progress — please wait' };
      }
      if (state.goods[goodId] <= 0) {
        return { success: false, message: 'Nothing to sell' };
      }
      dispatch({ type: 'SELL', payload: { goodId } });
      const recipe = RECIPES[goodId];
      return { success: true, message: `Sold 1 ${recipe.name} for $${recipe.sellPrice}` };
    },
    [isManufacturing, state.goods]
  );

  const resetGame = useCallback(() => dispatch({ type: 'RESET' }), []);

  const canAfford = useCallback((cost) => cost <= state.cash, [state.cash]);
  const progress = Math.min(1, state.cash / OBJECTIVE_TARGET);
  const hasAnyGoods = RECIPE_IDS.some((id) => state.goods[id] > 0);
  const hasAnyOwnedResources = RESOURCE_IDS.some((id) => state.resources[id].owned > 0);

  const value = useMemo(
    () => ({
      state,
      buyResources,
      craftGood,
      sellGood,
      resetGame,
      canAfford,
      cartSubtotal,
      canCraft,
      missingInputs,
      craftBlockReason,
      isManufacturing,
      progress,
      hasAnyGoods,
      hasAnyOwnedResources,
    }),
    [
      state,
      buyResources,
      craftGood,
      sellGood,
      resetGame,
      canAfford,
      cartSubtotal,
      canCraft,
      missingInputs,
      craftBlockReason,
      isManufacturing,
      progress,
      hasAnyGoods,
      hasAnyOwnedResources,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
