# 🔐 SECURITY POLICY

## Reporting Security Vulnerabilities

**DO NOT** create public GitHub issues for security vulnerabilities.

### How to Report

Email security concerns to: **security@clisonix.com** (or your designated security contact)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

- **Critical**: Within 24 hours
- **High**: Within 72 hours  
- **Medium/Low**: Within 1 week

---

## Secrets Management

### ⚠️ NEVER commit these to git:

- ❌ Passwords, API keys, tokens
- ❌ Private keys, certificates
- ❌ Database credentials
- ❌ Payment processor secrets (Stripe, PayPal)
- ❌ Business information (IBAN, account numbers)
- ❌ JWT secret keys
- ❌ Webhook URLs with embedded tokens

### ✅ Proper Secrets Management

#### Development Environment

1. **Use .secrets file** (local only, never commit)
   ```bash
   cp .secrets.template .secrets
   # Edit .secrets with your values
   # .secrets is in .gitignore
   ```

2. **Verify .gitignore**
   ```bash
   # Check .secrets is ignored
   git check-ignore .secrets
   # Should output: .secrets
   ```

#### Production Environment

**Use Docker Secrets** (recommended)

```bash
# Create secret files
./scripts/setup-secrets.sh   # Linux/Mac
# or
.\scripts\setup-secrets.ps1  # Windows

# Start with secrets
docker-compose -f docker-compose.secrets.yml up -d
```

**Or use a Secrets Manager:**

- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secret Manager

---

## Secret Rotation Policy

### Mandatory Rotation Schedule

| Secret Type | Rotation Frequency |
|-------------|-------------------|
| Database passwords | Every 90 days |
| API keys | Every 180 days |
| JWT secrets | Every 30 days |
| TLS/SSL certificates | Before expiry |
| Service account keys | Every 90 days |

### Emergency Rotation

Immediately rotate if:
- ❌ Secret exposed in commit history
- ❌ Suspected compromise
- ❌ Employee/contractor leaves
- ❌ Security incident

---

## Automated Security Scanning

### Pre-commit Hooks

```bash
# Install pre-commit hook (blocks commits with secrets)
cp scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Manual Scan

```bash
# Scan codebase for exposed secrets
python scripts/scan-secrets.py

# Expected output:
# ✅ No exposed secrets found!
```

### CI/CD Integration

GitHub Actions automatically runs on every push:
- 🔍 **Gitleaks**: Secret detection
- 🛡️ **Trivy**: Vulnerability scanning
- 🐳 **Docker Security**: Image scanning
- ✅ **Environment Check**: Verify no hardcoded secrets

---

## Environment Configuration

### Development (.env.development)

```bash
# Development - OK to use weak credentials locally
POSTGRES_PASSWORD=dev123
REDIS_PASSWORD=dev123
JWT_SECRET_KEY=dev-secret-key-change-in-prod
```

### Staging (.env.staging)

```bash
# Staging - Use vault/secrets manager
POSTGRES_PASSWORD=${VAULT_POSTGRES_PASSWORD}
REDIS_PASSWORD=${VAULT_REDIS_PASSWORD}
JWT_SECRET_KEY=${VAULT_JWT_SECRET}
```

### Production (.env.production)

```bash
# Production - MUST use secrets manager
# DO NOT hardcode any secrets
POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password
REDIS_PASSWORD_FILE=/run/secrets/redis_password
JWT_SECRET_KEY_FILE=/run/secrets/jwt_secret_key
```

---

## Docker Compose Best Practices

### ❌ DO NOT DO THIS:

```yaml
environment:
  POSTGRES_PASSWORD: clisonix123  # NEVER HARDCODE!
  STRIPE_SECRET_KEY: sk_live_abc123  # EXPOSED!
```

### ✅ DO THIS INSTEAD:

```yaml
# Use environment variables
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}

# Or use Docker secrets (best for production)
secrets:
  - postgres_password
environment:
  POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
```

---

## Audit & Compliance

### Regular Security Audits

- [ ] Weekly: Run `python scripts/scan-secrets.py`
- [ ] Monthly: Review access logs
- [ ] Quarterly: Full security audit
- [ ] Annually: Penetration testing

### Access Control

- ✅ Principle of least privilege
- ✅ Multi-factor authentication (MFA)
- ✅ Regular access reviews
- ✅ Immediate revocation on termination

### Logging & Monitoring

- ✅ Log all authentication attempts
- ✅ Alert on suspicious activity
- ✅ Monitor for secret exposure
- ✅ Track configuration changes

---

## Encryption

### At Rest

- ✅ Database encryption (PostgreSQL: pgcrypto)
- ✅ File storage encryption (MinIO/S3 with KMS)
- ✅ Backup encryption

### In Transit

- ✅ TLS 1.3 for all external communication
- ✅ mTLS for service-to-service
- ✅ No HTTP, only HTTPS

### Application Level

- ✅ Bcrypt for password hashing (cost factor: 12)
- ✅ AES-256-GCM for sensitive data
- ✅ JWT with RS256 (not HS256 in production)

---

## Known Vulnerabilities

### Currently Addressed

- ✅ No secrets in git history
- ✅ Pre-commit hooks prevent exposure
- ✅ Automated scanning in CI/CD
- ✅ Secrets management system in place

### Ongoing Monitoring

We continuously monitor:
- CVE databases
- GitHub Security Advisories
- Dependency vulnerabilities (Dependabot)
- Docker image vulnerabilities (Trivy)

---

## Security Checklist for Developers

Before every deployment:

- [ ] No secrets in code/config files
- [ ] .secrets file is in .gitignore
- [ ] secrets/ directory is in .gitignore
- [ ] Pre-commit hook is installed
- [ ] Ran `python scripts/scan-secrets.py` successfully
- [ ] All secrets use environment variables or secrets manager
- [ ] TLS certificates are valid
- [ ] Dependencies are up to date
- [ ] Security scan GitHub Action passed
- [ ] Production uses Docker secrets or Vault

---

## Incident Response Plan

### If a Secret is Exposed

1. **Immediate Actions** (within 1 hour)
   - ⚠️ Rotate the exposed secret immediately
   - 🔒 Lock affected accounts/services
   - 📝 Document the exposure

2. **Investigation** (within 24 hours)
   - 🔍 Identify scope of exposure
   - 📊 Review access logs
   - 🛡️ Check for unauthorized access

3. **Remediation** (within 48 hours)
   - ✅ Rotate all potentially affected secrets
   - 🔐 Update secrets management process
   - 📧 Notify affected parties (if required by law/contract)

4. **Post-Incident** (within 1 week)
   - 📝 Complete incident report
   - 🎓 Team training on lessons learned
   - 🔧 Implement preventive measures

---

## Contact

- **Security Issues**: security@clisonix.com
- **General Support**: support@clisonix.com
- **Emergency Contact**: +49 XXX XXXXXXX (24/7 on-call)

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Docker Secrets Documentation](https://docs.docker.com/engine/swarm/secrets/)

---

**Last Updated**: December 16, 2025  
**Version**: 1.0.0  
**Review Frequency**: Quarterly
