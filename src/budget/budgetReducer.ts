import { BudgetState, Category, IncomeCategory, VERSION } from './Types';
import { initialSettings, unsaved, AppAction } from '../lib';

export const INITIAL_STATE = unsaved({
  name: '',
  version: VERSION,
  budgets: {},
  settings: initialSettings,
});

export const ACTION_INIT = Symbol('INIT');
export const ACTION_SET_NAME = Symbol('SET_NAME');
export const ACTION_SETTINGS_SET_FRACTION_DIGITS = Symbol(
  'ACTION_SETTINGS_SET_FRACTION_DIGITS',
);
export const ACTION_SETTINGS_SET_SELECTED_ACCOUNTS = Symbol(
  'ACTION_SETTINGS_SET_SELECTED_ACCOUNTS',
);
export const ACTION_SETTINGS_SET_CURRENCY = Symbol(
  'ACTION_SETTINGS_SET_CURRENCY',
);
export const ACTION_SETTINGS_SET_START_DATE = Symbol(
  'ACTION_SETTINGS_SET_START_DATE',
);
export const ACTION_SETTINGS_UPDATE_INCOME_CATEGORY = Symbol(
  'ACTION_SETTINGS_UPDATE_INCOME_CATEGORY',
);
export const ACTION_SETTINGS_REMOVE_INCOME_CATEGORY = Symbol(
  'ACTION_SETTINGS_REMOVE_INCOME_CATEGORY',
);
export const ACTION_SETTINGS_SET_INCOME_CATEGORIES = Symbol(
  'ACTION_SETTINGS_SET_INCOME_CATEGORIES',
);
export const ACTION_SETTINGS_ADD_INCOME_CATEGORY = Symbol(
  'ACTION_SETTINGS_ADD_INCOME_CATEGORY',
);
export const ACTION_SETTINGS_SET_INCOME_AVAILABLE_IN = Symbol(
  'ACTION_SETTINGS_SET_INCOME_AVAILABLE_IN',
);
export const ACTION_SETTINGS_SET_CATEGORY_COLLAPSED = Symbol(
  'ACTION_SETTINGS_SET_CATEGORY_COLLAPSED',
);
export const ACTION_SET_CATEGORY_VALUE = Symbol('ACTION_SET_CATEGORY_VALUE');
export const ACTION_SET_CATEGORY_ROLLOVER = Symbol(
  'ACTION_SET_CATEGORY_ROLLOVER',
);

type MonthCategory = {
  categoryId: string;
  monthKey: string;
};

type SetCategoryValueAction = {
  type: typeof ACTION_SET_CATEGORY_VALUE;
  payload: MonthCategory & {
    amount: number;
  };
};
type SetCategoryRolloverAction = {
  type: typeof ACTION_SET_CATEGORY_ROLLOVER;
  payload: MonthCategory & {
    rollover: boolean;
  };
};
type SetNameAction = {
  type: typeof ACTION_SET_NAME;
  payload: string;
};
type SetSettingsFractionDigits = {
  type: typeof ACTION_SETTINGS_SET_FRACTION_DIGITS;
  payload: number;
};
type SetSettingsSelectedAccounts = {
  type: typeof ACTION_SETTINGS_SET_SELECTED_ACCOUNTS;
  payload: string[];
};
type SetSettingsStartDate = {
  type: typeof ACTION_SETTINGS_SET_START_DATE;
  payload: number;
};
type SetSettingsIncomeCategories = {
  type: typeof ACTION_SETTINGS_SET_INCOME_CATEGORIES;
  payload: {
    id: string;
    availableIn: number;
  }[];
};
type UpdateSettingsIncomeCategory = {
  type: typeof ACTION_SETTINGS_UPDATE_INCOME_CATEGORY;
  payload: {
    oldCategoryId: string | null;
    categoryId: string | null;
  };
};
type SetSettingsIncomeAvailableIn = {
  type: typeof ACTION_SETTINGS_SET_INCOME_AVAILABLE_IN;
  payload: {
    categoryId: string | null;
    availableIn: number;
  };
};
type RemoveSettingsIncomeCategory = {
  type: typeof ACTION_SETTINGS_REMOVE_INCOME_CATEGORY;
  payload: string | null;
};
type AddSettingsIncomeCategory = {
  type: typeof ACTION_SETTINGS_ADD_INCOME_CATEGORY;
  payload?: {
    categoryId: string;
    availableIn?: number;
  };
};
type SetSettingsCurrency = {
  type: typeof ACTION_SETTINGS_SET_CURRENCY;
  payload: string;
};
type SetSettingsCategoryCollapsedAction = {
  type: typeof ACTION_SETTINGS_SET_CATEGORY_COLLAPSED;
  payload: {
    id: string;
    collapsed: boolean;
  };
};
type InitAction = {
  type: typeof ACTION_INIT;
  payload: BudgetState;
};
export type Action =
  | InitAction
  | SetCategoryValueAction
  | SetCategoryRolloverAction
  | SetNameAction
  | SetSettingsFractionDigits
  | SetSettingsSelectedAccounts
  | SetSettingsStartDate
  | SetSettingsCurrency
  | SetSettingsIncomeCategories
  | UpdateSettingsIncomeCategory
  | SetSettingsIncomeAvailableIn
  | SetSettingsCategoryCollapsedAction
  | RemoveSettingsIncomeCategory
  | AddSettingsIncomeCategory;

function updateCategory(
  state: BudgetState,
  { monthKey, categoryId }: MonthCategory,
  update: (category: Category) => Category,
): BudgetState {
  const {
    [monthKey]: monthlyBudget = { categories: {} },
    ...budgets
  } = state.budgets;
  const { categories: budgetCategories, ...other } = monthlyBudget;
  const newMonthlyBudget = other as typeof monthlyBudget;
  const { [categoryId]: category, ...categories } = budgetCategories;

  const newCategory = update(category || {});
  /* remove defaults */
  if (newCategory.amount === 0) {
    delete newCategory.amount;
  }
  if (newCategory.rollover === false) {
    delete newCategory.rollover;
  }

  if (Object.keys(newCategory).length) {
    categories[categoryId] = newCategory;
  }
  if (Object.keys(categories).length) {
    newMonthlyBudget.categories = categories;
  }
  if (Object.keys(newMonthlyBudget).length) {
    budgets[monthKey] = newMonthlyBudget;
  }

  return {
    ...state,
    budgets,
  };
}

function updateSettingsIncomeCategory(
  state: BudgetState,
  categoryId: string | null,
  update: (incomeCategory: IncomeCategory) => IncomeCategory | null,
) {
  const incomeCategories = state.settings.incomeCategories;
  const index = incomeCategories.findIndex(({ id }) => id === categoryId);
  if (index === -1) {
    return state;
  }

  return {
    ...state,
    settings: {
      ...state.settings,
      incomeCategories: [
        ...incomeCategories.slice(0, index),
        update(incomeCategories[index]),
        ...incomeCategories.slice(index + 1),
      ].filter((entry: null | IncomeCategory): entry is IncomeCategory =>
        Boolean(entry),
      ),
    },
  };
}

export function budgetReducer(
  state: BudgetState,
  action: AppAction,
): BudgetState {
  if (action.type === ACTION_INIT) {
    return action.payload;
  }
  if (state === null) {
    throw new Error(
      `Unexpected action ${action.type.toString()} on uninitiated state`,
    );
  }

  switch (action.type) {
    case ACTION_SET_CATEGORY_ROLLOVER:
      return updateCategory(state, action.payload, (category) => ({
        ...category,
        rollover: action.payload.rollover,
      }));
    case ACTION_SET_CATEGORY_VALUE:
      return updateCategory(state, action.payload, (category) => ({
        ...category,
        amount: action.payload.amount,
      }));
    case ACTION_SET_NAME:
      return {
        ...state,
        name: action.payload,
      };
    case ACTION_SETTINGS_SET_FRACTION_DIGITS:
      return {
        ...state,
        settings: {
          ...state.settings,
          fractionDigits: action.payload,
        },
      };
    case ACTION_SETTINGS_SET_SELECTED_ACCOUNTS:
      return {
        ...state,
        settings: {
          ...state.settings,
          accounts: action.payload,
        },
      };
    case ACTION_SETTINGS_SET_START_DATE:
      return {
        ...state,
        settings: {
          ...state.settings,
          startDate: action.payload,
        },
      };
    case ACTION_SETTINGS_SET_CURRENCY:
      return {
        ...state,
        settings: {
          ...state.settings,
          currency: action.payload,
        },
      };
    case ACTION_SETTINGS_SET_INCOME_CATEGORIES:
      return {
        ...state,
        settings: {
          ...state.settings,
          incomeCategories: action.payload,
        },
      };
    case ACTION_SETTINGS_UPDATE_INCOME_CATEGORY:
      return updateSettingsIncomeCategory(
        state,
        action.payload.oldCategoryId,
        (incomeCategory) => ({
          ...incomeCategory,
          id: action.payload.categoryId,
        }),
      );
    case ACTION_SETTINGS_SET_INCOME_AVAILABLE_IN:
      return updateSettingsIncomeCategory(
        state,
        action.payload.categoryId,
        (incomeCategory) => ({
          ...incomeCategory,
          availableIn: action.payload.availableIn,
        }),
      );
    case ACTION_SETTINGS_REMOVE_INCOME_CATEGORY:
      return updateSettingsIncomeCategory(state, action.payload, () => null);
    case ACTION_SETTINGS_ADD_INCOME_CATEGORY:
      return {
        ...state,
        settings: {
          ...state.settings,
          incomeCategories: state.settings.incomeCategories.concat({
            id: action.payload?.categoryId || null,
            availableIn: action.payload?.availableIn || 0,
          }),
        },
      };
    case ACTION_SETTINGS_SET_CATEGORY_COLLAPSED:
      return {
        ...state,
        settings: {
          ...state.settings,
          collapsedCategories: (state.settings.collapsedCategories || [])
            .filter((id) => id !== action.payload.id)
            .concat(action.payload.collapsed ? [action.payload.id] : []),
        },
      };
    default:
      return state;
  }
}
