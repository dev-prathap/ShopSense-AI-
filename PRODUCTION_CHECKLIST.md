# 🚀 Production Deployment Checklist

## 🔒 **1. SECURITY & ENVIRONMENT SETUP**

### **Environment Variables (CRITICAL)**
```bash
# Required for Production
DATABASE_URL="postgresql://user:password@host:5432/dbname"
OPENAI_API_KEY="sk-..."
SHOPIFY_API_KEY="your_shopify_key"
SHOPIFY_API_SECRET="your_shopify_secret"
SHOPIFY_APP_URL="https://your-domain.com"
APP_SIGNING_SECRET="32+ character random string"
APP_AUTH_SECRET="32+ character random string"
CRON_SECRET="random_string_for_cron_security"

# Recommended for Production
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
EMAIL_SERVICE_URL="https://api.resend.com/emails"  # or SendGrid, Postmark
EMAIL_API_KEY="re_..."
SHOPIFY_APP_HANDLE="neryn"  # App handle from Shopify Partners Dashboard — drives Managed Pricing URL

# OAuth (if using Google login)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="https://your-domain.com/api/auth/google/callback"
```

### **Security Hardening**
- [ ] Generate strong random secrets (min 32 chars) for APP_SIGNING_SECRET, APP_AUTH_SECRET
- [ ] Configure SHOPIFY_APP_HANDLE to match the handle in Shopify Partners Dashboard
- [ ] Declare pricing plans (Starter $49 / Growth $79 / Pro $129) in Partners Dashboard → Managed Pricing
- [ ] Configure CORS properly for your domain
- [ ] Enable HTTPS everywhere
- [ ] Set up Content Security Policy (CSP) headers
- [ ] Configure secure cookies in production

---

## 🗄️ **2. DATABASE SETUP**

### **Production Database**
- [ ] Set up PostgreSQL with pgvector extension
- [ ] Configure connection pooling (recommended: 20-50 connections)
- [ ] Set up read replicas for analytics if needed
- [ ] Configure automated backups (daily + WAL archiving)

### **Database Migrations**
```bash
# Run in production
npx prisma migrate deploy
npx prisma generate
```

### **Database Indexes (Performance)**
```sql
-- Add these indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_messages_conversation_created"
ON "Message" ("conversationId", "createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_conversations_store_updated"
ON "Conversation" ("storeId", "updatedAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_products_store_handle"
ON "Product" ("storeId", "handle");
```

---

## 📧 **3. EMAIL SERVICE SETUP**

### **Choose Email Provider**
- [ ] **Resend** (Recommended): Simple, developer-friendly
- [ ] **SendGrid**: Enterprise-grade with analytics
- [ ] **Postmark**: Fast transactional emails
- [ ] **Amazon SES**: Cost-effective for high volume

### **Email Configuration Example (Resend)**
```bash
EMAIL_SERVICE_URL="https://api.resend.com/emails"
EMAIL_API_KEY="re_AbCd..."  # Get from resend.com
```

---

## 🛠️ **4. EXTERNAL SERVICES**

### **Redis (Rate Limiting & Caching)**
- [ ] Set up Upstash Redis (recommended) or self-hosted
- [ ] Configure connection strings in environment
- [ ] Test rate limiting functionality

### **OpenAI API Setup**
- [ ] Set up billing account with OpenAI
- [ ] Configure usage limits and monitoring
- [ ] Set up API key with proper permissions

### **Shopify App Setup**
- [ ] Create Shopify Partner account
- [ ] Register your app in Partner dashboard
- [ ] Configure OAuth scopes: `read_products,read_orders,read_customers`
- [ ] Set up webhook endpoints
- [ ] Submit app for review (if public)

---

## 🔄 **5. MONITORING & LOGGING**

### **Application Monitoring**
- [ ] Set up **Sentry** for error tracking
- [ ] Configure **Vercel Analytics** or **Google Analytics**
- [ ] Set up **LogTail** or **DataDog** for structured logging
- [ ] Create health check endpoint monitoring

### **Database Monitoring**
- [ ] Set up connection pool monitoring
- [ ] Configure slow query logging
- [ ] Set up disk space alerts
- [ ] Monitor backup status

### **Custom Health Checks**
```typescript
// Add to /api/health/route.ts
export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis (if configured)
    // Check OpenAI API

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🧪 **6. TESTING & VALIDATION**

### **Pre-Production Testing**
- [ ] **Load Testing**: Test with 100+ concurrent users
- [ ] **Database Load**: Test with 10,000+ products
- [ ] **Rate Limiting**: Verify auth protection works
- [ ] **Webhook Security**: Test invalid signatures are rejected
- [ ] **Email Delivery**: Test handoff notifications
- [ ] **Billing Integration**: Test subscription flows

### **Manual Testing Checklist**
- [ ] Shopify app installation flow
- [ ] Product catalog sync (large stores)
- [ ] Chat widget functionality
- [ ] Dashboard authentication
- [ ] Billing subscription + webhooks
- [ ] Human handoff notifications
- [ ] Mobile responsiveness

---

## 🚀 **7. DEPLOYMENT CONFIGURATION**

### **Vercel Deploy Settings**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### **Performance Optimization**
- [ ] Enable Vercel Edge Functions for widget
- [ ] Configure CDN for static assets
- [ ] Set up image optimization
- [ ] Enable gzip compression
- [ ] Configure proper cache headers

---

## 📊 **8. ANALYTICS & BUSINESS METRICS**

### **Key Metrics to Track**
- [ ] Daily/Monthly Active Stores
- [ ] Message volume per store
- [ ] Conversion rates (chat → purchase)
- [ ] Revenue attribution
- [ ] Support ticket reduction
- [ ] Customer satisfaction scores

### **Set up Analytics**
```typescript
// Add to your analytics service
export const trackEvent = (event: string, properties: any) => {
  // Send to Mixpanel, Amplitude, or PostHog
  analytics.track(event, properties);
};
```

---

## 📝 **9. DOCUMENTATION**

### **Create Documentation**
- [ ] **API Documentation**: OpenAPI/Swagger spec
- [ ] **Integration Guide**: For store owners
- [ ] **Troubleshooting Guide**: Common issues
- [ ] **Webhook Documentation**: For developers
- [ ] **Privacy Policy**: GDPR compliance
- [ ] **Terms of Service**: Usage terms

---

## 🔄 **10. BACKUP & DISASTER RECOVERY**

### **Backup Strategy**
- [ ] **Database**: Daily automated backups + WAL archiving
- [ ] **Application Code**: Git repository with tags
- [ ] **Environment Config**: Secure backup of env vars
- [ ] **User Data**: Customer conversation backups

### **Recovery Testing**
- [ ] Test database restore procedures
- [ ] Document rollback procedures
- [ ] Set up staging environment for testing
- [ ] Create incident response playbook

---

## 🎯 **11. GO-LIVE CHECKLIST**

### **Final Pre-Launch Steps**
- [ ] **Domain Setup**: Configure custom domain
- [ ] **SSL Certificates**: Ensure HTTPS everywhere
- [ ] **DNS Configuration**: Set up proper DNS records
- [ ] **Shopify App Store**: Submit for review (if public)
- [ ] **Legal Review**: Terms, Privacy Policy, GDPR
- [ ] **Performance Baseline**: Record initial metrics

### **Launch Day**
- [ ] Deploy to production
- [ ] Run health checks
- [ ] Monitor error rates
- [ ] Check all integrations
- [ ] Notify stakeholders
- [ ] Begin monitoring dashboards

### **Post-Launch (Week 1)**
- [ ] Monitor performance daily
- [ ] Check error logs
- [ ] Review user feedback
- [ ] Optimize based on real usage
- [ ] Document any issues found

---

## 🆘 **EMERGENCY CONTACTS & PROCEDURES**

### **Service Status Pages**
- Vercel: https://vercel-status.com
- OpenAI: https://status.openai.com
- Shopify: https://status.shopify.com

### **Emergency Procedures**
1. **Database Issues**: Have connection strings for backup DB ready
2. **API Rate Limits**: Monitor OpenAI usage and have fallback responses
3. **Payment Issues**: Billing is via Shopify — direct merchants to Shopify Support; check `app_subscriptions/update` webhook delivery in Partners Dashboard
4. **Security Incident**: Disable affected endpoints, rotate secrets

---

## 📈 **SUCCESS METRICS**

### **Month 1 Goals**
- [ ] 10+ active stores
- [ ] 95%+ uptime
- [ ] <2s average response time
- [ ] Zero security incidents

### **Month 3 Goals**
- [ ] 50+ active stores
- [ ] Positive ROI for customers
- [ ] <1% error rate
- [ ] Customer testimonials

---

**🎯 Total Checklist Items: 75+**

**Recommended Timeline: 2-3 weeks for complete production setup**