import ProductList from "@/components/shared/product/product-list";
import sampleData from "@/db/sample-data";

const HomePage = () => {
  return (
    <>
      <ProductList
        data={sampleData.products}
        title='Featured Products'
        limit={10}
      />
    </>
  );
};

export default HomePage;
