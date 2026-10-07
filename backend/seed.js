const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/Book');

dotenv.config();

const sampleBooks = [
  {
    bookId: 'B101',
    title: 'React Basics',
    author: 'ABC',
    category: 'Web Development',
    price: 550,
    quantity: 10,
    description: 'A comprehensive beginner guide to building dynamic user interfaces with React.js, hooks, and component patterns.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80'
  },
  {
    bookId: 'B102',
    title: 'Web Technology',
    author: 'John Smith',
    category: 'Web Development',
    price: 450,
    quantity: 8,
    description: 'Foundational concepts of modern web technologies including HTML5, CSS3, JavaScript, HTTP protocol, and client-server architecture.',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&auto=format&fit=crop&q=80'
  },
  {
    bookId: 'B103',
    title: 'MongoDB Guide',
    author: 'XYZ',
    category: 'Database',
    price: 600,
    quantity: 15,
    description: 'Master NoSQL database design, aggregation pipelines, indexing, and high-performance querying with MongoDB.',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80'
  },
  {
    bookId: 'B104',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Programming',
    price: 850,
    quantity: 6,
    description: 'Essential software engineering principles, coding practices, and refactoring techniques to write readable and maintainable code.',
    image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1436202607i/3735293.jpg'
  },
  {
    bookId: 'B105',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell & Peter Norvig',
    category: 'AI & ML',
    price: 1200,
    quantity: 5,
    description: 'The definitive textbook covering machine learning, deep learning, search algorithms, probability, and intelligent agents.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80'
  },
  {
    bookId: 'B106',
    title: 'Node.js in Action',
    author: 'Alex Young',
    category: 'Web Development',
    price: 650,
    quantity: 12,
    description: 'Build fast, scalable server-side web applications using Node.js event-driven architecture, Express, and asynchronous patterns.',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&auto=format&fit=crop&q=80'
  },
  {
    bookId: 'B107',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz',
    category: 'Database',
    price: 750,
    quantity: 7,
    description: 'Standard academic reference on relational database theory, SQL, transaction management, concurrency, and normalization.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'
  },
  {
    bookId: 'B108',
    title: 'Machine Learning Yearning',
    author: 'Andrew Ng',
    category: 'AI & ML',
    price: 500,
    quantity: 9,
    description: 'Practical strategies and intuition for structuring machine learning projects, error analysis, and metric-driven improvements.',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&auto=format&fit=crop&q=80'
  },
  {
    bookId: 'B109',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Fiction',
    price: 300,
    quantity: 14,
    description: 'The classic 1925 American novel depicting the Jazz Age, wealth, ambition, love, and the elusive American Dream.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
  },
  {
    bookId: 'B110',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Fiction',
    price: 350,
    quantity: 11,
    description: 'Pulitzer Prize-winning masterpiece exploring justice, moral courage, racism, and empathy in the American South.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80'
  },
  {
    bookId: 'B111',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Gang of Four',
    category: 'Programming',
    price: 950,
    quantity: 4,
    description: 'Classic catalog of 23 object-oriented design patterns providing robust, reusable solutions to recurring software engineering problems.',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80'
  },
  {
    bookId: 'B112',
    title: 'Thinking in Systems',
    author: 'Donella Meadows',
    category: 'Other',
    price: 420,
    quantity: 0,
    description: 'An inspiring introduction to systems thinking, feedback loops, and holistic problem solving for complex real-world situations (Out of Stock sample).',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
  }
];

const Order = require('./models/Order');

const sampleOrders = [
  {
    orderId: 'ORD-729412',
    customer: {
      fullName: 'Aarav Mehta',
      email: 'aarav.mehta@example.com',
      phone: '9876543210',
      address: 'Flat 402, Sunshine Residency, Linking Road',
      city: 'Mumbai',
      pincode: '400050',
      landmark: 'Near National College',
      addressType: 'home'
    },
    items: [
      {
        bookId: 'B101',
        title: 'React Basics',
        author: 'ABC',
        price: 550,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80'
      },
      {
        bookId: 'B104',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        price: 850,
        quantity: 1,
        image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1436202607i/3735293.jpg'
      }
    ],
    totalAmount: 1400,
    totalItems: 2,
    paymentMethod: 'upi',
    paymentStatus: 'Completed',
    orderStatus: 'Shipped',
    trackingHistory: [
      {
        status: 'Pending',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000),
        note: 'Order placed and paid via UPI.'
      },
      {
        status: 'Processing',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000),
        note: 'Quality check passed. Packed in bubble mailer.'
      },
      {
        status: 'Shipped',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000),
        note: 'Dispatched via BlueDart AWB #BD8921049.'
      }
    ]
  },
  {
    orderId: 'ORD-654189',
    customer: {
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '9812345678',
      address: 'Plot 18, Sector 14, Hiranandani Estate',
      city: 'Thane',
      pincode: '400607',
      landmark: 'Opposite Clubhouse',
      addressType: 'work'
    },
    items: [
      {
        bookId: 'B105',
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell & Peter Norvig',
        price: 1200,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80'
      }
    ],
    totalAmount: 1200,
    totalItems: 1,
    paymentMethod: 'card',
    paymentStatus: 'Completed',
    orderStatus: 'Processing',
    trackingHistory: [
      {
        status: 'Pending',
        timestamp: new Date(Date.now() - 14 * 3600 * 1000),
        note: 'Order received. Payment authorized via Credit Card.'
      },
      {
        status: 'Processing',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000),
        note: 'Item retrieved from shelf, packaging in progress.'
      }
    ]
  },
  {
    orderId: 'ORD-519842',
    customer: {
      fullName: 'Rohan Deshmukh',
      email: 'rohan.d@example.com',
      phone: '9765432109',
      address: 'B-12, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      pincode: '560103',
      landmark: 'Behind Ecospace Tech Park',
      addressType: 'home'
    },
    items: [
      {
        bookId: 'B103',
        title: 'MongoDB Guide',
        author: 'XYZ',
        price: 600,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80'
      },
      {
        bookId: 'B106',
        title: 'Node.js in Action',
        author: 'Alex Young',
        price: 650,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&auto=format&fit=crop&q=80'
      }
    ],
    totalAmount: 1850,
    totalItems: 3,
    paymentMethod: 'cod',
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    trackingHistory: [
      {
        status: 'Pending',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000),
        note: 'Order placed by customer via Cash on Delivery. Awaiting packing.'
      }
    ]
  },
  {
    orderId: 'ORD-432108',
    customer: {
      fullName: 'Sneha Patel',
      email: 'sneha.patel@example.com',
      phone: '9988776655',
      address: '404, Shivalik High Street, Vastrapur',
      city: 'Ahmedabad',
      pincode: '380015',
      landmark: 'Near IIM New Campus',
      addressType: 'work'
    },
    items: [
      {
        bookId: 'B109',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        price: 300,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
      },
      {
        bookId: 'B110',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        price: 350,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80'
      }
    ],
    totalAmount: 650,
    totalItems: 2,
    paymentMethod: 'upi',
    paymentStatus: 'Completed',
    orderStatus: 'Delivered',
    trackingHistory: [
      {
        status: 'Pending',
        timestamp: new Date(Date.now() - 72 * 3600 * 1000),
        note: 'Order placed.'
      },
      {
        status: 'Processing',
        timestamp: new Date(Date.now() - 60 * 3600 * 1000),
        note: 'Packed.'
      },
      {
        status: 'Shipped',
        timestamp: new Date(Date.now() - 40 * 3600 * 1000),
        note: 'Shipped with courier.'
      },
      {
        status: 'Delivered',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000),
        note: 'Delivered directly to recipient Sneha Patel.'
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online_book_store';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB at ${mongoUri}`);

    // Clear existing books collection
    await Book.deleteMany({});
    console.log('Cleared existing books from database.');

    // Insert sample books with images
    const createdBooks = await Book.insertMany(sampleBooks);
    console.log(`Successfully seeded ${createdBooks.length} books with images into collection "books"!`);

    // Clear and seed sample orders
    await Order.deleteMany({});
    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`Successfully seeded ${createdOrders.length} sample orders into collection "orders"!`);

    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
