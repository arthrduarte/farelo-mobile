│ Here is Claude's plan: │
│ ╭─────────────────────────────────────────────────────────────────────────────────────╮ │
│ │ Scalable Likes & Comments Architecture Plan │ │
│ │ │ │
│ │ 🚨 Current Scalability Issues │ │
│ │ │ │
│ │ 1. N+1 Query Problem in LogCard │ │
│ │ │ │
│ │ - Each LogCard makes additional query to fetch likes profiles (useLikesForLog) │ │
│ │ - With 100 log cards = 100+ extra database queries │ │
│ │ - This will cause severe performance issues as user base grows │ │
│ │ │ │
│ │ 2. Over-fetching in EnhancedLog │ │
│ │ │ │
│ │ - EnhancedLog includes ALL likes and comments for each log │ │
│ │ - A log with 1000 likes loads 1000 like records unnecessarily │ │
│ │ - Exponential data transfer growth │ │
│ │ │ │
│ │ 3. Missing Aggregation │ │
│ │ │ │
│ │ - No pre-computed counts at database level │ │
│ │ - Client-side counting is inefficient and inconsistent │ │
│ │ │ │
│ │ 4. Lack of Pagination │ │
│ │ │ │
│ │ - Likes/comments screens load ALL records at once │ │
│ │ - Will crash with large datasets │ │
│ │ │ │
│ │ 🏗️ Recommended Scalable Architectur │ │
│ │ │ │
│ │ Phase 1: Database Schema Optimization │ │
│ │ │ │
│ │ Add Aggregated Counts │ │
│ │ │ │
│ │ ALTER TABLE logs │ │
│ │ ADD COLUMN likes_count INTEGER DEFAULT 0, │ │
│ │ ADD COLUMN comments_count INTEGER DEFAULT 0; │ │
│ │ │ │
│ │ -- Create triggers or use database functions to maintain counts │ │
│ │ │ │
│ │ Add Recent Likes Table │ │
│ │ │ │
│ │ CREATE TABLE log_recent_likes ( │ │
│ │ log_id UUID REFERENCES logs(id), │ │
│ │ profile_id UUID REFERENCES profiles(id), │ │
│ │ profile_data JSONB, -- denormalized profile data │ │
│ │ created_at TIMESTAMPTZ DEFAULT NOW(), │ │
│ │ PRIMARY KEY (log_id, profile_id) │ │
│ │ ); │ │
│ │ │ │
│ │ -- Keep only last 3-5 likes per log for avatar display │ │
│ │ │ │
│ │ Phase 2: API Architecture Changes │ │
│ │ │ │
│ │ Optimized Log Feed Query │ │
│ │ │ │
│ │ - Fetch logs with pre-computed counts │ │
│ │ - Include recent likes (max 3-5) with profile data │ │
│ │ - Remove individual likes/comments arrays from EnhancedLog │ │
│ │ │ │
│ │ Dedicated Endpoints │ │
│ │ │ │
│ │ - GET /logs/{id}/likes?page=1&limit=20 - Paginated likes │ │
│ │ - GET /logs/{id}/comments?page=1&limit=20 - Paginated comments │ │
│ │ - POST/DELETE /logs/{id}/like - Toggle like with count updates │ │
│ │ │ │
│ │ Phase 3: Frontend Architecture │ │
│ │ │ │
│ │ New Data Structure │ │
│ │ │ │
│ │ type OptimizedLog = Log & { │ │
│ │ profile: Profile; │ │
│ │ recipe: Recipe; │ │
│ │ likes_count: number; │ │
│ │ comments_count: number; │ │
│ │ recent_likes: Profile[]; // Max 3-5 profiles for avatars │ │
│ │ user_has_liked: boolean; │ │
│ │ }; │ │
│ │ │ │
│ │ Caching Strategy │ │
│ │ │ │
│ │ - Use React Query for intelligent caching │ │
│ │ - Invalidate specific queries on mutations │ │
│ │ - Implement optimistic updates for better UX │ │
│ │ │ │
│ │ Lazy Loading │ │
│ │ │ │
│ │ - Load likes/comments only when screens are opened │ │
│ │ - Implement infinite scrolling for large lists │ │
│ │ - Cache frequently accessed data │ │
│ │ │ │
│ │ Phase 4: Performance Optimizations │ │
│ │ │ │
│ │ Database Indexes │ │
│ │ │ │
│ │ CREATE INDEX idx_log_likes_log_id ON log_likes(log_id); │ │
│ │ CREATE INDEX idx_log_comments_log_id ON log_comments(log_id); │ │
│ │ CREATE INDEX idx_logs_likes_count ON logs(likes_count DESC); │ │
│ │ │ │
│ │ CDN & Caching │ │
│ │ │ │
│ │ - Cache profile images via CDN │ │
│ │ - Implement Redis for frequently accessed data │ │
│ │ - Use database read replicas for analytics │ │
│ │ │ │
│ │ Real-time Updates │ │
│ │ │ │
│ │ - WebSocket connections for live like/comment updates │ │
│ │ - Event-driven architecture for count synchronization │ │
│ │ │ │
│ │ 🎯 Implementation Benefits │ │
│ │ │ │
│ │ 1. Performance: Single query loads all needed data │ │
│ │ 2. Scalability: Handles millions of likes/comments efficiently │ │
│ │ 3. UX: Faster loading, optimistic updates │ │
│ │ 4. Cost: Reduced database load and data transfer │ │
│ │ 5. Maintainability: Cleaner separation of concerns │ │
│ │ │ │
│ │ 📊 Expected Performance Improvements │ │
│ │ │ │
│ │ - Feed Loading: 90% faster (single query vs N+1) │ │
│ │ - Data Transfer: 80% reduction (counts vs full arrays) │ │
│ │ - Database Load: 75% reduction (aggregated queries) │ │
│ │ - Memory Usage: 60% reduction (efficient data structures)
