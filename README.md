# Outdoors

Hi! Outdoors is a high-concurrency reservation engine for local adventure and guided tours. The backend is currently built with a NestJS architecture featuring

1. Stateless JWT authentication.
2. Role-based access control.
3. Database-level transaction limits to prevent overbooking.
4. A Redis cache-aside implementation for rapid tour retrieval.
5. An idempotent BullMQ background queue for transactional SMS notifications.

Upcoming features include:

1. Advanced tour filtering by category and date range.
2. API documentation via Swagger.
3. A simulated payment gateway integration.
