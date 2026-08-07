# 🚀 Deployment Prompts

> **Purpose**: Templates for using AI to deploy, configure, and troubleshoot production environments.  
> **When to use**: When setting up CI/CD, deploying to hosting, or debugging production issues.

---

## Prompt Templates

### 1. Initial Deployment Setup

```
Set up deployment for our hackathon project.

Project type: [Next.js / Vite / Express / etc.]
Target platform: [Vercel / Railway / Netlify / etc.]

Requirements:
- Automatic deploys on git push to main
- Preview deploys on pull requests
- Environment variables management
- Custom domain (if applicable)
- SSL certificate (automatic)

Environment variables needed:
- [VAR_NAME]: [purpose — DO NOT include actual values]

Please provide:
1. Step-by-step deployment setup
2. Configuration files needed (vercel.json, railway.json, etc.)
3. Environment variable setup instructions
4. Build command and output directory
5. Post-deployment verification steps
```

### 2. Environment Configuration

```
Configure environment variables for [environment].

Variables to set:
| Variable | Purpose | Required |
|---|---|---|
| DATABASE_URL | Database connection string | Yes |
| OPENAI_API_KEY | AI API access | Yes |
| NEXT_PUBLIC_APP_URL | Application URL | Yes |
| BREETH_API_KEY | Memory service | Conditional |

Please provide:
1. .env.local template (without actual values)
2. .env.example file for documentation
3. Verification script to check all vars are set
4. Which variables need NEXT_PUBLIC_ prefix
```

### 3. Production Debugging

```
We're experiencing an issue in production.

Environment: [Vercel / Railway / etc.]
URL: [production URL]

Issue:
- Description: [what's wrong]
- When it started: [approximate time]
- Affected users: [all / some / specific conditions]

Working in development: [yes/no]
Recent deploys: [yes — what changed / no]

Available diagnostics:
- Build logs: [available / not available]
- Runtime logs: [available / not available]
- Error tracking: [Sentry / none]

Please help diagnose:
1. Is this a build issue, runtime issue, or infrastructure issue?
2. What logs should I check?
3. What are the most likely causes?
4. How do I roll back if needed?
```

### 4. Pre-Submission Deployment Checklist

```
Final deployment check before hackathon submission.

Please verify:
1. Production URL is accessible
2. All features work in production (not just dev)
3. Environment variables are set correctly
4. No development-only code in production
5. Build completes without warnings
6. Performance is acceptable (Lighthouse score)
7. SSL certificate is valid
8. CORS is configured correctly
9. API rate limits are appropriate
10. Error tracking is enabled (if set up)
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All features working in development
- [ ] TypeScript builds without errors (`npm run build`)
- [ ] No console errors in production build
- [ ] Environment variables documented in `.env.example`
- [ ] `.env.local` is in `.gitignore`
- [ ] README has deployment instructions

### Deployment
- [ ] Hosting platform account created
- [ ] Repository connected to hosting
- [ ] Environment variables set on hosting platform
- [ ] Build command configured
- [ ] Output directory configured
- [ ] Custom domain (if applicable)

### Post-Deployment
- [ ] Production URL accessible
- [ ] All pages load without errors
- [ ] API endpoints respond correctly
- [ ] External integrations work (AI, Breeth, DB)
- [ ] Mobile responsive in production
- [ ] Performance acceptable (LCP < 2.5s)
- [ ] Share production URL with team

---

## Platform-Specific Notes

### Vercel
```bash
# Deploy from CLI
npx vercel --prod

# Environment variables
npx vercel env add VARIABLE_NAME

# Check build logs
npx vercel logs [deployment-url]
```

### Railway
```bash
# Deploy from CLI
railway up

# Environment variables
railway variables set VARIABLE_NAME=value

# Check logs
railway logs
```

### Netlify
```bash
# Deploy from CLI
npx netlify deploy --prod

# Environment variables set via dashboard
```

---

## Common Deployment Issues

| Issue | Cause | Fix |
|---|---|---|
| Build fails | TypeScript errors ignored in dev | Fix all TS errors |
| 404 on routes | SPA routing not configured | Add rewrite rules |
| API returns 500 | Missing env vars in production | Set vars on platform |
| CORS errors | Different domains for frontend/API | Configure CORS headers |
| Slow cold starts | Serverless function overhead | Optimize function size |
| Missing images | Relative paths break | Use absolute paths or public/ |

---

## Best Practices

1. **Deploy early** — Don't wait until the last hour
2. **Use preview deploys** — Test before promoting to production
3. **Never commit secrets** — Use environment variables
4. **Keep a .env.example** — Document what variables are needed
5. **Test in production** — Dev and production are different environments
6. **Have a rollback plan** — Know how to revert to the last working deploy

---

*Last updated: 2026-08-07T03:54:00+05:30*
