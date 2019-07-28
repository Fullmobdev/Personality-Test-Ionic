// Used in production env
export const environment = {
    firebaseConfig: {
        apiKey: 'AIzaSyADWand97AUYWmiYpjbLnIyyRg7mk-OPRs',
        authDomain: 'findyourtribe-app.firebaseapp.com',
        databaseURL: 'https://findyourtribe-app.firebaseio.com',
        projectId: 'findyourtribe-app',
        storageBucket: 'findyourtribe-app.appspot.com',
        messagingSenderId: '753326959383',
        webClientId: '753326959383-cotpvvfjck2aq2fn8pm312qcbf5i1cbi.apps.googleusercontent.com',
        algoliaConfig: {
            apiKey: 'ba3d72f1afde908622f70db25269370a',
            appId: 'OK5NS4GWN4',
            indexName: 'profiles',
            routing: true
        }
    },
    facebookConfig: {
        appId: '332788547346916',
        appName: 'FYT'
    },
    newsFeed: {
        url: 'https://wp.fyt.one/wp-json/wp/v2/posts?_embed'
    },
    defaultTestId: 'big5'
};
