function evaluate(answers) {
    const questions = {
        "ei": [
            "q1",
            "q8",
            "q15",
            "q22",
            "q29",
            "q36",
            "q43",
            "q50",
            "q57",
            "q64"
        ],
        "sn": [
            "q2",
            "q9",
            "q16",
            "q23",
            "q30",
            "q37",
            "q44",
            "q51",
            "q58",
            "q65",
            "q3",
            "q10",
            "q17",
            "q24",
            "q31",
            "q38",
            "q45",
            "q52",
            "q59",
            "q66"
        ],
        "tf": [
            "q4",
            "q11",
            "q18",
            "q25",
            "q32",
            "q39",
            "q46",
            "q53",
            "q60",
            "q67",
            "q5",
            "q12",
            "q19",
            "q26",
            "q33",
            "q40",
            "q47",
            "q54",
            "q61",
            "q68"
        ],
        "jp": [
            "q6",
            "q13",
            "q20",
            "q27",
            "q34",
            "q41",
            "q48",
            "q55",
            "q62",
            "q69",
            "q6",
            "q13",
            "q20",
            "q27",
            "q34",
            "q41",
            "q48",
            "q55",
            "q62",
            "q69"
        ]
    };

    const getScore = type => questions[type].reduce((score, question) => {
        return score + answers[question];
    }, 0);

    const rawResult = Object.keys(questions).reduce((scores, type) => {
        scores[type] = getScore(type);
        return scores;
    }, {});

    const resultType = Object.keys(rawResult).reduce((result, type) => {
        return result + type.charAt((rawResult[type] <= (questions[type].length / 2)) ? 0 : 1);
    }, "");

    return {
        rawResult,
        resultTypeId: `mbti-${resultType}`
    };
};
