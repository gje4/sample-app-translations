# BigCommerce Product Translation via Metafields
### Sample Admin App

<img width="1904" alt="README-screenshot" src="https://user-images.githubusercontent.com/2677921/121815727-ce3f5980-cc45-11eb-84ac-3bf62195256d.png">

This is a BigCommerce admin app that enables easy editing of locale specific metafields, which can be queried via REST or GraphQL APIs later (examples below) to enable custom multilingual storefront experiences. Built using NextJS, BigDesign, Typescript, and React. Additional locales and product fields can be added via constants in `lib/constants.ts` (docs below).

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

## Fetching a Product's Locale Metafields via APIs

_Examples using `es` as the locale:_

**REST**

Endpoint:
`GET /catalog/products/170/metafields?namespace=es`

Result:
```
[
    {
        "id": 79,
        "key": "name", // This is matched to the product field key
        "value": "Pantalón deportivo unisex tipo jogger",
        "namespace": "es",
        "permission_set": "write_and_sf_access",
        "resource_type": "product",
        "resource_id": 170,
        "description": "",
        "date_created": "2020-10-20T02:10:40+00:00",
        "date_modified": "2021-06-05T07:18:49+00:00"
    },
    ...
]
```

Go here for more info on the Product Metafield endpoints: https://developer.bigcommerce.com/api-reference/store-management/catalog/product-metafields/getproductmetafieldsbyproductid

**GraphQL**

Endpoint: 
`POST https://{bigcommerce_storefront_domain}.com/graphql`

Query:
```
query metafields {
  site {
    products(entityIds: [170]) {
      edges {
        node {
          metafields(namespace: "es") {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
    }
  }
}
```

Result:
```
{
	"data": {
		"site": {
			"products": {
				"edges": [{
					"node": {
						"metafields": {
							"edges": [{
									"node": {
										"key": "name",
										"value": "Pantalón deportivo unisex tipo jogger"
									}
								},
                ...
							]
						}
					}
				}]
			}
		}
	}
}
```

Go here for more info on the GraphQL API: https://developer.bigcommerce.com/api-docs/storefront/graphql/graphql-storefront-api-overview

## Surfacing translations within the Cart, Checkout, Orders and Notification Emails

When creating the cart, you can pass in the locale specific string obtained by one of the above API methods into `line_items[x].name`, `line_items[x].option_selections.name`, and `line_items[x].option_selections.value` to override the base catalog's product name and option name / value strings. You can also set the value of `locale` on the cart in the format of `xx` or `xx-YY`.

These values on the cart will be respected in the Checkout and Order flows, including being stored on the Order alongside the original catalog data and utilized when emails are sent to the shopper, if you are using BigCommerce's built-in email notifications.

Note this capability is not strictly for this approach to translation using metafields. It can also be used when using Channel Listings, a Headless CMS, or API-centric translation services to manage your multilingual data.
