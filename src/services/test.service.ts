import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';

import { QuestionTypes, TestAnswer, TestQuestion } from '../models/test-question.model';
import { Test, TestEvaluationFunction, TestTypes } from '../models/test.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { IdModel } from '../models/id.model';
import { TestAnswers, TestResult, TestResults } from '../models/test-result.model';
import { TestResultType } from '../models/test-result-type.model';
import { ProfileService } from './profile.service';
import { ResultTypesService } from './result-types.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Globalization } from '@ionic-native/globalization';

export const OFFLINE_TESTS_KEY = 'tests';

/**
 * Manages tests collection in Firestore
 */
@Injectable()
export class TestService {

    private testsCollection = this.fireStore.collection<Test>('tests');

    private resultsCollection = this.fireStore.collection<TestResults>('results');

    private resultTypesCollection = this.fireStore.collection<TestResultType>('resultTypes');

    private testsReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        private fireStore: AngularFirestore,
        private storage: Storage,
        private firestoreFns: AngularFireFunctions,
        private globalization: Globalization,
        private translate: TranslateService,
        private authService: AuthService,
        private profileService: ProfileService,
        private resultTypeService: ResultTypesService
    ) { }

    /**
     * Saves all the tests from the collection to the device storage
     */
    saveTestsOffline() {
        return this.authService.getAuthState().pipe(
            switchMap(user => {
                return (user)
                    ? this.testsCollection.snapshotChanges()
                    : of([]);
            }),
            map(snapshots =>
                snapshots.reduce((tests, snapshot) => {
                    const test = snapshot.payload.doc.data() as Test;
                    const id = snapshot.payload.doc.id;
                    tests[id] = test;
                    return tests;
                }, {})
            ),
            tap(async tests => {
                await this.storage.set(OFFLINE_TESTS_KEY, tests);
                this.testsReady$.next(true);
            })
        );
    }

    /**
     * Gets all the stored tests from device storage
     */
    getOfflineTests(): Observable<{ [id: string]: Test }> {
        return this.testsReady$.pipe(
            filter(Boolean),
            switchMap(() => {
                return this.storage.get(OFFLINE_TESTS_KEY);
            })
        );
    }

    /**
     * Gets all the stored tests from device storage as a list with id
     */
    getOfflineTestList(): Observable<IdModel<Test>[]> {
        return this.getOfflineTests().pipe(
            map(tests => {
                return Object.keys(tests).map(id => {
                    return {
                        ...tests[id],
                        id
                    };
                });
            })
        );
    }

    /**
     * Gets atest from device storage
     * @param id Test id
     */
    getOfflineTest(id: string) {
        return this.getOfflineTests().pipe(
            map(tests => {
                return tests[id];
            }),
            filter(Boolean),
            switchMap(test => this.transformTest(id, test)),
        );
    }

    /**
     * Get the test results for the given user
     * @param userId
     */
    getTestResultsForUser(userId: string): Observable<TestResults> {
        return this.resultsCollection.doc<TestResults>(userId)
            .valueChanges()
            .pipe(map(results =>
                Boolean(results)
                    ? results
                    : {}
                )
            );
    }

    /**
     * Store the test result for the given user and test
     * @param userId
     * @param testId
     * @param result
     */
    async storeTestResultForUser(userId: string, testId: string, result: TestResult): Promise<void> {
        const oldResults = await this.resultsCollection.doc<TestResults>(userId).valueChanges().pipe(
            take(1)).toPromise();
        const profile = await this.profileService.getProfile(userId).pipe(take(1)).toPromise();
        if (profile) {
            if (oldResults && oldResults[testId] && oldResults[testId].resultTypeId) {
                const resultType = await this.resultTypeService.getResultType(oldResults[testId].resultTypeId).pipe(
                    take(1)).toPromise();
                await this.profileService.removeResultTypeFromProfile(userId, oldResults[testId].resultTypeId);
                await this.profileService.removeTraitsFromProfile(userId, resultType.traits);
            }
        }
        await this.resultsCollection.doc<TestResults>(userId).set({
            [testId]: result
        }, { merge: true });
    }


    /**
     * Transforms the test to be used in the application
     * @param id Test id
     * @param test Test to be transformed
     */
    async transformTest(id: string, test: Test): Promise<IdModel<Test>> {
        if (test.type === TestTypes.External) {
            const fn = this.firestoreFns.httpsCallable<{ locale: string }, TestQuestion[]>(test.fetchFn);
            const questions = await fn({ locale: this.translate.currentLang }).pipe(take(1)).toPromise();

            Object.assign(test, { questions });
        }

        const questions = await Promise.all(test.questions.map(async question => {

            if (question.type === QuestionTypes.Likert) {
                return {
                    ...question,
                    answers: this.generateLikertAnswers()
                };
            } else if (question.type === QuestionTypes.MostLeast) {

                const questionTitle = await this.translate.get('tests.mostLeastQuestionTitle')
                    .pipe(take(1))
                    .toPromise();

                return {
                    ...question,
                    title: {
                        [this.translate.currentLang]: questionTitle
                    }
                }
            }

            return question;
        }));

        const evaluateFn =
            test.type === TestTypes.Internal
                ? this.getEvaluationFunction(test)
                : null;

        return { ...test, questions, evaluateFn, id };
    };

    /**
     * Parses tests evaluation function
     * @param test Test which evaluation function should be parsed
     */
    private getEvaluationFunction(test: Test): TestEvaluationFunction {
        return new Function(`
            "use strict";
            ${test.evaluate}
            return evaluate;
        `)();
    }

    /**
     * Returns a list of answers for the 'Likert' test question type
     * @beta
     */
    private generateLikertAnswers = (): TestAnswer[] => {
        // @todo extract this to translation files
        return [
            {
                value: 1,
                title: {
                    en: 'Disagree',
                    de: 'Stimme nicht zu'
                }
            },
            {
                value: 2,
                title: {
                    en: 'Slightly disagree',
                    de: 'Stimme teilweise nicht zu'
                }
            },
            {
                value: 3,
                title: {
                    en: 'Neutral',
                    de: 'Neutral'
                }
            },
            {
                value: 4,
                title: {
                    en: 'Slightly agree',
                    de: 'Stimme teilweise zu'
                }
            },
            {
                value: 5,
                title: {
                    en: 'Agree',
                    de: 'Stimme zu'
                }
            }
        ];
    };

    /**
     * Evaluates the external test using cloud functions
     * @param answers The answers to be evaluated
     * @evaluationFn The name of the cloud function to execute
     * @returns
     */
    evaluateExternalTestAnswers(answers: TestAnswers, evaluationFn: string) {
        const language = this.translate.currentLang;

        return this.firestoreFns.httpsCallable<{ answers: TestAnswers, language: string }, TestResult>(evaluationFn)({ answers, language })
            .pipe(take(1))
            .toPromise();
    }
}
