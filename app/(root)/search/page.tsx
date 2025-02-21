// import ProductCard from "@/components/shared/product/product-card";
// import { Button } from "@/components/ui/button";
// import {
//   getAllCategories,
//   getAllProducts,
// } from "@/lib/actions/product-actions";
// import Link from "next/link";

// export async function generateMetadata(props: {
//   searchParams: Promise<{
//     q: string;
//     category: string;
//     price: string;
//     rating: string;
//   }>;
// }) {
//   const {
//     q = "all",
//     category = "all",
//     price = "all",
//     rating = "all",
//   } = await props.searchParams;

//   const isQuerySet = q && q !== "all" && q.trim() !== "";
//   const isCategorySet =
//     category && category !== "all" && category.trim() !== "";
//   const isPriceSet = price && price !== "all" && price.trim() !== "";
//   const isRatingSet = rating && rating !== "all" && rating.trim() !== "";
//   if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
//     return {
//       title: `Search ${isQuerySet ? q : ""} ${isCategorySet ? category : ""} ${
//         isPriceSet ? price : ""
//       } ${isRatingSet ? rating : ""}`,
//     };
//   } else {
//     return {
//       title: "Search Products",
//     };
//   }
// }

// const sortOrders = ["newest", "lowest", "highest", "rating"];
// const ratings = [4, 3, 2, 1];
// const prices = [
//   {
//     name: "$1 to $50",
//     value: "1-50",
//   },
//   {
//     name: "$51 to $100",
//     value: "51-100",
//   },
//   {
//     name: "$101 to $200",
//     value: "101-200",
//   },
//   {
//     name: "$201 to $500",
//     value: "201-500",
//   },
//   {
//     name: "$501 to $1000",
//     value: "501-1000",
//   },
// ];

// const SearchPage = async (props: {
//   searchParams: Promise<{
//     q?: string;
//     category?: string;
//     price?: string;
//     rating?: string;
//     sort?: string;
//     page?: string;
//   }>;
// }) => {
//   const {
//     q = "all",
//     category = "all",
//     price = "all",
//     rating = "all",
//     sort = "newest",
//     page = "1",
//   } = await props.searchParams;

//   //Construct filter url
//   const getFilterUrl = ({
//     c,
//     p,
//     s,
//     r,
//     pg,
//   }: {
//     c?: string;
//     p?: string;
//     s?: string;
//     r?: string;
//     pg?: string;
//   }) => {
//     const params = { q, category, price, rating, sort, page };

//     if (c) params.category = c;
//     if (p) params.price = p;
//     if (s) params.sort = s;
//     if (r) params.rating = r;
//     if (pg) params.page = pg;

//     return `/search?${new URLSearchParams(params).toString()}`;
//   };

//   const products = await getAllProducts({
//     query: q,
//     category,
//     price,
//     rating,
//     sort,
//     page: Number(page),
//   });

//   const categories = await getAllCategories();

//   return (
//     <div className='grid md:grid-cols-5 md:gap-5'>
//       <div className='filter-links'>
//         {/* Category Links */}
//         <div className='text-xl mb-2 mt-3'>Department</div>
//         <div>
//           <ul className='space-y-1'>
//             <li>
//               <Link
//                 className={`${(category === "All" || category) && "font-bold"}`}
//                 href={getFilterUrl({ c: "all" })}
//               >
//                 Any
//               </Link>
//             </li>
//             {categories.map((e) => (
//               <li key={e.category}>
//                 <Link
//                   href={getFilterUrl({ c: e.category })}
//                   className={`${category === e.category && "font-bold"}`}
//                 >
//                   {e.category}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </div>
//         {/* Price Links */}
//         <div className='text-xl mb-2 mt-8'>Price</div>
//         <div>
//           <ul className='space-y-1'>
//             <li>
//               <Link
//                 className={`${price === "All" && "font-bold"}`}
//                 href={getFilterUrl({ p: "all" })}
//               >
//                 Any
//               </Link>
//             </li>
//             {prices.map((e) => (
//               <li key={e.value}>
//                 <Link
//                   href={getFilterUrl({ p: e.value })}
//                   className={`${price === e.value && "font-bold"}`}
//                 >
//                   {e.name}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </div>
//         {/* Ratings Links */}
//         <div className='text-xl mb-2 mt-8'>Customer Ratings</div>
//         <div>
//           <ul className='space-y-1'>
//             <li>
//               <Link
//                 className={`${rating === "All" && "font-bold"}`}
//                 href={getFilterUrl({ r: "all" })}
//               >
//                 Any
//               </Link>
//             </li>
//             {ratings.map((e) => (
//               <li key={e}>
//                 <Link
//                   href={getFilterUrl({ r: `${e}` })}
//                   className={`${rating === e.toString() && "font-bold"}`}
//                 >
//                   {`${e} stars & up`}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//       <div className='md:col-span-4 space-y-4'>
//         <div className='flex-between flex-col my-4 md:flex-row'>
//           <div className='flex items-center'>
//             {q !== "all" && q !== "" && <span>Query: {q}</span>}
//             {category !== "all" && category !== "" && (
//               <span> Category: {category}</span>
//             )}
//             {price !== "all" && price !== "" && <span> Price: {price}</span>}
//             {rating !== "all" && rating !== "" && (
//               <span> Rating: {rating} & up</span>
//             )}
//             {(q !== "all" && q !== "") ||
//             (category !== "all" && category !== "") ||
//             rating !== "all" ||
//             price !== "all" ? (
//               <Button variant='link' asChild>
//                 <Link href='/search'>Clear</Link>
//               </Button>
//             ) : null}
//           </div>
//           <div>
//             {/* Sort */}
//             Sort by{" "}
//             {sortOrders.map((e) => (
//               <Link
//                 key={e}
//                 className={`mx-2 ${sort == e && "font-bold"}`}
//                 href={getFilterUrl({ s: e })}
//               >
//                 {e}
//               </Link>
//             ))}
//           </div>
//         </div>
//         <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
//           {products.data.length === 0 && <div>No products found</div>}
//           {products.data.map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SearchPage;
import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import {
  getAllCategories,
  getAllProducts,
} from "@/lib/actions/product-actions";
import Link from "next/link";

// Types for search parameters
interface SearchParams {
  q?: string;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
  page?: string;
}

// Generate metadata for the page
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
  } = searchParams;

  const isQuerySet = q !== "all" && q.trim() !== "";
  const isCategorySet = category !== "all" && category.trim() !== "";
  const isPriceSet = price !== "all" && price.trim() !== "";
  const isRatingSet = rating !== "all" && rating.trim() !== "";

  const titleParts = [
    isQuerySet ? q : "",
    isCategorySet ? category : "",
    isPriceSet ? price : "",
    isRatingSet ? rating : "",
  ].filter(Boolean);

  return {
    title: titleParts.length
      ? `Search ${titleParts.join(" ")}`
      : "Search Products",
  };
}

// Constants for sorting, ratings, and prices
const SORT_ORDERS = ["newest", "lowest", "highest", "rating"];
const RATINGS = [4, 3, 2, 1];
const PRICES = [
  { name: "$1 to $50", value: "1-50" },
  { name: "$51 to $100", value: "51-100" },
  { name: "$101 to $200", value: "101-200" },
  { name: "$201 to $500", value: "201-500" },
  { name: "$501 to $1000", value: "501-1000" },
];

// Helper function to generate filter URLs
const getFilterUrl = (
  baseParams: SearchParams,
  newParams: { c?: string; p?: string; s?: string; r?: string; pg?: string }
) => {
  const params = { ...baseParams };

  if (newParams.c) params.category = newParams.c;
  if (newParams.p) params.price = newParams.p;
  if (newParams.s) params.sort = newParams.s;
  if (newParams.r) params.rating = newParams.r;
  if (newParams.pg) params.page = newParams.pg;

  return `/search?${new URLSearchParams(params).toString()}`;
};

// Reusable component for filter links
const FilterLinks = ({
  title,
  items,
  currentValue,
  paramKey,
  baseParams,
}: {
  title: string;
  items: { name: string; value: string }[];
  currentValue: string;
  paramKey: "c" | "p" | "r";
  baseParams: SearchParams;
}) => (
  <div>
    <div className='text-xl mb-2 mt-8'>{title}</div>
    <ul className='space-y-1'>
      <li>
        <Link
          className={`${currentValue === "all" && "font-bold"}`}
          href={getFilterUrl(baseParams, { [paramKey]: "all" })}
        >
          Any
        </Link>
      </li>
      {items.map((item) => (
        <li key={item.value}>
          <Link
            href={getFilterUrl(baseParams, { [paramKey]: item.value })}
            className={`${currentValue === item.value && "font-bold"}`}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

// Main SearchPage component
const SearchPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = searchParams;

  const baseParams = { q, category, price, rating, sort, page };

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    page: Number(page),
  });

  const categories = await getAllCategories();

  return (
    <div className='grid md:grid-cols-5 md:gap-5'>
      <div className='filter-links'>
        {/* Category Links */}
        <FilterLinks
          title='Department'
          items={categories.map((cat) => ({
            name: cat.category,
            value: cat.category,
          }))}
          currentValue={category}
          paramKey='c'
          baseParams={baseParams}
        />

        {/* Price Links */}
        <FilterLinks
          title='Price'
          items={PRICES}
          currentValue={price}
          paramKey='p'
          baseParams={baseParams}
        />

        {/* Ratings Links */}
        <FilterLinks
          title='Customer Ratings'
          items={RATINGS.map((r) => ({
            name: `${r} stars & up`,
            value: r.toString(),
          }))}
          currentValue={rating}
          paramKey='r'
          baseParams={baseParams}
        />
      </div>

      <div className='md:col-span-4 space-y-4'>
        <div className='flex-between flex-col my-4 md:flex-row'>
          <div className='flex items-center'>
            {q !== "all" && q !== "" && <span>Query: {q}</span>}
            {category !== "all" && category !== "" && (
              <span> Category: {category}</span>
            )}
            {price !== "all" && price !== "" && <span> Price: {price}</span>}
            {rating !== "all" && rating !== "" && (
              <span> Rating: {rating} & up</span>
            )}
            {(q !== "all" && q !== "") ||
            (category !== "all" && category !== "") ||
            rating !== "all" ||
            price !== "all" ? (
              <Button variant='link' asChild>
                <Link href='/search'>Clear</Link>
              </Button>
            ) : null}
          </div>

          <div>
            Sort by{" "}
            {SORT_ORDERS.map((order) => (
              <Link
                key={order}
                className={`mx-2 ${sort === order && "font-bold"}`}
                href={getFilterUrl(baseParams, { s: order })}
              >
                {order}
              </Link>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {products.data.length === 0 ? (
            <div>No products found</div>
          ) : (
            products.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
