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
      console.log("PUTTING IT DOWN")
      try {
        let result:any
        const { accessToken, storeHash } = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash);
        const { data: { default_shopper_language: defaultStoreLocale = defaultLocale}} = await bigcommerce.get('/settings/store/locale');

        if (body['locale'] && body.locale !== defaultStoreLocale) {

          // This is for a localization, so create / update metafields
          const selectedLocale = body.locale;
          const { data: existingMetafields } = await bigcommerce.get(`/catalog/products/${pid}/metafields`);

          // console.log('metafields')
          // console.log(existingMetafields)

          // console.log('accesstoken')
          // console.log(accessToken)

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
        const { message, response, responseBody, code } = error;
        const errorMessage = JSON.parse(responseBody)?.title;
        console.log(errorMessage)
        res
          .status(response?.status || code || 500)
          .end(message || errorMessage || "Authentication failed, please re-install");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
