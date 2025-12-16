# InventoryHub

A full-stack inventory management application integrated with Microsoft Copilot.

## Features

- **Frontend**: Single Page Application (SPA) using Vanilla JS and CSS.
- **Backend**: Node.js / Express API.
- **Persistence**: JSON file-based storage (`src/data/inventory.json`).
- **Caching**: In-memory caching for list endpoints using `node-cache`.
- **Validation**: Input validation using `Joi`.
- **Architecture**: Modular design (Controllers, Services, Routes).

## Prerequisites

- Node.js (v14 or higher)
- npm

## Setup & Run

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the server:
    ```bash
    npm start
    ```

3.  Open your browser and navigate to:
    `http://localhost:8000`

## Testing

Run the integration tests:

```bash
npm test
```

## API Endpoints

- `GET /api/items`: List items (supports pagination and search).
- `GET /api/items/:id`: Get item details.
- `POST /api/items`: Create a new item.
- `PUT /api/items/:id`: Update an item.
- `DELETE /api/items/:id`: Delete an item.
