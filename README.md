# NextJS Sample App

This demo includes all of the files necessary to get started with a basic, hello world app. This app was built using NextJS, BigDesign, Typescript, and React.

## Overview
A basic admin app that exposes metafields which can be used to store translated strings.


## General App Installation

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/bigcommerce/sample-app-nodejs)

To get the app running locally, follow these instructions:

1. [Use Node 10+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#checking-your-version-of-npm-and-node-js)
2. Install npm packages
    - `npm install`
3. [Add and start ngrok.](https://www.npmjs.com/package/ngrok#usage) Note: use port 3000 to match Next's server.
    - `npm install ngrok`
    - `ngrok http 3000`
4. [Register a draft app.](https://developer.bigcommerce.com/api-docs/apps/quick-start#register-a-draft-app)
     - For steps 5-7, enter callbacks as `'https://{ngrok_id}.ngrok.io/api/{auth||load||uninstall}'`. 
     - Get `ngrok_id` from the terminal that's running `ngrok http 3000`.
     - e.g. auth callback: `https://12345.ngrok.io/api/auth`
5. Copy .env-sample to `.env`.
     - If deploying on Heroku, skip `.env` setup.  Instead, enter `env` variables in the Heroku App Dashboard under `Settings -> Config Vars`.
6. [Replace client_id and client_secret in .env](https://devtools.bigcommerce.com/my/apps) (from `View Client ID` in the dev portal).
7. Update AUTH_CALLBACK in `.env` with the `ngrok_id` from step 5.
8. Enter a cookie name, as well as a jwt secret in `.env`.
    - The cookie name should be unique
    - JWT key should be at least 32 random characters (256 bits) for HS256
9. Specify DB_TYPE in `.env`
    - If using Firebase, enter your firebase config keys. See [Firebase quickstart](https://firebase.google.com/docs/firestore/quickstart)
    - If using MySQL, enter your mysql database config keys (host, database, user/pass and optionally port). Note: if using Heroku with ClearDB, the DB should create the necessary `Config Var`, i.e. `CLEARDB_DATABASE_URL`.
10. Start your dev environment in a **separate** terminal from `ngrok`. If `ngrok` restarts, update callbacks in steps 4 and 7 with the new ngrok_id.
    - `npm run dev`
11. [Install the app and launch.](https://developer.bigcommerce.com/api-docs/apps/quick-start#install-the-app)

## Setting available locales

Update the `availableLocales` array in `lib/constants.ts`: 

```
[
  {
    code: 'en', // The locale code
    label: 'English', // The label that will be used in the UI
  },
  ...
]
```

## Setting default catalog locale

Update the `defaultLocale` variable in `lib/constants.ts` from `en` to the default locale of your catalog.

## Changing which product fields are available to translate

Update the `translatableProductFields` array in `lib/constants.ts`;

Each array object contains:
```
[
  {
    key: 'description', // The product field name
    label: 'Description', // The label that will be shown in the UI
    type: 'textarea', // The type of input that will be used in the UI (input, textarea)
    required: true, // If the field is required or not (true, false)
  },
  ...
]
```
