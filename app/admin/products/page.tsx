import { getAllProducts } from "@/lib/actions/product-actions";

const ProductsPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || "";
  const category = searchParams.category || "";

  const products = await getAllProducts({
    query: searchText,
    limit: 10, // or any appropriate limit value
    page,
    category,
  });

  console.log(products);

  return (
    <div className='space-y-2'>
      <div className='flex-between'>
        <h1 className='h2-bold'>Products</h1>
      </div>
    </div>
  );
};

export default ProductsPage;
