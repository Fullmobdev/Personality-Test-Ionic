function evaluate(answers) {
    const rawResult = {
        extroverted: 5 - answers['q1'] + answers['q6'],
        agreeable: 5 - answers['q7'] + answers['q2'],
        conscientious: 5 - answers['q3'] + answers['q8'],
        neurotic: 5 - answers['q9'] + answers['q4'],
        open: 5 - answers['q10'] + answers['q5']
    };

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
        resultTypeId: `big5-${first}_${second}`
    };
}
