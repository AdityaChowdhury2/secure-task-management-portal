# PrismaQueryBuilder - Lead Table Usage Guide

The `PrismaQueryBuilder` is a powerful utility class that provides a fluent interface for building complex database queries with pagination, filtering, sorting, and searching capabilities. This guide focuses on using it with the Lead table.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Available Methods](#available-methods)
- [Query Parameters](#query-parameters)
- [Examples](#examples)
- [Lead Table Schema](#lead-table-schema)
- [Best Practices](#best-practices)

## Basic Usage

```typescript
import { PrismaQueryBuilder } from "../builder/query.builder";
import { prisma } from "../config/prisma";

const getLeads = async (query: Record<string, any>) => {
  const queryBuilder = new PrismaQueryBuilder(prisma.lead, query);

  const result = await queryBuilder
    .search(["customerName", "customerEmail", "customerPhone"])
    .filter()
    .sort()
    .paginate()
    .fields()
    .include({ employee: true, items: { include: { files: true, uom: true } } })
    .buildWithMeta();

  return result;
};
```

## Available Methods

### 1. `search(fields: string[])`

Performs a case-insensitive search across specified fields.

```typescript
// Search in customer name, email, phone, and job description
.search([
  "customerName",
  "customerEmail",
  "customerPhone",
  "jobDescription"
])
```

### 2. `filter()`

Applies filters based on query parameters. Supports comparison operators.

```typescript
// Basic filtering
.filter()

// Query parameters:
// status=RECEIVED
// emirate=Dubai
// country=UAE
// pricing=gt:1000
// createdAt=gte:2024-01-01
```

### 3. `sort()`

Sorts results by specified fields.

```typescript
// Default: sorts by createdAt desc
.sort()

// Custom sorting:
// sort=customerName,asc
// sort=-createdAt (descending)
// sort=status,asc&sort=pricing,desc
```

### 4. `paginate()`

Handles pagination with page and limit parameters.

```typescript
// Default: page=1, limit=10
.paginate()

// Custom pagination:
// page=2&limit=20
```

### 5. `fields()`

Selects specific fields to return.

```typescript
// Return all fields (default)
.fields()

// Select specific fields:
// fields=customerName,customerEmail,status,pricing
```

### 6. `include(includeArgs)`

Includes related data using Prisma's include syntax.

```typescript
.include({
  employee: true,
  items: {
    include: {
      files: true,
      uom: true
    }
  }
})
```

### 7. `buildWithMeta()`

Executes the query and returns data with pagination metadata.

```typescript
const result = await queryBuilder.buildWithMeta();

// Returns:
// {
//   data: Lead[],
//   meta: {
//     total: number,
//     page: number,
//     limit: number,
//     pages: number
//   }
// }
```

## Query Parameters

### Search Parameters

- `searchTerm`: String to search across specified fields

### Filter Parameters

All Lead table fields can be used as filters:

#### Basic Filters

- `status`: Lead status (RECEIVED, INPROGRESS, COMPLETED, DELIVERED, CANCELED)
- `emirate`: Emirate name
- `country`: Country name
- `employeeId`: Employee ID
- `isDeleted`: Boolean (false by default)

#### Comparison Operators

- `gt:` - Greater than
- `gte:` - Greater than or equal
- `lt:` - Less than
- `lte:` - Less than or equal

Examples:

- `pricing=gt:1000` - Pricing greater than 1000
- `createdAt=gte:2024-01-01` - Created on or after January 1, 2024
- `pricing=lte:5000` - Pricing less than or equal to 5000

### Pagination Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Sorting Parameters

- `sort`: Comma-separated field names with optional direction
  - `sort=customerName` - Ascending by customer name
  - `sort=-createdAt` - Descending by creation date
  - `sort=status,asc&sort=pricing,desc` - Multiple sort fields

### Field Selection

- `fields`: Comma-separated field names to include in response

## Examples

### 1. Basic Lead Listing

```typescript
// GET /api/leads
const query = { page: 1, limit: 10 };
const result = await new PrismaQueryBuilder(prisma.lead, query)
  .sort()
  .paginate()
  .filter()
  .buildWithMeta();
```

### 2. Search Leads by Customer

```typescript
// GET /api/leads?searchTerm=john&page=1&limit=20
const query = { searchTerm: "john", page: 1, limit: 20 };
const result = await new PrismaQueryBuilder(prisma.lead, query)
  .search(["customerName", "customerEmail", "customerPhone"])
  .sort()
  .paginate()
  .filter()
  .buildWithMeta();
```

### 3. Filter by Status and Date Range

```typescript
// GET /api/leads?status=RECEIVED&createdAt=gte:2024-01-01&createdAt=lte:2024-12-31
const query = {
  status: "RECEIVED",
  createdAt: "gte:2024-01-01",
  createdAt: "lte:2024-12-31",
};
const result = await new PrismaQueryBuilder(prisma.lead, query)
  .sort()
  .filter()
  .paginate()
  .buildWithMeta();
```

### 4. High-Value Leads with Employee Info

```typescript
// GET /api/leads?pricing=gt:5000&sort=-pricing&fields=customerName,pricing,status&include=employee
const query = {
  pricing: "gt:5000",
  sort: "-pricing",
  fields: "customerName,pricing,status",
};
const result = await new PrismaQueryBuilder(prisma.lead, query)
  .sort()
  .filter()
  .fields()
  .include({ employee: true })
  .buildWithMeta();
```

### 5. Leads by Employee with Items

```typescript
// GET /api/leads?employeeId=EMP001&include=items
const query = { employeeId: "EMP001" };
const result = await new PrismaQueryBuilder(prisma.lead, query)
  .sort()
  .filter()
  .include({
    employee: true,
    items: {
      include: {
        files: true,
        uom: true,
      },
    },
  })
  .buildWithMeta();
```

### 6. Complex Search with Multiple Filters

```typescript
// GET /api/leads?searchTerm=dubai&status=INPROGRESS&pricing=gt:1000&pricing=lt:10000&sort=customerName,asc&page=2&limit=15
const query = {
  searchTerm: "dubai",
  status: "INPROGRESS",
  pricing: "gt:1000",
  pricing: "lt:10000",
  sort: "customerName,asc",
  page: 2,
  limit: 15,
};
const result = await new PrismaQueryBuilder(prisma.lead, query)
  .search(["customerName", "address", "emirate"])
  .sort()
  .filter()
  .paginate()
  .buildWithMeta();
```

## Lead Table Schema

```typescript
model Lead {
  id             String  @id @default(cuid())
  leadNumber     String  @unique
  customerName   String
  customerEmail  String
  customerPhone  String
  address        String  @db.Text
  emirate        String
  country        String
  trn            String? @db.VarChar(50)
  placeOfSupply  String?
  jobDescription String  @db.Text
  pricing        Decimal @db.Decimal(10, 2)
  status         Status  @default(RECEIVED)
  poNumber       String? @unique
  poDate         DateTime?
  doNumber       String? @unique
  doDate         DateTime?
  isDeleted      Boolean @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  employeeId     String
  employee       User    @relation(fields: [employeeId], references: [employeeId])
  items          Item[]
}
```

### Available Status Values

- `RECEIVED`
- `INPROGRESS`
- `COMPLETED`
- `DELIVERED`
- `CANCELED`

## Best Practices

### 1. Method Chaining Order

Always follow this order for optimal performance:

```typescript
const result = await queryBuilder
  .search() // 1. Apply search first
  .filter() // 2. Apply filters
  .sort() // 3. Apply sorting
  .paginate() // 4. Apply pagination
  .fields() // 5. Select fields
  .include() // 6. Include relations
  .buildWithMeta(); // 7. Execute query
```

### 2. Search Fields Selection

Choose search fields wisely to balance performance and functionality:

```typescript
// Good: Search in commonly used fields
.search(["customerName", "customerEmail", "customerPhone"])

// Avoid: Searching in large text fields without proper indexing
.search(["jobDescription", "address"])
```

### 3. Pagination Limits

Set reasonable limits to prevent performance issues:

```typescript
// Good: Reasonable limit
const query = { limit: 50 };

// Avoid: Very large limits
const query = { limit: 1000 };
```

### 4. Field Selection

Select only needed fields to reduce data transfer:

```typescript
// Good: Select specific fields
const query = { fields: "customerName,status,pricing" };

// Avoid: Selecting all fields when not needed
const query = {}; // Returns all fields
```

### 5. Include Relations Wisely

Only include relations that are actually needed:

```typescript
// Good: Include only needed relations
.include({ employee: true })

// Avoid: Including unnecessary relations
.include({
  employee: true,
  items: {
    include: {
      files: true,
      uom: true
    }
  }
}) // Only if you need all this data
```

### 6. Error Handling

Always handle potential errors:

```typescript
try {
  const result = await queryBuilder
    .search(["customerName"])
    .filter()
    .sort()
    .paginate()
    .buildWithMeta();

  return result;
} catch (error) {
  console.error("Query builder error:", error);
  throw new Error("Failed to fetch leads");
}
```

## Response Format

The `buildWithMeta()` method returns:

```typescript
{
  data: Lead[], // Array of lead records
  meta: {
    total: number,    // Total number of records
    page: number,     // Current page number
    limit: number,    // Items per page
    pages: number     // Total number of pages
  }
}
```

## Performance Tips

1. **Use indexes**: Ensure your database has proper indexes on frequently searched/filtered fields
2. **Limit search fields**: Don't search in too many fields simultaneously
3. **Use field selection**: Only select fields you actually need
4. **Reasonable pagination**: Don't set very high limits
5. **Cache results**: Consider caching for frequently accessed data
6. **Monitor queries**: Use Prisma's query logging to monitor performance

## Troubleshooting

### Common Issues

1. **No results returned**: Check if filters are too restrictive
2. **Performance issues**: Reduce search fields or add database indexes
3. **Memory issues**: Reduce pagination limits
4. **Type errors**: Ensure query parameters match expected types

### Debug Queries

Enable Prisma query logging to debug generated SQL:

```typescript
// In your Prisma client configuration
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
```
