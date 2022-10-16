// This example demonstrates a products database where customers can place orders.
import connect from "./lib/database.js";

async function main() {
  const db = await connect();
  const companies  = await db.table('companies');
  const users      = await db.table('users');
  const products   = await db.table('products');

  let BadgersInc, FerretsLtd, StoatsRUs;
  let Bobby, Brian, Fiona, Susan;
  let Frock, Furs, Socks, Shoes;

  // insert some companies
  [BadgersInc, FerretsLtd, StoatsRUs] = await companies.insertRecords([
    { name: 'Badgers Inc.' },
    { name: 'Ferrets Ltd.' },
    { name: 'Stoats R Us'  },
  ]);

  // insert some users associated with the companies
  [Bobby, Brian, Fiona, Susan] = await users.insertRecords([
    { name: 'Bobby Badger', company_id: BadgersInc.id },
    { name: 'Brian Badger', company_id: BadgersInc.id },
    { name: 'Fiona Ferret', company_id: FerretsLtd.id },
    { name: 'Susan Stoat',  company_id: StoatsRUs.id  },
  ]);

  // insert some products supplied by two of the companies
  [Frock, Furs, Socks, Shoes] = await products.insertRecords([
    { name: 'Ferret Frock', price:  49.99, supplier_id: FerretsLtd.id },
    { name: 'Ferret Furs',  price: 159.99, supplier_id: FerretsLtd.id },
    { name: 'Stoaty Socks', price:   4.99, supplier_id: StoatsRUs.id },
    { name: 'Stoaty Shoes', price:  32.99, supplier_id: StoatsRUs.id },
  ]);

  // Bobby Badger wants to place an order
  const order1 = await Bobby.placeOrder({
    placed: '2022-10-15',
    items: [
      { product_id: Frock.id, quantity: 1 },
      { product_id: Shoes.id, quantity: 2 },
    ]
  });
  await OrderDetails(order1);

  // Now Brian Badger
  const order2 = await Brian.placeOrder({
    placed: '2022-10-16',
    items: [
      { product_id: Frock.id, quantity: 2 },
      { product_id: Socks.id, quantity: 3 },
      { product_id: Shoes.id, quantity: 1 },
    ]
  });
  await OrderDetails(order2);

  // Fiona Ferret is up next
  const order3 = await Fiona.placeOrder({
    placed: '2022-10-17',
    items: [
      { product_id: Frock.id, quantity: 1 },
      { product_id: Furs.id,  quantity: 2 },
    ]
  });
  await OrderDetails(order3);

  // Susan Stoat wants a piece of the action
  const order4 = await Susan.placeOrder({
    placed: '2022-10-18',
    items: [
      { product_id: Socks.id, quantity: 5 },
      { product_id: Shoes.id,  quantity: 7 },
    ]
  });
  await OrderDetails(order4);

  // check the sales figures
  const sales = await products.salesFigures();

  console.log('Sales Figures');
  console.log('----------------------------------------');
  console.log('Product         Sold     Price   Revenue');
  console.log('----------------------------------------');
  sales.forEach(
    product => console.log(
      "%s %s  %s  %s",
      product.name.padEnd(16),
      product.total_sold.toString().padStart(3),
      product.price.toFixed(2).padStart(8),
      product.total_revenue.toFixed(2).padStart(8),
    )
  )


  db.disconnect();
}

async function OrderDetails(order) {
  // order has a customer relation to fetch the user who placed the order
  const customer = await order.customer;

  // order has an items relation to fetch order items, including product name
  const items = await order.items;

  console.log(
    'Order #%s placed %s by %s',
    order.id, order.placed, customer.name
  );
  console.log('---------------------------------------------')

  console.log("There are %s items on the order", items.length);
  items.forEach(
    item => console.log(
      "  %s %s @ $%s = $%s",
      item.name.padEnd(14), item.quantity.toString().padStart(6),
      item.price.toFixed(2).padStart(7), item.total.toFixed(2).padStart(7)
    )
  )
  console.log('---------------------------------------------')
  console.log("Order total:                         $%s\n",
    order.total.toFixed(2).padStart(7)
  )
}

main();

/*
Expected Output:

Order #1 placed 2022-10-15 by Bobby Badger
---------------------------------------------
There are 2 items on the order
  Ferret Frock        1 @ $  49.99 = $  49.99
  Stoaty Shoes        2 @ $  32.99 = $  65.98
---------------------------------------------
Order total:                         $ 115.97

Order #2 placed 2022-10-16 by Brian Badger
---------------------------------------------
There are 3 items on the order
  Ferret Frock        2 @ $  49.99 = $  99.98
  Stoaty Socks        3 @ $   4.99 = $  14.97
  Stoaty Shoes        1 @ $  32.99 = $  32.99
---------------------------------------------
Order total:                         $ 147.94

Order #3 placed 2022-10-17 by Fiona Ferret
---------------------------------------------
There are 2 items on the order
  Ferret Frock        1 @ $  49.99 = $  49.99
  Ferret Furs         2 @ $ 159.99 = $ 319.98
---------------------------------------------
Order total:                         $ 369.97

Order #4 placed 2022-10-18 by Susan Stoat
---------------------------------------------
There are 2 items on the order
  Stoaty Socks        5 @ $   4.99 = $  24.95
  Stoaty Shoes        7 @ $  32.99 = $ 230.93
---------------------------------------------
Order total:                         $ 255.88

Sales Figures
----------------------------------------
Product         Sold     Price   Revenue
----------------------------------------
Stoaty Shoes      10     32.99    329.90
Ferret Furs        2    159.99    319.98
Ferret Frock       4     49.99    199.96
Stoaty Socks       8      4.99     39.92

*/