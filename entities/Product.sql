{
  "name": "Product",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Product name"
    },
    "slug": {
      "type": "string",
      "description": "URL-friendly identifier"
    },
    "description": {
      "type": "string",
      "description": "Detailed product description"
    },
    "short_description": {
      "type": "string",
      "description": "Brief product summary"
    },
    "price": {
      "type": "number",
      "description": "Price in BRL"
    },
    "compare_price": {
      "type": "number",
      "description": "Original price for discount display"
    },
    "category_id": {
      "type": "string",
      "description": "Reference to Category"
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Product image URLs"
    },
    "material": {
      "type": "string",
      "enum": [
        "PLA",
        "ABS",
        "PETG",
        "TPU",
        "Resina",
        "Nylon",
        "Outro"
      ],
      "description": "3D printing material"
    },
    "color": {
      "type": "string",
      "description": "Product color"
    },
    "dimensions": {
      "type": "string",
      "description": "Product dimensions"
    },
    "weight": {
      "type": "string",
      "description": "Product weight"
    },
    "stock_quantity": {
      "type": "number",
      "default": 0,
      "description": "Available quantity"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    },
    "is_featured": {
      "type": "boolean",
      "default": false
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Product tags for search"
    },
    "print_time": {
      "type": "string",
      "description": "Estimated print time"
    },
    "infill": {
      "type": "string",
      "description": "Infill percentage"
    }
  },
  "required": [
    "name",
    "price",
    "category_id"
  ]
}