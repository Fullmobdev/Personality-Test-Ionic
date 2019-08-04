function evaluate(answers) {
    const maxScores = {
        d: 55,
        i: 60,
        s: 60,
        c: 60
    };
    const questions = {
        d: [
            "q1","q2","q3","q4","q5","q6","q7","q26","q27","q28","q29"
        ],
        i: [
            "q16","q17","q18","q19","q20","q30","q31","q32","q33","q34","q35","q36"
        ],
        s: [
            "q8","q9","q10","q11","q12","q13","q14","q15","q21","q37","q38","q39"
        ],
        c: [
            "q22","q23","q24","q25","q40","q41","q42","q43","q44","q45","q46","q47"
        ]
    };

    const getScore = type => (questions[type].reduce((score, question) => {
        return score + answers[question];
    }, 0) / maxScores[type]);

    const rawResult = Object.keys(questions).reduce((scores, type) => {
        scores[type] = getScore(type);
        return scores;
    }, {});

    const rankedTraits = Object.keys(rawResult).map(key => {
        return {
            trait: key,
            value: rawResult[key]
        }
    });
    rankedTraits.sort((a, b) => {
        return a.value - b.value;
    });
    const first = rankedTraits.pop().trait;
    const second = rankedTraits.pop().trait;


    return {
        rawResult,
        resultTypeId: `disc-${first}${second}`
    };
}
