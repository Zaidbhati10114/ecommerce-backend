# E-commerce Backend API

A robust Node.js/Express.js backend for an e-commerce application with user authentication, shopping cart functionality, and product management.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Product Management**: Browse, search, and filter products by category and price
- **Shopping Cart**: Add, update, remove items with quantity management
- **Security**: Password hashing with bcrypt, JWT-based authentication
- **Database**: MongoDB with Mongoose ODM
- **CORS**: Cross-origin resource sharing enabled for frontend integration

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ecommerce-backend.git
   cd ecommerce-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:3000
   PORT=8000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:8000`

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token generation | Yes |
| `FRONTEND_URL` | Frontend application URL for CORS | Yes |
| `PORT` | Server port (defaults to 8000) | No |

## 📚 API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body**: 
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- **Body**: 
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Products

#### Get All Items
- **GET** `/api/items`
- **Query Parameters**:
  - `category` - Filter by category (optional)
  - `minPrice` - Minimum price filter (optional)
  - `maxPrice` - Maximum price filter (optional)
  - `search` - Search by item name (optional)

### Shopping Cart (Protected Routes)

> **Note**: All cart routes require authentication. Include JWT token in Authorization header: `Bearer <token>`

#### Get Cart
- **GET** `/api/cart`

#### Add Item to Cart
- **POST** `/api/cart/add`
- **Body**: 
  ```json
  {
    "itemId": "item_object_id",
    "quantity": 2
  }
  ```

#### Update Cart Item
- **PUT** `/api/cart/update`
- **Body**: 
  ```json
  {
    "itemId": "item_object_id",
    "quantity": 3
  }
  ```

#### Remove Item from Cart
- **DELETE** `/api/cart/remove/:itemId`

## 🗃️ Database Schema

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  cart: [
    {
      item: ObjectId (ref: "Item"),
      quantity: Number (default: 1)
    }
  ]
}
```

### Item Schema
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required),
  category: String (required),
  image: String (default: placeholder),
  stock: Number (default: 10)
}
```

## 🎯 Sample Data

The application automatically seeds the database with sample products on first run:
- MacBook Pro M2 (Electronics)
- iPhone 14 (Electronics)
- Sony Headphones (Electronics)
- Nike Air Jordan (Clothing)
- Levi's Jeans (Clothing)
- The Great Gatsby (Books)

## 🔐 Authentication Flow

1. User registers/logs in with credentials
2. Server validates and returns JWT token
3. Client includes token in Authorization header for protected routes
4. Server validates token and provides access to protected resources

## 🌐 CORS Configuration

The server is configured to accept requests from:
- `http://localhost:3000` (local development)
- Environment variable `FRONTEND_URL`

## 🚦 Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `500` - Internal Server Error

## 🔄 Development

**Available Scripts:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon






For support or questions, please open an issue in the GitHub repository.
