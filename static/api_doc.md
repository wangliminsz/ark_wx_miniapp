# Inventory API Documentation (库存盘点 API 文档)

## Base URL
```
http://localhost:8000
```

## Authentication (认证)
All endpoints require Bearer token authentication except `/inv_hello`.

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## 1. Product Categories (产品类别)

### GET /myinv/categories
Get all product categories from Odoo.

**Request:**
```http
GET http://localhost:8000/myinv/categories
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "records": [
    {
      "id": 4,
      "name": "原材料 Raw",
      "parent_id": false,
      "complete_name": "原材料 Raw"
    },
    {
      "id": 5,
      "name": "产品 Product",
      "parent_id": false,
      "complete_name": "产品 Product"
    }
  ],
  "total_records": 7
}
```

---

## 2. Products by Category (按类别获取产品)

### GET /products/by_category/{category_id}
Get products by category ID with pagination and keyword search.

**Request:**
```http
GET http://localhost:8000/products/by_category/4?offset=0&keyword=105A
Authorization: Bearer {{token}}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category_id | int (path) | Yes | Odoo category ID |
| offset | int (query) | No | Pagination offset (default: 0) |
| keyword | string (query) | No | Search keyword |

**Response:**
```json
{
  "records": [
    {
      "id": 636,
      "name": "105A水性流变助剂",
      "default_code": "HAT07105A0002L002",
      "categ_id": [4, "原材料 Raw"],
      "qty_available": 100.0,
      "list_price": 1.0,
      "standard_price": 0.0,
      "product_tmpl_id": [636, "[HAT07105A0002L002] 105A水性流变助剂"]
    }
  ],
  "current_page": 1,
  "total_records": 1,
  "records_per_page": 12,
  "total_pages": 1,
  "no_more_pages": true
}
```

---

## 3. Product Lots (产品批次)

### GET /product/lots
Get all lot numbers for a product by product code.

**Request:**
```http
GET http://localhost:8000/product/lots?product_code=HATRMPTN50401S150
Authorization: Bearer {{token}}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_code | string (query) | Yes | Product code (e.g. HATRMPTN50401S150) |

**Response:**
```json
{
  "product_code": "HATRMPTN50401S150",
  "lots": [
    {
      "id": 2266,
      "name": "2024042201",
      "product_id": [1844, "[HATRMPTN50401S150] 耐燃气抗黄变剂PTN504"]
    }
  ]
}
```

---

## 4. Odoo Inventory Quants (Odoo 账面库存)

### GET /inv/quants
Get Odoo inventory batches (quants) for a product with pagination.

**Request:**
```http
GET http://localhost:8000/inv/quants?product=HATRM10100001S082&offset=0
Authorization: Bearer {{token}}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product | string (query) | Yes | Product code |
| offset | int (query) | No | Pagination offset (default: 0) |

**Response:**
```json
{
  "records": [
    {
      "location": "WH/原材料 - 研发用原材料",
      "product_code": "HATRM10100001S082",
      "product_name": "[HATRM10100001S082] 抗氧化剂 RIANOX 1010",
      "lot_number": "2025120513",
      "on_hand_quantity": 0.3,
      "uom": "kg",
      "scheduled_date": "12/31/2026",
      "difference": 0.0
    }
  ],
  "current_page": 1,
  "total_records": 6,
  "records_per_page": 12,
  "total_pages": 1,
  "no_more_pages": true
}
```

---

## 5. Odoo Locations (Odoo 仓库库位)

### GET /odoo/locations
Get all internal Odoo warehouse locations.

**Request:**
```http
GET http://localhost:8000/odoo/locations
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "records": [
    {
      "id": 8,
      "name": "Stock",
      "complete_name": "WH/Stock",
      "usage": "internal"
    },
    {
      "id": 20,
      "name": "研发用原材料",
      "complete_name": "WH/原材料 - 研发用原材料",
      "usage": "internal"
    }
  ]
}
```

---

## 6. Physical Locations (物理库位)

### GET /physical/locations
Get all physical shelf locations (A1/A2/A3).

**Request:**
```http
GET http://localhost:8000/physical/locations
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "records": [
    {
      "id": 1,
      "loc_code": "A1",
      "loc_name": "1号货架-上层",
      "remark": "树脂区"
    },
    {
      "id": 2,
      "loc_code": "A2",
      "loc_name": "1号货架-中层",
      "remark": "助剂区"
    }
  ]
}
```

---

## 7. Physical Stock (实物库存)

### GET /physical/stock
Get all physical stock records.

**Request:**
```http
GET http://localhost:8000/physical/stock
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "records": [
    {
      "id": 1,
      "product_code": "HATRMPTN50401S150",
      "product_name": "耐燃气抗黄变剂PTN504",
      "lot_number": "2024042201",
      "loc_code": "A1",
      "real_qty": 10.0,
      "uom": "kg"
    }
  ]
}
```

### GET /physical/stock/by_product
Get physical stock by product code with total quantity.

**Request:**
```http
GET http://localhost:8000/physical/stock/by_product?code=HATRMPTN50401S150
Authorization: Bearer {{token}}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string (query) | Yes | Product code |

**Response:**
```json
{
  "product_code": "HATRMPTN50401S150",
  "total_real_qty": 15.794,
  "details": [
    {
      "id": 1,
      "product_code": "HATRMPTN50401S150",
      "lot_number": "2024042201",
      "loc_code": "A1",
      "real_qty": 10.0,
      "uom": "kg"
    }
  ]
}
```

---

## 8. Inventory Reconciliation (库存对账)

### GET /inventory/reconcile
Compare Odoo book inventory vs physical inventory with difference calculation.

**Request:**
```http
GET http://localhost:8000/inventory/reconcile?product_code=HATRMPTN50401S150
Authorization: Bearer {{token}}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_code | string (query) | Yes | Product code |

**Response:**
```json
{
  "product_code": "HATRMPTN50401S150",
  "odoo_total": 15.794,
  "physical_total": 15.794,
  "diff": 0.0,
  "odoo_details": [
    {
      "id": 7507,
      "product_id": [1844, "[HATRMPTN50401S150] 耐燃气抗黄变剂PTN504"],
      "lot_id": [2266, "2024042201"],
      "location_id": [8, "WH/Stock"],
      "quantity": 3.994
    }
  ],
  "physical_details": [
    {
      "id": 1,
      "product_code": "HATRMPTN50401S150",
      "lot_number": "2024042201",
      "loc_code": "A1",
      "real_qty": 10.0
    }
  ]
}
```

---

## 9. Update Physical Stock (更新实物库存)

### POST /physical/stock/update
Update physical stock record (product_id, lot_id, physical_loc_id must exist).

**Request:**
```http
POST http://localhost:8000/physical/stock/update
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "product_id": 1844,
    "lot_id": 2266,
    "physical_loc_id": 1,
    "real_qty": 120.5
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_id | int | Yes | Odoo product ID |
| lot_id | int | Yes | Odoo lot ID |
| physical_loc_id | int | Yes | Physical location ID (1=A1, 2=A2, etc.) |
| real_qty | float | Yes | New quantity |

**Response:**
```json
{
  "status": "updated",
  "id": 1
}
```

---

## 10. Update Odoo Stock (更新 Odoo 账面库存)

### POST /odoo/stock/set
Set Odoo inventory quantity by product code, lot number, and location name.
Equivalent to clicking "Set" in Odoo inventory adjustment UI.

**Request:**
```http
POST http://localhost:8000/odoo/stock/set
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "product_code": "HATRMPTN50401S150",
    "lot_number": "2024042201",
    "location_name": "WH/Stock",
    "new_quantity": 154.9
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_code | string | Yes | Product code (e.g. HATRMPTN50401S150) |
| lot_number | string | No | Lot number (e.g. 2024042201) |
| location_name | string | Yes | Odoo location name (e.g. WH/Stock) |
| new_quantity | float | Yes | New quantity to set |

**Location names (from GET /odoo/locations):**
- `WH/Stock` - Main stock
- `WH/原材料 - 研发用原材料` - R&D raw materials
- etc.

**Response (Updated):**
```json
{
  "status": "updated",
  "quant_id": 7507,
  "product_code": "HATRMPTN50401S150",
  "location": "WH/Stock",
  "lot_number": "2024042201",
  "new_quantity": 154.9
}
```

**Response (Created):**
```json
{
  "status": "created",
  "quant_id": 12345,
  "product_code": "HATRMPTN50401S150",
  "location": "WH/Stock",
  "lot_number": "2024042201",
  "new_quantity": 154.9
}
```

---

## Error Responses (错误响应)

### 401 Unauthorized
```json
{
  "detail": "No User --- Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "error": "Location WH/Stock not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message here"
}
```

---

## Common Workflows (常用工作流程)

### Workflow 1: Scan product and view inventory
1. **Get categories:** `GET /myinv/categories`
2. **Get products:** `GET /products/by_category/{category_id}`
3. **Select product and get lots:** `GET /product/lots?product_code=XXX`
4. **View Odoo inventory:** `GET /inv/quants?product=XXX`
5. **View physical inventory:** `GET /physical/stock/by_product?code=XXX`
6. **Compare:** `GET /inventory/reconcile?product_code=XXX`

### Workflow 2: Physical inventory count and update
1. **Get physical locations:** `GET /physical/locations`
2. **Scan lot/barcode → Get product lots:** `GET /product/lots?product_code=XXX`
3. **Update physical stock:** `POST /physical/stock/update` with product_id, lot_id, physical_loc_id, real_qty

### Workflow 3: Adjust Odoo inventory (after physical count)
1. **Compare inventory:** `GET /inventory/reconcile?product_code=XXX`
2. **Get Odoo locations:** `GET /odoo/locations`
3. **Set Odoo quantity:** `POST /odoo/stock/set` with product_code, lot_number, location_name, new_quantity
