import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { TestResultType } from '../models/test-result-type.model';
import { IdModel } from '../models/id.model';
import { Observable } from 'rxjs/index';
import { map } from 'rxjs/operators';
import { TestResults } from '../models/test-result.model';

/**
 * Manages operations over the 'resultType' collection in Firestore
 */
@Injectable()
export class ResultTypesService {

    private resultTypesCollection = this.fireStore.collection<TestResultType>('resultTypes');

    constructor(private fireStore: AngularFirestore) { }

    getResultType(resultTypeId: string): Observable<IdModel<TestResultType>> {
        return this.resultTypesCollection.doc<TestResultType>(resultTypeId).valueChanges().pipe(
            map(resultType => {
                return resultType ? {
                    ...resultType,
                    id: resultTypeId
                } : null;
            })
        )
    }
}
