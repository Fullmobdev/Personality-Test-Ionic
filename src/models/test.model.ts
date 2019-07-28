import { TestQuestion } from './test-question.model';
import { TestResultTypes } from './test-result-type.model';


export enum TestTypes {
    External = 'external',
    Internal = 'internal'
}

export type TestType  = TestTypes.External | TestTypes.Internal

export interface TestBaseModel {
    name: string;
    evaluate: string;
    pictureUrl: string;
    type: TestType
}

export interface Test extends TestBaseModel {
    questions: TestQuestion[];
    fetchFn?: string;
    evaluateFn?: TestEvaluationFunction;
    resultTypes?: TestResultTypes,
}

export type TestEvaluationFunction = (answers: object) => any;
