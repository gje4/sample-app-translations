import { Box, H1, HR, Button, Dropdown, Panel, Small, Table, Link as StyledLink, Form, Flex, FlexItem, Input } from '@bigcommerce/big-design';
import { MoreHorizIcon, SearchIcon } from '@bigcommerce/big-design-icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactElement, useState, useEffect } from 'react';
import ErrorMessage from '@components/error';
import Loading from '@components/loading';
import { useProductList } from '@lib/hooks';
import { TableItem } from '@types';

const Products = () => {
  const router = useRouter();
  const {
    isError,
    isLoading,
    list: productList = { data: [], meta: {}},
    page: currentPage,
    limit: itemsPerPage,
    setPage: setCurrentPage,
    setLimit: setItemsPerPage,
    setKeyword
  } = useProductList();
  const tableItems: TableItem[] = productList?.data.map(({ id, inventory_level: stock, name, price }) => ({
    id,
    name,
    price,
    stock,
  }));

  const [ itemsPerPageOptions ] = useState([5, 10, 20]);
  const [ searchInput, setSearchInput ] = useState('');

  const onItemsPerPageChange = (newRange) => {
    setCurrentPage(1);
    setItemsPerPage(newRange);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setKeyword(searchInput);
  }

  const renderName = (id: number, name: string): ReactElement => (
    <Link href={`/products/${id}`}>
      <StyledLink>{name}</StyledLink>
    </Link>
  );

  const renderPrice = (price: number): string => (
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  );

  const renderStock = (stock: number): ReactElement => (stock > 0
    ? <Small>{stock}</Small>
    : <Small bold marginBottom="none" color="danger">0</Small>
  );

  const renderAction = (id: number): ReactElement => (
    <Dropdown
      items={[ { content: 'Edit product', onItemClick: () => router.push(`/products/${id}`), hash: 'edit' } ]}
      toggle={<Button iconOnly={<MoreHorizIcon color="secondary60" />} variant="subtle" />}
    />
  );

  if (isError) return <ErrorMessage />;

  return (
    <>
      <Box marginBottom="xxLarge">
        <H1>Products</H1>
        <HR color="secondary30" />
      </Box>

      <Panel>
        <Form fullWidth={true} onSubmit={handleSearch}>
          <Flex marginBottom="medium">
            <FlexItem flexGrow={1}>
              <Input
                
                autoComplete="off"
                iconLeft={<SearchIcon title="Search" />}
                value={searchInput}
                name="product_search"
                description="Search through product name, brand, description, and SKUs"
                aria-label="Product Search"
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </FlexItem>
            <FlexItem
              marginLeft={{ tablet: 'medium' }}
              marginTop={{ mobile: 'small', tablet: 'none' }}
              alignSelf={{ tablet: 'flex-end' }}
            >
              <Button type="submit">Search</Button>
            </FlexItem>
          </Flex>
        </Form>

        <Loading isLoading={isLoading}>
          <Table
            columns={[
              { header: 'Product name', hash: 'name', render: ({ id, name }) => renderName(id, name) },
              { header: 'Stock', hash: 'stock', render: ({ stock }) => renderStock(stock) },
              { header: 'Price', hash: 'price', render: ({ price }) => renderPrice(price) },
              { header: 'Action', hideHeader: true, hash: 'id', render: ({ id }) => renderAction(id) },
          ]}
            items={tableItems}
            itemName="Products"
            pagination={{
                currentPage,
                totalItems: productList?.meta?.pagination?.total,
                onPageChange: setCurrentPage,
                itemsPerPageOptions,
                onItemsPerPageChange,
                itemsPerPage,
            }}
            stickyHeader
          />
        </Loading>
      </Panel>
    </>
  );
};

export default Products;
