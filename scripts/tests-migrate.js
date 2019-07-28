#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const admin = require('firebase-admin');
const program = require('commander');
const babel = require('@babel/core');
const UUID = require('uuid-v4');
const __ROOT_PATH__ = 'personality-tests';
const csvParse = require('csv-parse/lib/sync');
const _ = require('lodash');

const fileResolver = dir => (filename, rootPath = __ROOT_PATH__) =>
    path.resolve(`${rootPath}/${dir}/${filename}`);

const dirResolver = () => (dir, rootPath = __ROOT_PATH__) =>
    path.resolve(`${rootPath}/${dir}`);

const getResultTypes = async currentTestDir => {
    return await fs.readJSON(currentTestDir('results.json'));
};

const getEvaluationFn = async currentTestDir => {
    const evaluateBuffer = await fs.readFile(currentTestDir('evaluation.js'));

    return babel.transform(evaluateBuffer.toString(), {
        presets: ['@babel/preset-env', 'minify']
    }).code;
};

const getTestDoc = async currentTestDir => {
    const test = await fs.readJSON(currentTestDir('test.json'));

    const evaluate = test.type === 'internal'
        ? await getEvaluationFn(currentTestDir)
        : test.evaluate;

    return { ...test, evaluate };
};


const exportAction = async (testId, cmd) => {
    const configPath = cmd.config;

    if (!configPath) {
        throw new Error('No path for the configuration file provided');
    }

    const { databaseURL, serviceAccount, storageBucket } = await fs.readJSON(path.resolve(configPath));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL,
        storageBucket
    });

    const store = admin.firestore();
    const storage = admin.storage();
    store.settings({ timestampsInSnapshots: true });

    const force = cmd.force;
    const currentTestDir = fileResolver(testId);

    try {

        const bucket = storage.bucket();
        const pictureFile = bucket.file(`testPictures/${testId}.jpg`);
        let newPictureUrl;
        const pictureExists = (await pictureFile.exists())[0];
        if (!pictureExists || force) {
            console.log('Uploading picture');
            let uuid = UUID();
            await bucket.upload(currentTestDir('picture.jpg'), {
                destination: pictureFile,
                metadata: {
                    metadata: {
                        firebaseStorageDownloadTokens: uuid
                    }
                }
            });

            newPictureUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(pictureFile.name)}?alt=media&token=${uuid}`;
        }

        const doc = await getTestDoc(currentTestDir);

        if (newPictureUrl) {
            doc.pictureUrl = newPictureUrl;
        }

        const docRef = store
            .collection('tests')
            .doc(testId);

        if ((await docRef.get()).exists) {
            await docRef.update(doc);
        } else {
            docRef.set(doc);
        }

        const resultTypes = await getResultTypes(currentTestDir);

        if (!!resultTypes) {
            const resultTypeCollection = store
                .collection('resultTypes');

            const resultTypesBatch = store.batch();

            Object.keys(resultTypes).forEach(resultType => {
                const ref = resultTypeCollection.doc(resultType);
                resultTypesBatch.set(ref, {
                    ...resultTypes[resultType],
                    testId: testId
                });
            });

            await resultTypesBatch.commit();
        }
        console.log(`Successfully migrated test '${testId}' to Firebase`);
    } catch (error) {
        console.log(error);
    }
};

const importResultsCsvAction = async (file, cmd) => {

    const filePath = path.resolve(file);

    const resultTypesBuffer = await fs.readFile(filePath);

    const resultTypes = csvParse(resultTypesBuffer.toString(), {
        columns: true
    });

    const groupedByTest = _.groupBy(resultTypes, (item) => item['testId']);

    Object.keys(groupedByTest).forEach(test => {
        const resolveDir = dirResolver();
        const resolveFile = fileResolver(test);
        const target = resolveFile('results.json');

        const resultTypes = groupedByTest[test].reduce((types, type) => {
            const result = {
                personalityType: {
                    en: type['personalityType_en'],
                    de: type['personalityType_de'],
                },
                traits: (type['traits'].length > 0) ? type['traits'].split(',') : [],
                shortDescription: {
                    en: type['shortDescription_en'],
                    de: type['shortDescription_de'],
                },
                longDescription: {
                    en: type['longDescription_en'],
                    de: type['longDescription_de'],
                },
                do: {
                    en: type['do_en'],
                    de: type['do_de'],
                },
                dont: {
                    en: type['dont_en'],
                    de: type['dont_de'],
                },
            };
            if (type['roleName_en']) {
                result['roleName'] = {
                    en: type['roleName_en'],
                    de: type['roleName_de'],
                }
            }
            types[type['resultTypeId']] = result;
            return types;
        }, {});

        fs.ensureDir(resolveDir(test)).then(() => {
            return fs.writeJson(target, resultTypes, { spaces: 4 });
        })
    });

};

program
    .version('0.0.1')
    .description('CLI Tool to migrate app tests to Firebase');

program
    .command('export <id>')
    .option('-c, --config <config>', 'path to the configuration file')
    .option('-f, --force', 'Force overwrite')
    .description('Exports test with id <id> to Firebase')
    .action(exportAction);

program
    .command('import-results-csv <file>')
    .description('Imports the CSV at <file> into the project')
    .action(importResultsCsvAction);

program.parse(process.argv);
