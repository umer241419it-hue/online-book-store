const Order = require('../models/Order');
const Book = require('../models/Book');

/**
 * @desc    Create a new customer order
 * @route   POST /api/orders
 * @access  Public
 */
const createOrder = async (req, res, next) => {
  try {
    const { customer, items, paymentMethod, notes, orderId: customOrderId } = req.body;

    if (!customer || !customer.fullName || !customer.email || !customer.phone || !customer.address || !customer.city || !customer.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required customer and delivery details.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one book item.'
      });
    }

    // Format order items and calculate totals
    let calculatedTotal = 0;
    let totalItems = 0;

    const formattedItems = items.map((item) => {
      const bookData = item.book || item;
      const quantity = Number(item.quantity || 1);
      const price = Number(bookData.price || 0);
      const itemTotal = price * quantity;

      calculatedTotal += itemTotal;
      totalItems += quantity;

      return {
        bookId: bookData.bookId || bookData.id || 'N/A',
        title: bookData.title || 'Untitled Book',
        author: bookData.author || '',
        price: price,
        quantity: quantity,
        image: bookData.image || ''
      };
    });

    // Generate unique order ID if not provided
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = customOrderId || `ORD-${Date.now().toString().slice(-5)}${randomSuffix}`;

    const validPaymentMethod = ['cod', 'upi', 'card'].includes(paymentMethod) ? paymentMethod : 'cod';
    const paymentStatus = validPaymentMethod === 'cod' ? 'Pending' : 'Completed';

    const newOrder = new Order({
      orderId,
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city.trim(),
        pincode: customer.pincode.trim(),
        landmark: customer.landmark ? customer.landmark.trim() : '',
        addressType: customer.addressType || 'home'
      },
      items: formattedItems,
      totalAmount: calculatedTotal,
      totalItems,
      paymentMethod: validPaymentMethod,
      paymentStatus,
      orderStatus: 'Pending',
      trackingHistory: [
        {
          status: 'Pending',
          timestamp: new Date(),
          note: 'Order successfully placed by customer. Awaiting warehouse processing.'
        }
      ],
      notes: notes || ''
    });

    const savedOrder = await newOrder.save();

    // Decrement stock in Book collection (best effort)
    for (const item of formattedItems) {
      try {
        if (item.bookId && item.bookId !== 'N/A') {
          await Book.updateOne(
            { bookId: item.bookId, quantity: { $gte: item.quantity } },
            { $inc: { quantity: -item.quantity } }
          );
        }
      } catch (stockErr) {
        console.warn(`Could not decrement stock for book ${item.bookId}:`, stockErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: savedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders with filtering and search (Admin)
 * @route   GET /api/orders
 * @access  Private (Admin)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, paymentMethod, sort } = req.query;

    const filter = {};

    if (status && status !== 'all' && status !== 'All') {
      filter.orderStatus = status;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      filter.paymentMethod = paymentMethod;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { orderId: regex },
        { 'customer.fullName': regex },
        { 'customer.email': regex },
        { 'customer.phone': regex },
        { 'customer.city': regex }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'amount-high') {
      sortOption = { totalAmount: -1 };
    } else if (sort === 'amount-low') {
      sortOption = { totalAmount: 1 };
    }

    const orders = await Order.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get statistics for admin orders dashboard
 * @route   GET /api/orders/stats
 * @access  Private (Admin)
 */
const getOrderStats = async (req, res, next) => {
  try {
    const allOrders = await Order.find({});

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.orderStatus === 'Pending').length;
    const processingOrders = allOrders.filter((o) => o.orderStatus === 'Processing').length;
    const shippedOrders = allOrders.filter((o) => o.orderStatus === 'Shipped').length;
    const deliveredOrders = allOrders.filter((o) => o.orderStatus === 'Delivered').length;
    const cancelledOrders = allOrders.filter((o) => o.orderStatus === 'Cancelled').length;

    // Revenue excludes cancelled orders
    const totalRevenue = allOrders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // Orders placed today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrdersCount = allOrders.filter((o) => new Date(o.createdAt) >= startOfToday).length;

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        todayOrdersCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order details by Order ID
 * @route   GET /api/orders/:id
 * @access  Private (Admin)
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status & add tracking entry (Admin)
 * @route   PATCH /api/orders/:id/status
 * @access  Private (Admin)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${id} not found.`
      });
    }

    const prevStatus = order.orderStatus;
    order.orderStatus = status;

    // If delivered, mark payment completed
    if (status === 'Delivered') {
      order.paymentStatus = 'Completed';
    }

    // Default note messages based on status
    let statusNote = note;
    if (!statusNote) {
      switch (status) {
        case 'Pending':
          statusNote = 'Order reset to Pending status.';
          break;
        case 'Processing':
          statusNote = 'Order verified. Books are being packed at the fulfillment hub.';
          break;
        case 'Shipped':
          statusNote = 'Dispatched with courier partner. Package in transit.';
          break;
        case 'Delivered':
          statusNote = 'Package handed over to customer successfully.';
          break;
        case 'Cancelled':
          statusNote = 'Order cancelled by administrator.';
          break;
        default:
          statusNote = `Status changed to ${status}`;
      }
    }

    order.trackingHistory.push({
      status,
      timestamp: new Date(),
      note: statusNote
    });

    // If order was cancelled, restore inventory
    if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
      for (const item of order.items) {
        try {
          if (item.bookId && item.bookId !== 'N/A') {
            await Book.updateOne(
              { bookId: item.bookId },
              { $inc: { quantity: item.quantity } }
            );
          }
        } catch (restockErr) {
          console.warn(`Could not restock book ${item.bookId}:`, restockErr.message);
        }
      }
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order #${order.orderId} status updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete order (Admin)
 * @route   DELETE /api/orders/:id
 * @access  Private (Admin)
 */
const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOneAndDelete({
      $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Order #${order.orderId} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderStats,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};
