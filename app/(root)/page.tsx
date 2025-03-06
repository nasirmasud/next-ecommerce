import DealCountdown from "@/components/deal-countdown";
import IconBoxes from "@/components/icon-boxes";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import ViewAllProductButton from "@/components/view-all-product-button";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product-actions";

const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();
  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts} title='Featured Products' limit={10} />
      <ViewAllProductButton />
      <DealCountdown />
      <IconBoxes />
    </>
  );
};

export default HomePage;
