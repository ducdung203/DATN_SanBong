# Football Field Management Web Application

This project is a Football Field Management web application built using the MERN stack (MongoDB, Express, React, Node.js). It allows users to manage football fields, including creating, updating, and deleting field information.

## Project Structure

The project is organized into two main parts: the backend and the frontend.

### Backend

The backend is built with Node.js and Express, and it handles all the API requests and database interactions.

- **src/app.js**: Entry point of the backend application.
- **src/config/db.js**: Database connection configuration using Mongoose.
- **src/controllers/fieldController.js**: Contains the logic for handling CRUD operations for football fields.
- **src/models/fieldModel.js**: Defines the Mongoose schema for football fields.
- **src/routes/fieldRoutes.js**: Sets up the API routes for field-related operations.
- **src/utils/index.js**: Utility functions for error handling and response formatting.

### Frontend

The frontend is built with React and provides a user interface for interacting with the backend.

- **src/App.js**: Main component that sets up routing and layout.
- **src/components/FieldCard.js**: Displays information about a football field.
- **src/pages/HomePage.js**: Landing page that lists all football fields.
- **src/pages/FieldDetailsPage.js**: Shows detailed information about a selected football field.
- **src/services/api.js**: Functions for making API calls to the backend.
- **src/styles/App.css**: CSS styles for the frontend application.

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory and install dependencies:
   ```
   cd backend
   npm install
   ```

3. Navigate to the frontend directory and install dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. Start the frontend application:
   ```
   cd frontend
   npm start
   ```

The application should now be running on `http://localhost:3000` for the frontend and `http://localhost:5000` for the backend.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.