import React, {
  Dispatch,
  unstable_useTransition,
  useCallback,
  useState,
} from 'react';
import { BudgetAction, BudgetState } from '../../budget';
import { Content, Button, Header, HeaderSpacer } from '../../components';
import useMenu from '../../lib/useMenu';
import { OK, Step } from './Types';
import { MoneyMoneyRes } from '../../moneymoney';
import { HeaderHeightProvider } from '../../lib';
import Welcome from './01_welcome';
import TreasureChest from './02_treasureChest';
// import NameAndPurpose from './__03_nameAndPurpose';
import FirstMonth from './03_firstMonth';
// import Categories from './02_categories';
// import FillCategories from './__03_fillCategories';
// import AvailableFunds from './04_incomeCategories.tsx_';
import styles from './NewBudget.module.scss';

const STEPS: Step[] = [
  Welcome,
  TreasureChest,
  FirstMonth,
  // NameAndPurpose,
  // Categories,
  // FillCategories,
  // AvailableFunds,
];

type Props = {
  state: BudgetState;
  dispatch: Dispatch<BudgetAction>;
  moneyMoney: MoneyMoneyRes;
  onCreate: () => void;
};

const INITIAL_STEP = 1;

function getProgress(i: number) {
  return Math.round((100 / (STEPS.length - 1)) * i);
}

type StepState = {
  step: Step;
  nextTitle: string | undefined;
  prev: boolean;
  progress: number;
  ok: OK;
};
export default function NewBudget({ state, dispatch, moneyMoney }: Props) {
  const [
    {
      step: { Comp },
      prev,
      ok,
      nextTitle,
      progress,
    },
    setStep,
  ] = useState<StepState>(() => ({
    step: STEPS[INITIAL_STEP],
    progress: getProgress(INITIAL_STEP),
    prev: false,
    nextTitle: STEPS[INITIAL_STEP + 1]?.title,
    ok: STEPS[INITIAL_STEP].initialOk(state),
  }));
  useMenu(moneyMoney.refresh);

  const [startTransition] = unstable_useTransition({
    timeoutMs: 5000,
  });
  const nextPage = useCallback(() => {
    startTransition(() => {
      setStep(({ step }) => {
        const nextIndex = STEPS.indexOf(step) + 1;
        const nextStep = STEPS[nextIndex];
        const nextTitle = STEPS[STEPS.indexOf(nextStep) + 1]?.title;

        return {
          step: nextStep,
          prev: true,
          nextTitle,
          progress: getProgress(nextIndex),
          ok: nextStep.initialOk(state),
        };
      });
    });
  }, [startTransition, state]);

  const prevPage = useCallback(() => {
    startTransition(() => {
      setStep(({ step }) => {
        const nextIndex = STEPS.indexOf(step) - 1;
        const nextStep = STEPS[nextIndex];
        const nextTitle = STEPS[STEPS.indexOf(nextStep) + 1]?.title;

        return {
          step: nextStep,
          prev: nextIndex !== 0,
          nextTitle,
          progress: getProgress(nextIndex),
          ok: nextStep.initialOk(state),
        };
      });
    });
  }, [startTransition, state]);
  const setOk = useCallback((ok: OK) => {
    setStep((step) => ({ ...step, ok }));
  }, []);

  if (state === null) {
    throw new Error('Unexpected non-initialized state');
  }

  return (
    <HeaderHeightProvider>
      <Content
        flex
        header={
          <Header>
            <span>Create a new Budget ({progress}%)</span>
            <HeaderSpacer />
            {prev ? (
              <Button onClick={prevPage} className={styles.prevButton}>
                ◀
              </Button>
            ) : null}
            <Button>Jump to Settings</Button>
            {nextTitle ? (
              <Button
                primary={ok === 'primary'}
                disabled={ok === false}
                onClick={nextPage}
              >
                {nextTitle}
              </Button>
            ) : null}
          </Header>
        }
      >
        <Comp
          setOk={setOk}
          state={state}
          dispatch={dispatch}
          moneyMoney={moneyMoney}
          nextPage={nextPage}
          prevPage={prevPage}
        />
      </Content>
    </HeaderHeightProvider>
  );
}
