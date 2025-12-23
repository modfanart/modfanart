import { postgresClient, DB } from "../lib/db/config"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { CreateTableCommand } from "@aws-sdk/client-dynamodb"

async function setupPostgresTables() {
  try {
    // Create users table
    await postgresClient.sql`
      CREATE TABLE IF NOT EXISTS ${DB.USERS} (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        profile_image_url TEXT,
        bio TEXT,
        website TEXT,
        social_links JSONB,
        subscription JSONB,
        settings JSONB
      )
    `

    // Create submissions table
    await postgresClient.sql`
      CREATE TABLE IF NOT EXISTS ${DB.SUBMISSIONS} (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        original_ip VARCHAR(255) NOT NULL,
        tags JSONB NOT NULL,
        status VARCHAR(50) NOT NULL,
        image_url TEXT NOT NULL,
        license_type VARCHAR(100) NOT NULL,
        submitted_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        user_id VARCHAR(36) NOT NULL REFERENCES ${DB.USERS}(id),
        analysis JSONB,
        review_notes TEXT,
        reviewed_by VARCHAR(36),
        reviewed_at TIMESTAMP
      )
    `

    // Create licenses table
    await postgresClient.sql`
      CREATE TABLE IF NOT EXISTS ${DB.LICENSES} (
        id VARCHAR(36) PRIMARY KEY,
        submission_id VARCHAR(36) NOT NULL REFERENCES ${DB.SUBMISSIONS}(id),
        artist_id VARCHAR(36) NOT NULL REFERENCES ${DB.USERS}(id),
        brand_id VARCHAR(36) REFERENCES ${DB.USERS}(id),
        terms JSONB NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        expires_at TIMESTAMP,
        revenue_split DECIMAL(5,2) NOT NULL,
        usage_rights TEXT NOT NULL,
        territories JSONB,
        restrictions TEXT
      )
    `

    // Create orders table
    await postgresClient.sql`
      CREATE TABLE IF NOT EXISTS ${DB.ORDERS} (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) REFERENCES ${DB.USERS}(id),
        status VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        items JSONB NOT NULL,
        shipping_address JSONB,
        billing_address JSONB,
        payment_intent_id VARCHAR(255),
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        notes TEXT
      )
    `

    // Create analytics table
    await postgresClient.sql`
      CREATE TABLE IF NOT EXISTS ${DB.ANALYTICS} (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) REFERENCES ${DB.USERS}(id),
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL,
        ip_address VARCHAR(50),
        user_agent TEXT,
        referrer TEXT
      )
    `

    console.log("PostgreSQL tables created successfully")
  } catch (error) {
    console.error("Error creating PostgreSQL tables:", error)
    throw error
  }
}

async function setupDynamoDBTables() {
  const dynamoClient = new DynamoDBClient({
    region: "us-east-1", // Update with your region
  })

  try {
    // Create products table
    await dynamoClient.send(
      new CreateTableCommand({
        TableName: DB.PRODUCTS,
        KeySchema: [
          { AttributeName: "pk", KeyType: "HASH" },
          { AttributeName: "sk", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
          { AttributeName: "pk", AttributeType: "S" },
          { AttributeName: "sk", AttributeType: "S" },
          { AttributeName: "gsi1pk", AttributeType: "S" },
          { AttributeName: "gsi1sk", AttributeType: "S" },
          { AttributeName: "gsi2pk", AttributeType: "S" },
          { AttributeName: "gsi2sk", AttributeType: "S" },
          { AttributeName: "gsi3pk", AttributeType: "S" },
          { AttributeName: "gsi3sk", AttributeType: "S" },
          { AttributeName: "slug", AttributeType: "S" },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: "GSI1",
            KeySchema: [
              { AttributeName: "gsi1pk", KeyType: "HASH" },
              { AttributeName: "gsi1sk", KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
          {
            IndexName: "GSI2",
            KeySchema: [
              { AttributeName: "gsi2pk", KeyType: "HASH" },
              { AttributeName: "gsi2sk", KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
          {
            IndexName: "GSI3",
            KeySchema: [
              { AttributeName: "gsi3pk", KeyType: "HASH" },
              { AttributeName: "gsi3sk", KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
          {
            IndexName: "SlugIndex",
            KeySchema: [{ AttributeName: "slug", KeyType: "HASH" }],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      }),
    )

    // Create storefronts table
    await dynamoClient.send(
      new CreateTableCommand({
        TableName: DB.STOREFRONTS,
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [
          { AttributeName: "id", AttributeType: "S" },
          { AttributeName: "owner_id", AttributeType: "S" },
          { AttributeName: "storefront_type", AttributeType: "S" },
          { AttributeName: "slug", AttributeType: "S" },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: "OwnerIndex",
            KeySchema: [{ AttributeName: "owner_id", KeyType: "HASH" }],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
          {
            IndexName: "TypeIndex",
            KeySchema: [{ AttributeName: "storefront_type", KeyType: "HASH" }],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
          {
            IndexName: "SlugIndex",
            KeySchema: [{ AttributeName: "slug", KeyType: "HASH" }],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      }),
    )

    console.log("DynamoDB tables created successfully")
  } catch (error) {
    console.error("Error creating DynamoDB tables:", error)
    throw error
  }
}

async function main() {
  try {
    await setupPostgresTables()
    await setupDynamoDBTables()
    console.log("Database setup completed successfully")
  } catch (error) {
    console.error("Database setup failed:", error)
  } finally {
    process.exit()
  }
}

main()

