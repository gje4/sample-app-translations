import { useRouter } from "next/router";
import ErrorMessage from "../../components/error";
import Form from "../../components/form";
import Loading from "../../components/loading";
import { useProductInfo, useProductList } from "../../lib/hooks";
import { FormData } from "../../types";

const ProductInfo = () => {
  const router = useRouter();
  const pid = Number(router.query?.pid);
  const { isError, isLoading, list = [], mutateList } = useProductList();
  const { isLoading: isInfoLoading, product, metafields } = useProductInfo(
    pid,
    list
  );
  console.log("product", product);
  console.log("metafields", metafields);

  const { description, is_visible: isVisible, name, price, type } =
    product ?? {};
  const formData = { description, isVisible, name, price, type, metafields };

  const handleCancel = () => router.push("/products");

  const handleSubmit = async (data: FormData) => {
    try {
      console.log("data 1", data);

      const filteredList = list.filter((item) => item.id !== pid);
      // Update local data immediately (reduce latency to user)
      mutateList([...filteredList, { ...product, ...data }], false);
      console.log("data 2", data);

      // Update product details
      await fetch(`/api/products/${pid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Refetch to validate local data
      mutateList();

      router.push("/products");
    } catch (error) {
      console.error("Error updating the product: ", error);
    }
  };

  if (isLoading || isInfoLoading) return <Loading />;
  if (isError) return <ErrorMessage />;

  return (
    <Form formData={formData} onCancel={handleCancel} onSubmit={handleSubmit} />
  );
};

export default ProductInfo;
