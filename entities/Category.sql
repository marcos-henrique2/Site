{
  "name": "Category",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Category name"
    },
    "slug": {
      "type": "string",
      "description": "URL-friendly identifier"
    },
    "description": {
      "type": "string",
      "description": "Category description"
    },
    "image_url": {
      "type": "string",
      "description": "Category cover image"
    },
    "icon": {
      "type": "string",
      "description": "Icon name from lucide"
    },
    "order": {
      "type": "number",
      "default": 0,
      "description": "Display order"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "name",
    "slug"
  ]
}