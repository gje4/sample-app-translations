import { useState } from "react";
import { useRouter } from "next/router";
import ErrorMessage from "@components/error";
import ProductForm from "@components/form";
import Loading from "@components/loading";
import { useProductInfo, useProductList } from "@lib/hooks";
import { FormData } from "@types";
import { alertsManager } from "@pages/_app";

const ProductInfo = () => {
  const router = useRouter();
  const pid = Number(router.query?.pid);
  const { isLoading: isProductInfoLoading, isError: hasProductInfoLoadingError, product } = useProductInfo(pid);
  const { description, is_visible: isVisible, name, metafields } = product ?? {};
  const formData = { description, isVisible, name, metafields };
  const [ isProductSaving, setProductSaving ] = useState(false);

  const handleCancel = () => router.push("/");

  const handleSubmit = (data: FormData, selectedLocale: string) => {
    try {
      data.locale = selectedLocale;
      // Update product details
      setProductSaving(true);

      fetch(`/api/products/${pid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      .then((res) => {
        setProductSaving(false);

        if (res.status === 200) {
          alertsManager.add({
            autoDismiss: true,
            messages: [
              {
                text: 'Product translations have been saved.',
              },
            ],
            type: 'success',
          })
        } else if (res.status === 403) {
          alertsManager.add({
            autoDismiss: true,
            messages: [
              {
                text: 'Error updating product translations: Metafield limit exceeded',
              },
            ],
            type: 'error',
          })
        } else {
          alertsManager.add({
            autoDismiss: true,
            messages: [
              {
                text: 'Error updating product translations',
              },
            ],
            type: 'error',
          })
        }
      });
    } catch (error) {
      //display error
      console.error("Error updating product translations: ", error);
      alertsManager.add({
        autoDismiss: true,
        messages: [
          {
            text: `Error updating product translations: ${error}`,
          },
        ],
        type: 'error',
      })
      setProductSaving(false);
    }
  };

  if (hasProductInfoLoadingError) return <ErrorMessage />;

  return (
    <Loading isLoading={isProductInfoLoading}>
      <ProductForm
        formData={formData}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        isSaving={isProductSaving}
      />
    </Loading>
  );
};

export default ProductInfo;
