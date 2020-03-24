import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { ThrowReporter } from 'io-ts/lib/ThrowReporter';

export const VERSION = '0.0.1';

const currencyShape = t.union([t.literal('EUR'), t.literal('USD')]);
const amountShape = t.tuple([t.number, currencyShape]);
const budgetShape = t.type({
  categories: t.record(
    t.number,
    t.type({
      amount: t.number,
    }),
  ),
});
const budgetsShape = t.record(
  t.string,
  t.union([budgetShape, t.undefined]),
  'budgets',
);
const incomeCategoryShape = t.type(
  {
    id: t.number,
    availableIn: t.number,
  },
  'incomeCategories',
);
const budgetStateShape = t.intersection(
  [
    t.partial(
      {
        name: t.string,
        startAmount: t.array(amountShape),
      },
      'optional',
    ),
    t.type(
      {
        version: t.string,
        budgets: t.record(t.string, t.union([t.undefined, budgetShape])),
        settings: t.type(
          {
            accounts: t.array(t.string),
            incomeCategories: t.array(incomeCategoryShape),
          },
          'settings',
        ),
      },
      'required',
    ),
  ],
  'budget',
);

export type BudgetState = t.TypeOf<typeof budgetStateShape>;
export type Budget = t.TypeOf<typeof budgetShape>;
export type Budgets = t.TypeOf<typeof budgetsShape>;
export type IncomeCategory = t.TypeOf<typeof incomeCategoryShape>;

export function validateBudgetState(data: unknown): BudgetState {
  const c = budgetStateShape.decode(data);
  if (isLeft(c)) {
    throw ThrowReporter.report(c);
  }
  return data as BudgetState;
}
