# WooCommerce Integration Documentation

## Overview

This document describes the WooCommerce REST API integration for DPC Nexus POS system. The integration enables bidirectional synchronization of products, categories, customers, and orders between WooCommerce and the POS system.

## Architecture Analysis: Frontend vs Backend Separation

### Current Implementation (Frontend-Heavy)

The current implementation is primarily frontend-based, which has both advantages and limitations:

#### Frontend Responsibilities
- **API Client**: Direct HTTP requests to WooCommerce REST API from the browser
- **Data Mapping**: Transform WooCommerce data structures to POS data structures
- **State Management**: Handle sync state, connection status, and UI feedback
- **Configuration Management**: Store and manage WooCommerce credentials
- **User Interface**: Settings panel for configuration and sync operations

#### Backend Responsibilities (Currently Missing)
- **API Proxy**: No server-side proxy for WooCommerce API calls
- **Credential Security**: Credentials stored in environment variables/client-side
- **Data Validation**: No server-side validation of synced data
- **Authentication**: No proper authentication layer
- **Rate Limiting**: No server-side rate limiting protection
- **Error Handling**: Basic client-side error handling only

### Recommended Backend Separation

For a production-ready implementation, the following separation is recommended:

#### Backend Layer (Server-Side)

**Purpose**: Security, performance, and data integrity

**Responsibilities**:
1. **API Proxy Server**
   - Intercept all WooCommerce API requests
   - Hide WooCommerce credentials from frontend
   - Implement rate limiting and caching
   - Handle authentication/authorization

2. **Data Validation Layer**
   - Validate incoming WooCommerce data before sync
   - Ensure data integrity and business rules
   - Sanitize and normalize data

3. **Sync Orchestration**
   - Manage sync schedules and queues
   - Handle conflict resolution
   - Implement retry logic and error recovery
   - Provide sync status and progress tracking

4. **Credential Management**
   - Secure storage of WooCommerce API keys
   - Key rotation and management
   - Environment-specific configurations

5. **Authentication & Authorization**
   - Verify POS system user permissions
   - Implement role-based access control for sync operations
   - Audit logging of all sync activities

#### Frontend Layer (Client-Side)

**Purpose**: User experience and interaction

**Responsibilities**:
1. **Configuration UI**
   - Form for entering WooCommerce credentials (sent to backend)
   - Connection testing interface
   - Sync settings and preferences

2. **Sync Control Interface**
   - Manual sync triggers
   - Sync progress visualization
   - Sync history and status display

3. **Data Display**
   - Show synced WooCommerce data in POS interface
   - Display sync conflicts and resolution options
   - Real-time sync status indicators

4. **User Feedback**
   - Success/error notifications
   - Progress indicators
   - Validation error display

### Data Flow Diagram

```
┌─────────────────┐
│   Frontend      │
│  (React/POS)    │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  Backend API    │
│  (Node.js/Next) │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  WooCommerce    │
│  REST API       │
└─────────────────┘
```

### Security Considerations

**Current Implementation Risks**:
- WooCommerce credentials exposed in client-side code
- No rate limiting protection
- CORS restrictions may apply
- Credentials stored in browser localStorage/environment variables

**Recommended Backend Implementation Benefits**:
- Credentials never exposed to frontend
- Centralized rate limiting and caching
- Better error handling and retry logic
- Audit logging and compliance
- Ability to implement webhooks for real-time sync

## Installation & Setup

### Prerequisites

- WooCommerce store with REST API enabled
- WooCommerce API keys with Read/Write permissions
- Node.js 18+ and npm/yarn

### Step 1: Install Dependencies

```bash
npm install @woocommerce/woocommerce-rest-api
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_WOOCOMMERCE_URL=https://your-store.com
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Get WooCommerce API Keys

1. Log in to your WooCommerce admin panel
2. Navigate to: `WooCommerce → Settings → Advanced → REST API`
3. Click "Add Key"
4. Enter a description (e.g., "DPC Nexus POS Integration")
5. Select "Read/Write" permissions
6. Click "Generate API Key"
7. Copy the Consumer Key and Consumer Secret

## File Structure

```
src/lib/
├── woocommerce-config.ts      # Configuration management
├── woocommerce-client.ts     # API client and data mapping
└── woocommerce-sync.ts       # Sync functions and orchestration

src/routes/
└── _app.settings.tsx         # WooCommerce settings UI

.env.example                  # Environment variables template
```

## API Reference

### Configuration Functions

#### `getWooCommerceConfig()`
Returns the WooCommerce configuration if valid, otherwise null.

```typescript
import { getWooCommerceConfig } from '@/lib/woocommerce-config';

const config = getWooCommerceConfig();
if (config) {
  console.log('WooCommerce configured:', config.url);
}
```

#### `validateWooCommerceConfig(config)`
Validates if the WooCommerce configuration is properly set.

```typescript
import { validateWooCommerceConfig } from '@/lib/woocommerce-config';

const isValid = validateWooCommerceConfig(config);
```

### Data Mapping Functions

#### Product Mapping

**WooCommerce → POS:**
```typescript
import { mapWooCommerceProductToPos } from '@/lib/woocommerce-client';

const posProduct = mapWooCommerceProductToPos(wooProduct);
```

**POS → WooCommerce:**
```typescript
import { mapPosProductToWooCommerce } from '@/lib/woocommerce-client';

const wooProduct = mapPosProductToWooCommerce(posProduct);
```

#### Order Mapping

**WooCommerce → POS:**
```typescript
import { mapWooCommerceOrderToPos } from '@/lib/woocommerce-client';

const posOrder = mapWooCommerceOrderToPos(wooOrder);
```

**POS → WooCommerce:**
```typescript
import { mapPosOrderToWooCommerce } from '@/lib/woocommerce-client';

const wooOrder = mapPosOrderToWooCommerce(posOrder);
```

### Sync Functions

#### `testConnection()`
Tests the connection to WooCommerce API.

```typescript
import { testConnection } from '@/lib/woocommerce-sync';

const result = await testConnection();
console.log(result.connected ? 'Connected' : 'Failed');
```

#### `syncProductsFromWooCommerce()`
Fetches all products from WooCommerce.

```typescript
import { syncProductsFromWooCommerce } from '@/lib/woocommerce-sync';

const products = await syncProductsFromWooCommerce();
console.log(`Synced ${products.length} products`);
```

#### `syncCategoriesFromWooCommerce()`
Fetches all categories from WooCommerce.

```typescript
import { syncCategoriesFromWooCommerce } from '@/lib/woocommerce-sync';

const categories = await syncCategoriesFromWooCommerce();
```

#### `syncCustomersFromWooCommerce()`
Fetches all customers from WooCommerce.

```typescript
import { syncCustomersFromWooCommerce } from '@/lib/woocommerce-sync';

const customers = await syncCustomersFromWooCommerce();
```

#### `syncOrdersFromWooCommerce()`
Fetches all orders from WooCommerce.

```typescript
import { syncOrdersFromWooCommerce } from '@/lib/woocommerce-sync';

const orders = await syncOrdersFromWooCommerce();
```

#### `fullSyncFromWooCommerce()`
Performs a full sync of all data types.

```typescript
import { fullSyncFromWooCommerce } from '@/lib/woocommerce-sync';

const result = await fullSyncFromWooCommerce((stage, current, total) => {
  console.log(`Syncing ${stage}: ${current}/${total}`);
});

console.log('Sync complete:', result);
```

#### `pushProductToWooCommerce()`
Creates a new product in WooCommerce.

```typescript
import { pushProductToWooCommerce } from '@/lib/woocommerce-sync';

const wooProductId = await pushProductToWooCommerce(posProduct);
```

#### `pushOrderToWooCommerce()`
Creates a new order in WooCommerce.

```typescript
import { pushOrderToWooCommerce } from '@/lib/woocommerce-sync';

const wooOrderId = await pushOrderToWooCommerce(posOrder);
```

## Data Mapping Details

### Product Fields

| WooCommerce Field | POS Field | Notes |
|------------------|-----------|-------|
| `id` | `id` | Direct mapping |
| `name` | `name` | Direct mapping |
| `sku` | `sku` | Falls back to `WC-{id}` if empty |
| `regular_price` | `price` | Uses regular_price, falls back to price |
| `categories[0].id` | `categoryId` | First category only |
| `attributes` | `specs` | Mapped to specs object |
| `type` | `productType` | Maps 'service' type |
| `status` | `archived` | 'publish' = active, else archived |

### Order Status Mapping

| WooCommerce Status | POS Status |
|-------------------|------------|
| `pending` | `pending` |
| `processing` | `processing` |
| `on_hold` | `pending` |
| `completed` | `completed` |
| `cancelled` | `cancelled` |
| `refunded` | `refunded` |
| `failed` | `cancelled` |

### Payment Method Mapping

| WooCommerce Method | POS Method |
|-------------------|------------|
| `cod` | `cash` |
| `bacs` | `bank` |
| `paypal` | `card` |
| `stripe` | `card` |
| `gcash` | `gcash` |

## Usage Examples

### Example 1: Basic Product Sync

```typescript
import { syncProductsFromWooCommerce } from '@/lib/woocommerce-sync';

async function syncProducts() {
  try {
    const products = await syncProductsFromWooCommerce();
    console.log(`Successfully synced ${products.length} products`);
    
    // Integrate with POS store
    products.forEach(product => {
      // Use store.createProduct() or store.updateProduct()
    });
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
```

### Example 2: Full Sync with Progress

```typescript
import { fullSyncFromWooCommerce } from '@/lib/woocommerce-sync';

async function performFullSync() {
  try {
    const result = await fullSyncFromWooCommerce((stage, current, total) => {
      console.log(`Progress: ${stage} (${current}/${total})`);
    });
    
    console.log('Categories:', result.categories.length);
    console.log('Products:', result.products.length);
    console.log('Customers:', result.customers.length);
    console.log('Orders:', result.orders.length);
  } catch (error) {
    console.error('Full sync failed:', error);
  }
}
```

### Example 3: Push POS Order to WooCommerce

```typescript
import { pushOrderToWooCommerce } from '@/lib/woocommerce-sync';
import { useStore } from '@/lib/store';

async function pushOrder(orderId: string) {
  const store = useStore();
  const order = store.orders.find(o => o.id === orderId);
  
  if (!order) {
    console.error('Order not found');
    return;
  }
  
  try {
    const wooOrderId = await pushOrderToWooCommerce(order);
    console.log('Order pushed to WooCommerce:', wooOrderId);
  } catch (error) {
    console.error('Failed to push order:', error);
  }
}
```

## Settings UI Integration

The WooCommerce integration includes a settings panel accessible from:

**Navigation**: `Settings → WooCommerce`

### Features

1. **API Configuration**
   - Store URL input
   - Consumer Key input
   - Consumer Secret input (password field)
   - Connection test button

2. **Data Synchronization**
   - Full sync button
   - Progress indicator
   - Sync status display

3. **Connection Status**
   - Visual feedback (✓ Connected / ✗ Connection failed)
   - Real-time connection testing

## Troubleshooting

### Connection Issues

**Problem**: "Connection failed" error

**Solutions**:
1. Verify WooCommerce store URL is correct (no trailing slash)
2. Check API key permissions (must be Read/Write)
3. Ensure WooCommerce REST API is enabled
4. Check for CORS restrictions in browser console
5. Verify SSL certificate is valid for HTTPS URLs

### Sync Errors

**Problem**: Products not syncing correctly

**Solutions**:
1. Check product data structure in WooCommerce
2. Verify category mappings exist
3. Check for missing required fields (SKU, price)
4. Review browser console for specific error messages

### Rate Limiting

**Problem**: API rate limit errors

**Solutions**:
1. Implement retry logic with exponential backoff
2. Reduce batch sizes for large syncs
3. Consider implementing backend proxy for rate limiting

### Data Mapping Issues

**Problem**: Fields not mapping correctly

**Solutions**:
1. Check WooCommerce product attributes configuration
2. Verify custom field names match mapping logic
3. Review data mapping functions in `woocommerce-client.ts`
4. Add custom mapping logic for specific use cases

## Security Best Practices

### Current Implementation

⚠️ **Security Warning**: The current implementation stores WooCommerce(credentials in environment variables and makes API calls directly from the frontend. This is suitable for development but not recommended for production.

### Recommended Production Setup

1. **Backend API Proxy**
   - Implement a server-side API proxy
   - Never expose WooCommerce credentials to frontend
   - Use environment variables on the server

2. **Credential Management**
   - Use secret management services (AWS Secrets Manager, etc.)
   - Implement key rotation
   - Audit credential access

3. **Authentication**
   - Implement proper authentication for sync operations
   - Use role-based access control
   - Log all sync activities

4. **Network Security**
   - Use HTTPS for all API communications
   - Implement IP whitelisting if possible
   - Use webhook signatures for verification

## Future Enhancements

### Backend Implementation

1. **API Proxy Server**
   - Next.js API routes or Express server
   - Request validation and sanitization
   - Rate limiting and caching

2. **Webhook Integration**
   - Real-time sync triggers from WooCommerce
   - Event-driven architecture
   - Reduced polling overhead

3. **Advanced Sync Features**
   - Incremental sync (only changed data)
   - Conflict resolution UI
   - Sync scheduling and automation
   - Bi-directional sync with conflict detection

4. **Enhanced Security**
   - OAuth 2.0 authentication
   - Request signing
   - Advanced audit logging

### Frontend Enhancements

1. **Improved UI**
   - Sync history and logs
   - Advanced filtering for sync operations
   - Real-time sync status dashboard
   - Conflict resolution interface

2. **Performance**
   - Optimistic UI updates
   - Background sync with notifications
   - Progressive loading for large datasets

3. **User Experience**
   - Sync templates and presets
   - Bulk operations
   - Advanced filtering and search

## API Limitations

### WooCommerce REST API v3

- **Rate Limit**: Varies by hosting provider
- **Batch Size**: Recommended 100 items per request
- **Timeout**: Default 15 seconds (configurable)
- **Authentication**: HTTP Basic Auth (Consumer Key/Secret)

### Known Limitations

1. **Cost Data**: WooCommerce doesn't track product costs
2. **Serial Numbers**: Limited serial number support in WooCommerce
3. **Custom Fields**: Requires custom attribute mapping
4. **Complex Products**: Variable/bundle products need special handling

## Testing

### Unit Testing

```typescript
import { mapWooCommerceProductToPos } from '@/lib/woocommerce-client';

describe('Product Mapping', () => {
  it('should map WooCommerce product to POS product', () => {
    const wooProduct = {
      id: 123,
      name: 'Test Product',
      sku: 'TEST-123',
      regular_price: '99.99',
      // ... other fields
    };
    
    const posProduct = mapWooCommerceProductToPos(wooProduct);
    
    expect(posProduct.id).toBe('123');
    expect(posProduct.name).toBe('Test Product');
    expect(posProduct.price).toBe(99.99);
  });
});
```

### Integration Testing

```typescript
import { testConnection } from '@/lib/woocommerce-sync';

describe('WooCommerce Integration', () => {
  it('should connect to WooCommerce API', async () => {
    const result = await testConnection();
    expect(result.connected).toBe(true);
  });
});
```

## Support & Contributing

For issues, questions, or contributions related to the WooCommerce integration:

1. Check this documentation first
2. Review the code in `src/lib/woocommerce-*.ts`
3. Test with the WooCommerce API playground
4. Check WooCommerce REST API documentation

## References

- [WooCommerce REST API Documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WooCommerce API Authentication](https://developer.woocommerce.com/docs/woocommerce-rest-api/)
- [@woocommerce/woocommerce-rest-api NPM Package](https://www.npmjs.com/package/@woocommerce/woocommerce-rest-api)

## Changelog

### Version 1.0.0 (Current)
- Initial WooCommerce integration
- Product, category, customer, and order sync
- Settings UI for configuration
- Data mapping between WooCommerce and POS formats
- Connection testing and validation
