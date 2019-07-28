import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios, { AxiosRequestConfig } from 'axios';
import * as algoliasearch from 'algoliasearch';
import { groupBy } from 'lodash/fp';

import { translations } from './translations';

const diff = (a1, a2): any[] =>
    a1
        .concat(a2)
        .filter((val, idx, arr) => arr.indexOf(val) === arr.lastIndexOf(val));

// Init firebase admin
admin.initializeApp();

const firestore = admin.firestore();
firestore.settings({ timestampsInSnapshots: true });

// Get the env
const env = functions.config();

// Init algolia client
const client = algoliasearch(env.algolia.appid, env.algolia.apikey);

// Profiles collection index
const index = client.initIndex('profiles');

// Index an added profile
exports.indexProfile = functions.firestore
    .document('profiles/{profileId}')
    .onCreate(snap => {
        const { displayName, email } = snap.data();

        const objectID = snap.id;

        return index.addObject({
            objectID,
            displayName,
            email
        });
    });

// Unindex a removed profile
exports.unindexProfile = functions.firestore
    .document('profiles/{profileId}')
    .onDelete(snap => {
        const objectID = snap.id;

        return index.deleteObject(objectID);
    });

// Index an updated profile
exports.updateIndex = functions.firestore
    .document('profiles/{profileId}')
    .onUpdate((snap, context) => {
        const id = snap.after.id;
        const { displayName, email } = snap.after.data();

        return index.saveObject({
            objectID: id,
            displayName,
            email
        });
    });

/** Notifications */

exports.tribeNotifications = functions.firestore
    .document('tribes/{tribeId}')
    .onUpdate(async (snap, context) => {
        const oldMembers = snap.before.data().members;
        const newMembers = snap.after.data().members;
        const tribeName = snap.after.data().name;
        const tribeId = snap.after.id;

        const userId = diff(oldMembers, newMembers)[0];

        if (!userId) {
            console.log('Aborting due to no changes...');
            return null;
        }

        const user = await firestore
            .collection('devices')
            .doc(userId)
            .get();

        const { devices } = user.data();

        const byLang = groupBy('lang', devices);

        Object.keys(byLang).forEach(lang => {
            const userLocale = translations[lang] || translations.en;

            const message =
                oldMembers.length > newMembers.length
                    ? userLocale.tribeRemove(tribeName)
                    : userLocale.tribeInvite(tribeName);

            const route =
                oldMembers.length > newMembers.length
                    ? JSON.stringify({ page: 'TribesPage' })
                    : JSON.stringify({
                        page: 'TribeDetailsPage',
                        params: { tribeId }
                    });

            const payload = {
                notification: {
                    body: message
                },
                data: {
                    route: route
                }
            };

            const tokens = byLang[lang].map(device => device.token);

            console.log(`Sending notifications to the next devices ${tokens}`);

            return admin.messaging().sendToDevice(tokens, payload);
        });
    });

exports.friendsNotifications = functions.firestore
    .document('profiles/{profileId}')
    .onUpdate(async (snap, context) => {
        const oldFriends = snap.before.data().friends;
        const newFriends = snap.after.data().friends;
        const userName = snap.after.data().displayName;
        const profileId = snap.after.id;

        const userId = diff(oldFriends, newFriends)[0];

        if (!userId) {
            console.log('Aborting due to no changes...');
            return null;
        }

        if (oldFriends.length > newFriends.length) {
            console.log(
                'User has been removed from the friends list... no notification needed'
            );
            return null;
        }

        const user = await firestore
            .collection('devices')
            .doc(userId)
            .get();

        const { devices } = user.data();

        const byLang = groupBy('lang', devices);

        Object.keys(byLang).forEach(lang => {
            const userLocale = translations[lang] || translations.en;

            const message = userLocale.friendAdded(userName);

            const route = JSON.stringify({
                page: 'ProfilePage',
                params: { userId: profileId }
            });

            const payload = {
                notification: {
                    body: message
                },
                data: {
                    route: route
                }
            };

            const tokens = byLang[lang].map(device => device.token);

            console.log(`Sending notifications to the next devices ${tokens}`);

            return admin.messaging().sendToDevice(tokens, payload);
        });
    });

/** External tests */

exports.getG8TExternalTestQuestions = functions.https.onCall(async (data, context) => {

    const locale = data.locale || 'en';
    const apiBase = functions.config().rocapi.baseurl;
    const requestUrl = `${apiBase}/archetype/g8t/mostleast/${locale}`;


    const config: AxiosRequestConfig = {
        headers: {
            'x-api-key': functions.config().rocapi.apikey
        }
    };

    try {
        const g8tSnapshot = await firestore.collection('tests').doc('g8t').get();
        const { customTexts } = g8tSnapshot.data();

        const { data: answers } = await axios.get(requestUrl, config);

        return answers.map((possibleAnswers, idx) => (
            {
                id: `q${idx + 1}`,
                answers: Object.keys(possibleAnswers).map(answerId => ({
                    id: answerId,
                    title: {
                        [locale]: customTexts[answerId][locale] || possibleAnswers[answerId]
                    },
                    value: 0
                })),
                type: 'mostLeast'
            }
        ));
    } catch (e) {
        throw new functions.https.HttpsError('unknown', e.toString());
    }
});

exports.evaluateG8TExternalTest = functions.https.onCall(async (data) => {
    const baseUrl = functions.config().rocapi.baseurl;
    const requestUrl = `${baseUrl}/trial`;
    const apiKey = functions.config().rocapi.apikey;

    const config: AxiosRequestConfig = {
        headers: {
            'x-api-key': apiKey
        }
    };

    const http = axios.create(config);

    const { answers: input, language = 'en' } = data;

    const payload = {
        type: 'g8t',
        input,
        language,
        profiles: ['9']
    };

    try {
        const { data: trial } = await http.post(requestUrl, payload);

        const { data: result } = await http.get(`${requestUrl}/${trial.id}/sandbox-result`);

        // Gets the key of the higher score from the result
        const resultTypeId =
            Object.keys(result).reduce((a, b) =>
                result[a] >= result[b]
                    ? a
                    : b
            );

        return {
            rawResult: result,
            resultTypeId
        };
    } catch (e) {
        throw new functions.https.HttpsError('unknown', e.toString());

    }
});
