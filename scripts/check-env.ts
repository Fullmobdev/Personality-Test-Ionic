require('dotenv').config();

function checkEnvironment() {
    if(process.env.CURRENT_ENV) {
        process.exit(0);
    }
    process.exit(1);
}

checkEnvironment();
