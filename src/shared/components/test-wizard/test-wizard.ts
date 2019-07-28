import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    OnDestroy
} from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Slides } from 'ionic-angular';

import { QuestionTypes, TestQuestion } from '../../../models/test-question.model';
import { TestAnswers } from '../../../models/test-result.model';

/**
 * Generated class for the TestWizardComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'test-wizard',
    templateUrl: 'test-wizard.html'
})
export class TestWizardComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    active = true;

    private currentAnswers = {};

    @ViewChild(Slides)
    slides: Slides;

    /**
     * Creates the initial questions list by putting the first value into it
     * stores the passed questions in to a private member to be used later
     * @param questions - Questions to be used in the test
     */
    @Input()
    questions: TestQuestion[];

    /**
     * Emits the form values to its parent component
     */
    @Output()
    testCompleted = new EventEmitter<TestAnswers>();

    constructor(private formBuilder: FormBuilder) { }

    /**
     * Returns the total questions length
     * @returns - Number
     */
    get totalQuestions() {
        return this.questions.length;
    }

    ngOnInit() {
        // Iterates over the provided questions
        // and creates the config of the form
        // If the question type is MostLeast then nest a new FormGroup under current question
        const controlsConfig = this.questions.reduce((acc, question) => {
            const control = question.type === QuestionTypes.MostLeast
                ? {
                    [question.id]: this.formBuilder.group({
                        ...question.answers.reduce((acc, answer) => {
                            acc[answer.id] = [0];
                            return acc;
                        }, {})
                    })
                }
                : { [question.id]: [null, Validators.required] };

            acc = {
                ...acc,
                ...control
            };

            return acc;
        }, {});



        this.form = this.formBuilder.group(controlsConfig);
    }

    ngOnDestroy() {
        this.active = false;
    }

    ngAfterViewInit() {
        this.slides.lockSwipeToNext(true);
    }

    /**
     * Sets the value in the mapped form control
     * @param questionId - The id of the form control
     * @param value - The value of the form control
     */
    setValue(questionId: string, value: string) {
        this.form.get(questionId).setValue(value);
        this.currentAnswers[questionId] = value;
        this.slideNext();
    }

    isCurrentAnswer(questionId: string, value: string) {
        return this.currentAnswers[questionId] === value;
    }

    /**
     * Adds the next question to the list and performs a slide to it
     */
    slideNext() {
        this.slides.lockSwipeToNext(false);
        this.slides.slideNext();
        this.slides.lockSwipeToNext(true);
    }

    /**
     * Invoked each time a slide change occurs
     * Checks if the slide to next slide ability should be locked
     */
    ionSlideDidChange() {
        const { id, type } = this.questions[this.slides.getActiveIndex()];
        const slideControl = this.form.get(id);

        const canSlideNext = type === QuestionTypes.MostLeast
            ? !this.slideIsValid(id)
            : !slideControl.valid;

        this.slides.lockSwipeToNext(canSlideNext);
    }

    /**
     * Invoked when the user finishes the test by clicking the "Finish" button
     * Gets the form value, transforms it to answers and emits to the parent component
     */
    onTestCompleted() {
        const value = this.form.value;

        const answers = Object.keys(value).reduce((acc, key) => {
            acc = typeof value[key] === 'object'
                ? { ...value[key], ...acc }
                : { ...acc, [key]: value[key] };

            return acc;
        }, {});

        this.testCompleted.emit(answers);
    }

    /**
     * Invoked each time a radio group of "mostLeast" question answer changes
     *
     * Makes the current slide have only one radio button checked like "Most" and one as "Least"
     * @param value - The value of the checked radio button
     * @param questionId - The id of the current question
     * @param answerId - The id of the current answer checked
     */
    onMostLeastChange(value, questionId, answerId) {
        const groupVal = this.form.get(questionId).value;

        const controls = Object.keys(groupVal).reduce((acc, curr) => {
            if (curr !== answerId && groupVal[curr] === value) {
                acc = [...acc, curr];
            }
            return acc;
        }, []);

        controls.forEach((id) => {
            this.form.get(questionId).get(id).reset(0);
        });
    }

    /**
     * Checks if the current slide is valid for "mostLeast" question type
     *
     * @param questionId - The id of the current question
     * @returns The current slide is valid or not
     */
    slideIsValid(questionId: string) {
        const value = this.form.get(questionId).value;

        return Object.keys(value)
            .filter(val => value[val] === 1 || value[val] === -1)
            .length >= 2;
    }
}
