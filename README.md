# PDF_ANALYZE_LLM

## Project Overview

PDF_ANALYZE_LLM is a comprehensive solution designed for analyzing PDF documents using advanced machine learning techniques, particularly aimed at leveraging the Retrieval-Augmented Generation (RAG) architecture. The system consists of both frontend and backend modules that work seamlessly to provide an intuitive user experience while effectively processing and analyzing PDF files.

## Architecture Diagram Explanation

The architecture of PDF_ANALYZE_LLM consists of several interrelated components:

- **Frontend**: A user-friendly interface allowing users to upload PDF files, view analyses, and access documentation.
- **Backend**: The server-side module handles data processing, including PDF extraction and machine learning inference.
- **RAG Architecture**: Combines retrieval and generation capabilities for enhanced document understanding.
- **VectorDB**: A vector database that stores embeddings for efficient querying and retrieval of information.

## Module Descriptions

### Frontend Module
- **Technology Stack**: [React.js, Bootstrap]
- **Functionality**: Enables users to upload files and view results. Provides a comprehensive dashboard for user interactions and displays analytics results.
- **Key Components**: Upload Form, Results Display, Analytics Dashboard.

### Backend Module
- **Technology Stack**: [Node.js, Express, Python]
- **Functionality**: Processes uploaded PDFs, extracts text, handles machine learning models, and interfaces with the VectorDB.
- **Key Components**: PDF Handler, Machine Learning Model Manager, API Endpoints.

## RAG Pipeline Explanation

The RAG pipeline is central to the functionality of our application. It consists of two main processes:
1. **Retrieval**: Retrieves relevant information from the VectorDB using embeddings for the uploaded PDF content.
2. **Generation**: Utilizes the retrieved information to generate answers or insights relevant to user queries.

## VectorDB Implementation

The VectorDB is built on [Pinecone/Weaviate/FAISS] for efficient retrieval of document embeddings. It allows the application to handle large datasets and provide quick responses to user queries based on the embeddings of the PDFs processed.

## Setup Instructions

To set up the project locally, follow these steps:
1. Clone the repository:  
   ```env
   git clone https://github.com/rahulthapa9024/PDF_ANALYZE_LLM.git
   ```
   
3. Navigate to the project directory:  
   ```env
   cd PDF_ANALYZE_LLM
   ```
5. Install dependencies for both frontend and backend:
   - Frontend:  
     ```env
     cd frontend
     ```
     ```env
     npm install
     ```
   - Backend:  
     ```env
     cd backend
     ```
     ```env
     
     ```
6. Start the services:
   - Frontend:  
     `npm start`
   - Backend:  
     `node server.js` (or similar command)
7. Open your browser and go to `http://localhost:3000` to access the frontend interface.

## API Documentation

The backend offers a RESTful API with the following endpoints:
- `POST /api/upload` - Uploads a PDF for processing.
- `GET /api/results/:id` - Retrieves analysis results by ID.
- `GET /api/status` - Checks the status of the backend service.

Refer to the individual endpoint documentation for detailed descriptions of request and response formats.
