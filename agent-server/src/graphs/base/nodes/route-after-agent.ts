import { MainStateType, NextStep } from "../state";

export function routeAfterAgent(state: MainStateType): NextStep {
  if (!state.nextStep) {
    return "annotationHandler";
  }
  return state.nextStep;
}
