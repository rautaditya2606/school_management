# School Management API

## API Documentation

### Postman Collection
Direct link to collection: [School Management API Collection](your-generated-postman-link-here)

### Option 1: Import from File
1. Download the collection file from `/postman/school_management_api.json`
2. Open Postman
3. Click "Import" button
4. Drag and drop the JSON file or browse to select it
5. Click "Import"

### Option 2: Import from Link (Share Collection)
1. In Postman, click on your collection
2. Click "..." (three dots)
3. Select "Share Collection"
4. Choose "Via API"
5. Generate a new API key if needed
6. Copy the generated link
7. Share the link with others

### Testing the API
1. Set the environment variable BASE_URL:
   - Local: http://localhost:3000
   - Production: https://schooltrack.onrender.com

2. Available Endpoints:
   - GET {{BASE_URL}}/listSchools?latitude=51.5074&longitude=-0.1278
   - POST {{BASE_URL}}/addSchool
