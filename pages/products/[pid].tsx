import { useRouter } from "next/router";
import { useState } from "react";
import ErrorMessage from "@components/error";
import ProductForm from "@components/form";
import Loading from "@components/loading";
import { useProductInfo, useProductList } from "@lib/hooks";
import { alertsManager } from "@pages/_app";
import { FormData } from "@types";

const ProductInfo = () => {
  const router = useRouter();
  const pid = Number(router.query?.pid);
  const { error, isLoading, list = [], mutateList } = useProductList();
  const { isLoading: isProductInfoLoading, error: hasProductInfoLoadingError, product } = useProductInfo(pid, list);
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
      }).finally(() => {
        setProductSaving(false);

        alertsManager.add({
          autoDismiss: true,
          messages: [
            {
              text: 'Product translations have been saved.',
            },
          ],
          type: 'success',
        })
      });
    } catch (error) {
      //display error
      console.error("Error updating the product: ", error);
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
