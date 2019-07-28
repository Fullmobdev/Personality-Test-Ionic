export enum QuestionTypes {
    Custom = 'custom',
    Likert = 'likert',
    MostLeast = 'mostLeast'
}

type QuestionType = 'likert' | 'custom' | 'mostLeast';

export interface TestAnswer {
    id?: string;
    value: any;
    title: { [key: string]: any };
}

export interface TestQuestion {
    id: string;
    title: {
        [key: string]: any;
    };
    type: QuestionType;
    answers?: TestAnswer[];
}
