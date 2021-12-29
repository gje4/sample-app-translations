import { NextApiRequest, NextApiResponse } from "next";
import { bigcommerceClient, getSession } from "@lib/auth";
import { defaultLocale, translatableProductFields } from "@lib/constants";

const getMetafieldId = (metafields: any, fieldName: string, locale: string) => {
  const filteredFields = metafields.filter((meta) => meta.namespace === locale && meta.key === fieldName);
  return filteredFields[0]?.id;
}

export default async function products(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    body,
    query: { pid },
    method,
  } = req;
  switch (method) {
    case "GET":
      try {
        const { accessToken, storeHash } = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash);
        const { data: productData } = await bigcommerce.get(`/catalog/products/${pid}`);
        
        // GraphQL Admin API
        let myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-Auth-Token", `${accessToken}`);
        myHeaders.append("Accept-Encoding", "application/gzip");

        const graphql = JSON.stringify({
          query: `query {
                    store {
                      metafields(filters: {resourceType:PRODUCT, resourceIds:[${pid}]}) {
                          edges {
                              node {
                                  key
                                  value
                                  namespace
                            }
                      }
                  }
              }
          }`,
          variables: {}
        });

        const requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: graphql,
          redirect: 'follow'
        };
        
        const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/graphql`, requestOptions);
        if (!response.ok) throw new Error('[pid.tsx ERROR]: Cannot fetch from requested API product resource');

        const json = await response.json();
        const metafields = json.data.store.metafields.edges.map(edge => edge.node);
        const product = {
          ...productData,
          metafields
        };

        res.status(200).json(product);
      } catch (error) {
        const { message, response } = error;
        res
          .status(response?.status || 500)
          .end(message || "Authentication failed, please re-install");
      }
      break;
    case "PUT":
      try {
        let result:any
        const { accessToken, storeHash } = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash);

        if (body['locale'] && body.locale !== defaultLocale) {
          // This is for a localization, so create / update metafields
          const selectedLocale = body.locale;
          const { data: existingMetafields } = await bigcommerce.get(`/catalog/products/${pid}/metafields`);

          for (const productField of translatableProductFields) {
            let metafieldResults = [];
            const existingMetafieldId = getMetafieldId(existingMetafields, productField.key, selectedLocale);
            const metafieldValue = body[productField.key];

            if (existingMetafieldId) {
              // Update the metafield
              const { data } = await bigcommerce.put(
                `/catalog/products/${pid}/metafields/${existingMetafieldId}`,
                {
                  value: metafieldValue,
                }
              );
              metafieldResults.push(data);
            } else {
              // Create the metafield, but only if there is a value (metafields cannot be created with empty values)
              if (metafieldValue !== '') {
                const { data } = await bigcommerce.post(
                  `/catalog/products/${pid}/metafields`,
                  {
                    key: productField.key,
                    value: metafieldValue,
                    namespace: selectedLocale,
                    permission_set: 'write_and_sf_access',
                  }
                );
                metafieldResults.push(data);
              }
            }

            const result = metafieldResults;
          }
        } else {
          // This is for the default lang, so update the main product
          const { data: updatedProduct } = await bigcommerce.put(
            `/catalog/products/${pid}`,
            body
          );
          const result = updatedProduct;
        }

        res.status(200).json(result);
      } catch (error) {
        const { message, response } = error;
        res
          .status(response?.status || 500)
          .end(message || "Authentication failed, please re-install");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
