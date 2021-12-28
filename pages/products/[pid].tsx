import { useState } from "react";
import { useRouter } from "next/router";
import { alertsManager } from "@pages/_app";
import ErrorMessage from "@components/error";
import ProductForm from "@components/form";
import Loading from "@components/loading";
import { useProductInfo, useProductList } from "@lib/hooks";
import { FormData } from "@types";

const ProductInfo = () => {
  const router = useRouter();
  const pid = Number(router.query?.pid);
  const { isLoading: isProductInfoLoading, isError: hasProductInfoLoadingError, product } = useProductInfo(pid);
  const { description, is_visible: isVisible, name, metafields } = product ?? {};
  const formData = { description, isVisible, name, metafields };
  const [ isProductSaving, setProductSaving ] = useState(false);

  const handleCancel = () => router.push("/");

  const handleSubmit = (data: FormData, selectedLocale: string, useConciseStorage: boolean) => {
    try {
      data.locale = selectedLocale;
      data.useConciseMetafieldStorage = useConciseStorage;
      console.log('form data: ', data);

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

  const handleDelete = async (metafields: Array<any>) => {
    try {
      const options = {
        method: 'DELETE',
      };
      
      console.log('metafields to delete: ', metafields);
      
      for(let i = 0; i < metafields.length; i++) {
        const metafieldId = metafields[i].id;
        const response = await fetch(`/api/products/${pid}/metafields/${metafieldId}`, options);
      }
    
    } catch (error) {
      //display error
      console.error("Error deleting the metafields: ", error);
    }
  }

  if (hasProductInfoLoadingError) return <ErrorMessage />;

  return (
    <Loading isLoading={isProductInfoLoading}>
      <ProductForm
        formData={formData}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSaving={isProductSaving}
      />
    </Loading>
  );
};

export default ProductInfo;
