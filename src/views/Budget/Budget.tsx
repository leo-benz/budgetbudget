import React, { Dispatch } from 'react';
import isAfter from 'date-fns/isAfter';
import { BudgetState, Action, useBudgetData } from '../../budget';
import { Header, Content } from '../../components';
import Month from '../Month';
import BudgetSlider from './BudgetSlider';
import { UiProvider } from './UiContext';
import CategorySidebar from '../CategorySidebar/CategorySidebar';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

export default function Budget({ state, dispatch }: Props) {
  const {
    error,
    retry,
    budgets,
    lastDate,
    futureBudget,
    numberFormatter,
    currency,
    categories,
  } = useBudgetData(state);

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        {retry && <button onClick={retry}>retry</button>}
      </div>
    );
  }

  return (
    <UiProvider>
      <Header />
      <Content>
        <BudgetSlider
          sticky={<CategorySidebar categories={categories || []} />}
        >
          {({ key, date }) => (
            <Month
              key={key}
              monthKey={key}
              date={date}
              currency={currency}
              dispatch={dispatch}
              budget={
                budgets[key] ||
                (lastDate && isAfter(date, lastDate) ? futureBudget : undefined)
              }
              categories={categories || []}
              numberFormatter={numberFormatter}
            />
          )}
        </BudgetSlider>
      </Content>
    </UiProvider>
  );
}
