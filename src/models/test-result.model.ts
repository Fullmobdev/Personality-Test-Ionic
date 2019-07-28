export interface TestResults {
    [test: string]: TestResult
}

export interface TestResult {

    answers: TestAnswers;

    rawResult: any;

    resultTypeId: string;

}

export interface TestAnswers {
    [question: string]: string | number;
}
