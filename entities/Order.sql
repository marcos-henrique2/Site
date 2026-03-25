{
  "name": "Order",
  "type": "object",
  "properties": {
    "customer_name": {
      "type": "string"
    },
    "customer_email": {
      "type": "string"
    },
    "customer_phone": {
      "type": "string"
    },
    "customer_address": {
      "type": "string"
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "product_id": {
            "type": "string"
          },
          "product_name": {
            "type": "string"
          },
          "quantity": {
            "type": "number"
          },
          "unit_price": {
            "type": "number"
          },
          "total": {
            "type": "number"
          }
        }
      }
    },
    "subtotal": {
      "type": "number"
    },
    "shipping_cost": {
      "type": "number",
      "default": 0
    },
    "total": {
      "type": "number"
    },
    "status": {
      "type": "string",
      "enum": [
        "pendente",
        "confirmado",
        "em_producao",
        "enviado",
        "entregue",
        "cancelado"
      ],
      "default": "pendente"
    },
    "payment_method": {
      "type": "string",
      "enum": [
        "pix",
        "cartao",
        "boleto",
        "whatsapp"
      ],
      "default": "whatsapp"
    },
    "notes": {
      "type": "string"
    },
    "tracking_code": {
      "type": "string"
    }
  },
  "required": [
    "customer_name",
    "customer_email",
    "items",
    "total"
  ]
}