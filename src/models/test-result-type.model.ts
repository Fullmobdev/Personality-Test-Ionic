export interface TestResultType {
    testId: string;
    do: { [key: string]: any };
    dont: { [key: string]: any };
    longDescription: { [key: string]: any };
    personalityType: { [key: string]: any };
    roleName: { [key: string]: any };
    shortDescription: { [key: string]: any };
    traits: string[]
}

export interface TestResultTypes  {
  [key: string]: TestResultType
}
