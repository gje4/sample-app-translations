import { NextApiRequest, NextApiResponse } from "next";
import { bigcommerceClient, getSession } from "@lib/auth";
import { defaultLocale, translatableProductFields } from "@lib/constants";

const getConciseMetafields = (metafields: any) => {
  if (metafields.length === 0) return [];

  // return concise metafields object and decode json
  const conciseMetafields = metafields.find(meta => meta.key === 'multilingual_metafields');

  if(conciseMetafields?.value) {
    return JSON.parse(conciseMetafields?.value);
  } else {
    return [];
  }
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
  const { useConciseMetafieldStorage } = body;
  const getMetafieldId = (metafields: any, fieldName?: string, locale?: string) => {
    if(useConciseMetafieldStorage) {
      const conciseMetafields = metafields?.find(meta => meta.key === 'multilingual_metafields');
      return conciseMetafields?.id;
    } else {
      const filteredFields = metafields.filter((meta) => meta.namespace === locale && meta.key === fieldName);
      return filteredFields[0]?.id;
    }
  }

  switch (method) {
    case "GET":
      try {
        const { accessToken, storeHash } = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash);

        const { data: productData } = await bigcommerce.get(`/catalog/products/${pid}`);
        const { data: metafieldsData } = await bigcommerce.get(`/catalog/products/${pid}/metafields`);

        productData.metafields = metafieldsData;

        res.status(200).json(productData);
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
        const { data: { default_shopper_language: defaultStoreLocale = defaultLocale}} = await bigcommerce.get('/settings/store/locale');

        if (body['locale'] && body.locale !== defaultStoreLocale) {

          // This is for a localization, so create / update metafields
          const selectedLocale = body.locale;
          const { data: existingMetafields = [] } = await bigcommerce.get(`/catalog/products/${pid}/metafields`);

          if(useConciseMetafieldStorage) {
            let metafieldResults = [];
            const existingMetafieldId = getMetafieldId(existingMetafields);

            const conciseMetafields = getConciseMetafields(existingMetafields);
            let updatedMetafields = conciseMetafields;

            console.log('concise metafields: ', conciseMetafields);

            for (const productField of translatableProductFields) {
              const metafieldValue = body[productField.key];

              console.log('metafield value: ', metafieldValue);

              const existingConciseMetafield = conciseMetafields?.find(
                (meta) => meta.key === productField.key && meta.namespace === selectedLocale
              );

              if(existingConciseMetafield) {
                // Mutate existing concise metafields that are being updated
                updatedMetafields = updatedMetafields
                  ?.filter(meta => meta.value !== '')
                  ?.map(meta => {
                    if(meta.key === productField.key && meta.namespace === selectedLocale) {
                      return {
                        key: productField.key,
                        namespace: selectedLocale,
                        value: metafieldValue,
                        permission_set: 'write_and_sf_access',
                      };
                    } else {
                      return meta;
                    }
                });
              } else if(metafieldValue !== '') {
                updatedMetafields.push({
                  key: productField.key,
                  namespace: selectedLocale,
                  value: metafieldValue,
                  permission_set: 'write_and_sf_access',
                });
              }
            }

            console.log('updated metafields: ', updatedMetafields);

            // Check if parent concise metafield exists
            if (existingMetafieldId) {
              // Update the metafield
              const { data } = await bigcommerce.put(
                `/catalog/products/${pid}/metafields/${existingMetafieldId}`,
                {
                  value: JSON.stringify(updatedMetafields),
                }
              );

              metafieldResults.push(data);
            } else {
              const { data } = await bigcommerce.post(
                `/catalog/products/${pid}/metafields`,
                {
                  key: 'multilingual_metafields',
                  value: JSON.stringify(updatedMetafields),
                  namespace: 'concise_format',
                  permission_set: 'write_and_sf_access',
                }
              );
              metafieldResults.push(data);
            }
            
            console.log('product api results: ', metafieldResults);

          } else {
            for (const productField of translatableProductFields) {
              let metafieldResults = [];
              const existingMetafieldId = getMetafieldId(existingMetafields, productField.key, selectedLocale);
              const metafieldValue = body[productField.key];
  
              if (existingMetafieldId) {
                if(metafieldValue !== '') {
                  // Update the metafield
                  const { data } = await bigcommerce.put(
                    `/catalog/products/${pid}/metafields/${existingMetafieldId}`,
                    {
                      value: metafieldValue,
                    }
                  );
                  metafieldResults.push(data);
                } else {
                  // Delete the metafield
                  const { data } = await bigcommerce.delete(
                    `/catalog/products/${pid}/metafields/${existingMetafieldId}`
                  );
                  metafieldResults.push(data);
                }
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
  
              console.log('product api results: ', metafieldResults);
              const result = metafieldResults;
            }
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

        console.log(error);

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
