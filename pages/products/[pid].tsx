import { useRouter } from "next/router";
import ErrorMessage from "../../components/error";
import ProductForm from "../../components/form";
import Loading from "../../components/loading";
import { useProductInfo, useProductList } from "../../lib/hooks";
import { FormData } from "../../types";

const ProductInfo = () => {
  const router = useRouter();
  const pid = Number(router.query?.pid);
  const { isError, isLoading, list = [], mutateList } = useProductList();
  const { isLoading: isInfoLoading, product } = useProductInfo(pid);
  console.log("product", product);

  const { description, is_visible: isVisible, name, price, type, metafields } = product ?? {};
  const formData = { description, isVisible, name, price, type, metafields };

  const handleCancel = () => router.push("/products");

  const handleSubmit = async (data: FormData, selectedLocale: string) => {
    try {
      data.locale = selectedLocale;

      // Update product details
      const updateProduct = await fetch(`/api/products/${pid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // router.push("/products");
    } catch (error) {
      console.error("Error updating the product: ", error);
    }
  };

  if (isLoading || isInfoLoading) return <Loading />;
  if (isError) return <ErrorMessage />;

  return (
    <ProductForm formData={formData} onCancel={handleCancel} onSubmit={handleSubmit} />
  );
};

export default ProductInfo;
