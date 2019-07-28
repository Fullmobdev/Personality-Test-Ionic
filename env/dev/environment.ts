// Used in dev environment
export const environment = {
    firebaseConfig: {
        apiKey: 'AIzaSyChlABYKs8oKoi62GD5RlDo8wpmnW4ybKc',
        authDomain: 'findyourtribe-development.firebaseapp.com',
        databaseURL: 'https://findyourtribe-development.firebaseio.com',
        projectId: 'findyourtribe-development',
        storageBucket: 'findyourtribe-development.appspot.com',
        messagingSenderId: '573371402331',
        webClientId: '573371402331-3k2i0jfecg50722d77csbb8mtefiqni2.apps.googleusercontent.com',
        algoliaConfig: {
            apiKey: '66c6dd583a033cc9e02e74370726f139',
            appId: 'W027CLTGXO',
            indexName: 'profiles',
            routing: true
        }
    },
    facebookConfig: {
        appId: '900452890138692',
        appName: 'fyt-app'
    },
    newsFeed: {
        url: 'https://wp.fyt.one/wp-json/wp/v2/posts?_embed'
    },
    defaultTestId: 'big5'
};
